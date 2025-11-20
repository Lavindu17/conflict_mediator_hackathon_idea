import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Bot } from 'lucide-react-native';
import { Message, PartnerRole } from '@/lib/supabase';
import {
  addMessage,
  getMessages,
  getSessionContext,
  updateSessionContext,
  subscribeToMessages,
  getSessionByCode,
  updateSessionStatus,
} from '@/lib/database';
import { sendMessage, GeminiMessage, checkIfReadyForMediation, generateMediation } from '@/lib/gemini';

export default function ChatScreen() {
  const { sessionId, sessionCode, role } = useLocalSearchParams<{
    sessionId: string;
    sessionCode: string;
    role: string;
  }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
  const [conversationHistory, setConversationHistory] = useState<GeminiMessage[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const partnerRole = role as PartnerRole;

  useEffect(() => {
    loadMessages();
    loadContext();

    console.log('Setting up subscription for session:', sessionId, 'role:', partnerRole);
    const subscription = subscribeToMessages(sessionId, (payload) => {
      console.log('Subscription payload received:', payload);
      if (payload.new) {
        const newMessage = payload.new as Message;
        console.log('New message from subscription:', newMessage);
        const canView =
          newMessage.role === partnerRole ||
          newMessage.role === `bot_to_${partnerRole.split('_')[1]}` ||
          newMessage.role === 'bot_general';

        console.log('Can view message:', canView, 'message role:', newMessage.role, 'partner role:', partnerRole);
        if (canView) {
          setMessages((prev) => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            console.log('Message exists in state:', exists);
            if (exists) return prev;
            console.log('Adding message to state');
            return [...prev, newMessage];
          });
        }
      }
    });

    return () => {
      console.log('Unsubscribing from messages');
      subscription.unsubscribe();
    };
  }, [sessionId, partnerRole]);

  const loadMessages = async () => {
    const msgs = await getMessages(sessionId, partnerRole);
    setMessages(msgs);
  };

  const loadContext = async () => {
    const context = await getSessionContext(sessionId, partnerRole);
    if (context && context.conversation_history) {
      setConversationHistory(context.conversation_history as GeminiMessage[]);
    }
  };

  const checkForMediationTrigger = async () => {
    const session = await getSessionByCode(sessionCode);
    if (!session) return;

    const partnerAContext = await getSessionContext(sessionId, 'partner_a');
    const partnerBContext = await getSessionContext(sessionId, 'partner_b');

    if (!partnerAContext || !partnerBContext) return;

    const ready = await checkIfReadyForMediation(
      apiKey,
      partnerAContext.conversation_history as GeminiMessage[],
      partnerBContext.conversation_history as GeminiMessage[]
    );

    if (ready && session.status === 'waiting') {
      await triggerMediation(partnerAContext.conversation_history as GeminiMessage[], partnerBContext.conversation_history as GeminiMessage[]);
    }
  };

  const triggerMediation = async (partnerAHistory: GeminiMessage[], partnerBHistory: GeminiMessage[]) => {
    try {
      await updateSessionStatus(sessionId, 'active');

      const { adviceForA, adviceForB } = await generateMediation(apiKey, partnerAHistory, partnerBHistory);

      await addMessage(sessionId, 'bot_to_a', adviceForA);
      await addMessage(sessionId, 'bot_to_b', adviceForB);

      await updateSessionStatus(sessionId, 'advice_ready');
    } catch (error) {
      console.error('Error during mediation:', error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    if (!apiKey) {
      Alert.alert('API Key Error', 'Gemini API key is not configured');
      return;
    }

    const userMessage = inputText.trim();
    setInputText('');
    setLoading(true);

    try {
      const userMsg = await addMessage(sessionId, partnerRole, userMessage);
      console.log('User message added:', userMsg);

      if (userMsg) {
        setMessages((prev) => [...prev, userMsg]);
      }

      const { response, updatedHistory } = await sendMessage(apiKey, conversationHistory, userMessage);

      setConversationHistory(updatedHistory);
      await updateSessionContext(sessionId, partnerRole, updatedHistory);

      const botRole = `bot_to_${partnerRole.split('_')[1]}` as any;
      const botMsg = await addMessage(sessionId, botRole, response);
      console.log('Bot message added:', botMsg);

      if (botMsg) {
        setMessages((prev) => [...prev, botMsg]);
      }

      setTimeout(() => {
        checkForMediationTrigger();
      }, 1000);
    } catch (error: any) {
      console.error('Error sending message:', error);
      Alert.alert('Error', error.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    Alert.alert(
      'Leave Session',
      'Are you sure you want to leave? You can rejoin with the same session code.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => router.replace('/'),
        },
      ]
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === partnerRole;
    const isBot = item.role.startsWith('bot');

    return (
      <View style={[styles.messageContainer, isUser && styles.messageContainerUser]}>
        {isBot && (
          <View style={styles.botIcon}>
            <Bot size={20} color="#FFFFFF" />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.messageText, isUser && styles.userText]}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#2C3E50" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>CoupleBot Mediator</Text>
          <Text style={styles.headerSubtitle}>Session: {sessionCode}</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Bot size={48} color="#BDC3C7" strokeWidth={2} />
            <Text style={styles.emptyText}>
              Start sharing your perspective with the mediator bot
            </Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Share your thoughts..."
          placeholderTextColor="#95A5A6"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={loading || !inputText.trim()}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Send size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  messageList: {
    padding: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageContainerUser: {
    justifyContent: 'flex-end',
  },
  botIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#E74C3C',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#2C3E50',
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#2C3E50',
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
});
