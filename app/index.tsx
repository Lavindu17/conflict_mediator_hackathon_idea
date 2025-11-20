import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { MessageCircle, Plus, LogIn, RefreshCw } from 'lucide-react-native';

export default function HomeScreen() {
  const [sessionCode, setSessionCode] = useState('');
  const [mode, setMode] = useState<'main' | 'create' | 'join'>('main');
  const [generatedCode, setGeneratedCode] = useState('');

  const generateSessionCode = () => {
    const words = ['TALK', 'CHAT', 'RESOLVE', 'LISTEN', 'CONNECT', 'HEAL'];
    const numbers = Math.floor(Math.random() * 900) + 100;
    const word = words[Math.floor(Math.random() * words.length)];
    return `${word}-${numbers}`;
  };

  const handleCreateSession = () => {
    const code = generateSessionCode();
    setGeneratedCode(code);
    setMode('create');
  };

  const handleRegenerateCode = () => {
    const code = generateSessionCode();
    setGeneratedCode(code);
  };

  const handleStartWithCode = () => {
    router.push({
      pathname: '/role-select',
      params: { sessionCode: generatedCode, isCreator: 'true' },
    });
  };

  const handleJoinSession = () => {
    if (!sessionCode.trim()) {
      Alert.alert('Required', 'Please enter a session code');
      return;
    }

    router.push({
      pathname: '/role-select',
      params: { sessionCode: sessionCode.toUpperCase(), isCreator: 'false' },
    });
  };

  if (mode === 'main') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <MessageCircle size={48} color="#1E293B" strokeWidth={2.5} />
            <Text style={styles.appName}>pairLogic</Text>
            <Text style={styles.tagline}>Resolve conflicts together</Text>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionCard} onPress={handleCreateSession}>
              <View style={styles.iconCircle}>
                <Plus size={32} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text style={styles.optionTitle}>Create Session</Text>
              <Text style={styles.optionDescription}>Start a new mediation session and share the code with your partner</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={() => setMode('join')}>
              <View style={[styles.iconCircle, styles.iconCircleSecondary]}>
                <LogIn size={32} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text style={styles.optionTitle}>Join Session</Text>
              <Text style={styles.optionDescription}>Enter a session code to join an existing conversation</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>How pairLogic Works</Text>
            <View style={styles.stepsList}>
              <View style={styles.step}>
                <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
                <Text style={styles.stepText}>One partner creates a session</Text>
              </View>
              <View style={styles.step}>
                <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
                <Text style={styles.stepText}>Share the code with your partner</Text>
              </View>
              <View style={styles.step}>
                <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
                <Text style={styles.stepText}>Both partners chat privately with the AI</Text>
              </View>
              <View style={styles.step}>
                <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
                <Text style={styles.stepText}>Receive personalized guidance</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (mode === 'create') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.backButton}>
            <TouchableOpacity onPress={() => setMode('main')} style={styles.backButtonTouch}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.createContent}>
            <View style={styles.successIcon}>
              <MessageCircle size={56} color="#10B981" strokeWidth={2.5} />
            </View>
            <Text style={styles.createTitle}>Session Created!</Text>
            <Text style={styles.createSubtitle}>Share this code with your partner</Text>

            <View style={styles.codeDisplay}>
              <Text style={styles.codeText}>{generatedCode}</Text>
            </View>

            <TouchableOpacity style={styles.regenerateButton} onPress={handleRegenerateCode}>
              <RefreshCw size={20} color="#64748B" strokeWidth={2} />
              <Text style={styles.regenerateText}>Generate New Code</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.continueButton} onPress={handleStartWithCode}>
              <Text style={styles.continueButtonText}>Continue to Session</Text>
            </TouchableOpacity>

            <View style={styles.instructionBox}>
              <Text style={styles.instructionText}>
                Your partner needs this code to join the session. Once both of you join and select your roles, you'll each chat privately with the AI mediator.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.backButton}>
          <TouchableOpacity onPress={() => setMode('main')} style={styles.backButtonTouch}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.joinContent}>
          <View style={styles.joinHeader}>
            <View style={styles.joinIcon}>
              <LogIn size={48} color="#1E293B" strokeWidth={2.5} />
            </View>
            <Text style={styles.joinTitle}>Join Session</Text>
            <Text style={styles.joinSubtitle}>Enter the session code shared by your partner</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Session Code</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., HEAL-123"
              placeholderTextColor="#94A3B8"
              value={sessionCode}
              onChangeText={(text) => setSessionCode(text.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity style={styles.joinButton} onPress={handleJoinSession}>
            <Text style={styles.joinButtonText}>Join Session</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 48,
  },
  optionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconCircleSecondary: {
    backgroundColor: '#10B981',
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  infoSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  stepsList: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  backButton: {
    marginBottom: 24,
  },
  backButtonTouch: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  createContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  createTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  createSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32,
  },
  codeDisplay: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  codeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 2,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  regenerateText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginBottom: 24,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  instructionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  instructionText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    textAlign: 'center',
  },
  joinContent: {
    flex: 1,
    paddingTop: 20,
  },
  joinHeader: {
    alignItems: 'center',
    marginBottom: 48,
  },
  joinIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  joinTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  joinSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#1E293B',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    fontWeight: '600',
    letterSpacing: 1,
  },
  joinButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
