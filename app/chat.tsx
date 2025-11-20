import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, ArrowLeft, Bot, Sparkles } from 'lucide-react-native';
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
    sendWelcomeMessage();

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

  const sendWelcomeMessage = async () => {
    const msgs = await getMessages(sessionId, partnerRole);
    if (msgs.length === 0) {
      const welcomeText = `Welcome to pairLogic! 👋\n\nI'm your AI mediator, here to help facilitate healthy communication between you and your partner.\n\nHere's how this works:\n\n🔒 **Your messages are completely private** - your partner cannot see what you share with me\n\n💬 **Be honest and open** - the more you share, the better I can help\n\n🎯 **My goal** - to understand both perspectives and offer guidance that helps you both\n\nFeel free to start by telling me what's on your mind or what you'd like to discuss with your partner.`;

      const botRole = `bot_to_${partnerRole.split('_')[1]}` as any;
      const welcomeMsg = await addMessage(sessionId, botRole, welcomeText);
      if (welcomeMsg) {
        setMessages([welcomeMsg]);
      }
    }
  };

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
          <LinearGradient
            colors={['#0EA5E9', '#06B6D4']}
            style={styles.botIcon}
          >
            <Sparkles size={18} color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
        )}
        {isUser ? (
          <LinearGradient
            colors={['#1E293B', '#334155']}
            style={styles.messageBubble}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.userText}>{item.content}</Text>
          </LinearGradient>
        ) : (
          <View style={styles.botBubble}>
            <Text style={styles.messageText}>{item.content}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={0}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.header}
      >
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E293B" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>pairLogic AI</Text>
          <Text style={styles.headerSubtitle}>{sessionCode}</Text>
        </View>
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.statusBadge}
        >
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Active</Text>
        </LinearGradient>
      </LinearGradient>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Bot size={40} color="#64748B" strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>Start Your Conversation</Text>
            <Text style={styles.emptyText}>
              Share your thoughts privately with the AI mediator. Your partner won't see these messages.
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
          style={styles.sendButtonWrapper}
          onPress={handleSend}
          disabled={loading || !inputText.trim()}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={loading || !inputText.trim() ? ['#CBD5E1', '#94A3B8'] : ['#0EA5E9', '#06B6D4']}
            style={styles.sendButton}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send size={20} color="#FFFFFF" strokeWidth={2.5} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
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
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#1E293B',
    borderBottomRightRadius: 6,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: '75%',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    color: '#1E293B',
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1E293B',
    maxHeight: 100,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sendButtonWrapper: {
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
});
