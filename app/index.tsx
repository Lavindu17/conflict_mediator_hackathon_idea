import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, Plus, LogIn, RefreshCw, User, Calendar, Users, Sparkles } from 'lucide-react-native';

interface PartnerInfo {
  name: string;
  age: string;
  gender: string;
  email: string;
}

export default function HomeScreen() {
  const [sessionCode, setSessionCode] = useState('');
  const [mode, setMode] = useState<'main' | 'create' | 'join' | 'info-create' | 'info-join'>('main');
  const [generatedCode, setGeneratedCode] = useState('');
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo>({
    name: '',
    age: '',
    gender: '',
    email: '',
  });

  const generateSessionCode = () => {
    const words = ['TALK', 'CHAT', 'RESOLVE', 'LISTEN', 'CONNECT', 'HEAL'];
    const numbers = Math.floor(Math.random() * 900) + 100;
    const word = words[Math.floor(Math.random() * words.length)];
    return `${word}-${numbers}`;
  };

  const handleCreateSession = () => {
    const code = generateSessionCode();
    setGeneratedCode(code);
    setMode('info-create');
  };

  const handleJoinSession = () => {
    setMode('info-join');
  };

  const handleRegenerateCode = () => {
    const code = generateSessionCode();
    setGeneratedCode(code);
  };

  const validatePartnerInfo = () => {
    if (!partnerInfo.name.trim()) {
      Alert.alert('Required', 'Please enter your name');
      return false;
    }
    if (!partnerInfo.email.trim() || !partnerInfo.email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }
    if (!partnerInfo.age.trim() || isNaN(Number(partnerInfo.age)) || Number(partnerInfo.age) < 18 || Number(partnerInfo.age) > 120) {
      Alert.alert('Invalid Age', 'Please enter a valid age (18-120)');
      return false;
    }
    if (!partnerInfo.gender) {
      Alert.alert('Required', 'Please select your gender');
      return false;
    }
    return true;
  };

  const handleContinueAsCreator = () => {
    if (!validatePartnerInfo()) return;

    router.push({
      pathname: '/role-select',
      params: {
        sessionCode: generatedCode,
        isCreator: 'true',
        name: partnerInfo.name,
        email: partnerInfo.email,
        age: partnerInfo.age,
        gender: partnerInfo.gender,
      },
    });
  };

  const handleContinueAsJoiner = () => {
    if (!sessionCode.trim()) {
      Alert.alert('Required', 'Please enter a session code');
      return;
    }
    if (!validatePartnerInfo()) return;

    router.push({
      pathname: '/role-select',
      params: {
        sessionCode: sessionCode.toUpperCase(),
        isCreator: 'false',
        name: partnerInfo.name,
        email: partnerInfo.email,
        age: partnerInfo.age,
        gender: partnerInfo.gender,
      },
    });
  };

  if (mode === 'main') {
    return (
      <LinearGradient
        colors={['#F0F9FF', '#FFFFFF', '#FEF3C7']}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoOuter}>
                <LinearGradient
                  colors={['#1E293B', '#475569']}
                  style={styles.logoGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MessageCircle size={36} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
              </View>
            </View>
            <Text style={styles.appName}>pairLogic test</Text>
            <Text style={styles.tagline}>AI-powered relationship mediation</Text>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleCreateSession}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#1E293B', '#334155']}
                style={styles.optionCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.optionContent}>
                  <View style={styles.iconCircleWhite}>
                    <Plus size={28} color="#1E293B" strokeWidth={2.5} />
                  </View>
                  <Text style={styles.optionTitleWhite}>Create Session</Text>
                  <Text style={styles.optionDescriptionWhite}>Start a new mediation session and share the code with your partner</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleJoinSession}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.optionCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.optionContent}>
                  <View style={styles.iconCircleWhite}>
                    <LogIn size={28} color="#10B981" strokeWidth={2.5} />
                  </View>
                  <Text style={styles.optionTitleWhite}>Join Session</Text>
                  <Text style={styles.optionDescriptionWhite}>Enter a session code to join an existing conversation</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoHeader}>
              <Sparkles size={20} color="#F59E0B" strokeWidth={2.5} />
              <Text style={styles.infoTitle}>How pairLogic Works</Text>
            </View>
            <View style={styles.stepsList}>
              <View style={styles.step}>
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  style={styles.stepNumber}
                >
                  <Text style={styles.stepNumberText}>1</Text>
                </LinearGradient>
                <Text style={styles.stepText}>One partner creates a session</Text>
              </View>
              <View style={styles.step}>
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.stepNumber}
                >
                  <Text style={styles.stepNumberText}>2</Text>
                </LinearGradient>
                <Text style={styles.stepText}>Share the code with your partner</Text>
              </View>
              <View style={styles.step}>
                <LinearGradient
                  colors={['#EC4899', '#DB2777']}
                  style={styles.stepNumber}
                >
                  <Text style={styles.stepNumberText}>3</Text>
                </LinearGradient>
                <Text style={styles.stepText}>Both partners chat privately with the AI</Text>
              </View>
              <View style={styles.step}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.stepNumber}
                >
                  <Text style={styles.stepNumberText}>4</Text>
                </LinearGradient>
                <Text style={styles.stepText}>Receive personalized guidance</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  if (mode === 'info-create') {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity onPress={() => setMode('main')} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.formHeader}>
            <View style={styles.headerIconCircle}>
              <User size={32} color="#1E293B" strokeWidth={2.5} />
            </View>
            <Text style={styles.formTitle}>Tell us about yourself</Text>
            <Text style={styles.formSubtitle}>This helps the AI provide better guidance</Text>
          </View>

          <View style={styles.codePreview}>
            <Text style={styles.codePreviewLabel}>Your Session Code</Text>
            <View style={styles.codePreviewBox}>
              <Text style={styles.codePreviewText}>{generatedCode}</Text>
              <TouchableOpacity onPress={handleRegenerateCode} style={styles.codeRefreshIcon}>
                <RefreshCw size={18} color="#64748B" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Name</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Enter your name"
              placeholderTextColor="#94A3B8"
              value={partnerInfo.name}
              onChangeText={(text) => setPartnerInfo({ ...partnerInfo, name: text })}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Email</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Enter your email"
              placeholderTextColor="#94A3B8"
              value={partnerInfo.email}
              onChangeText={(text) => setPartnerInfo({ ...partnerInfo, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Age</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Enter your age"
              placeholderTextColor="#94A3B8"
              value={partnerInfo.age}
              onChangeText={(text) => setPartnerInfo({ ...partnerInfo, age: text })}
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Gender</Text>
            <View style={styles.genderOptions}>
              <TouchableOpacity
                style={[styles.genderButton, partnerInfo.gender === 'Male' && styles.genderButtonSelected]}
                onPress={() => setPartnerInfo({ ...partnerInfo, gender: 'Male' })}
              >
                <Text style={[styles.genderButtonText, partnerInfo.gender === 'Male' && styles.genderButtonTextSelected]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderButton, partnerInfo.gender === 'Female' && styles.genderButtonSelected]}
                onPress={() => setPartnerInfo({ ...partnerInfo, gender: 'Female' })}
              >
                <Text style={[styles.genderButtonText, partnerInfo.gender === 'Female' && styles.genderButtonTextSelected]}>Female</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderButton, partnerInfo.gender === 'Other' && styles.genderButtonSelected]}
                onPress={() => setPartnerInfo({ ...partnerInfo, gender: 'Other' })}
              >
                <Text style={[styles.genderButtonText, partnerInfo.gender === 'Other' && styles.genderButtonTextSelected]}>Other</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleContinueAsCreator}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#1E293B', '#475569']}
              style={styles.primaryButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.privacyNote}>
            <Text style={styles.privacyNoteText}>
              Share the code <Text style={styles.boldText}>{generatedCode}</Text> with your partner to begin
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (mode === 'info-join') {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity onPress={() => setMode('main')} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.formHeader}>
            <View style={styles.headerIconCircle}>
              <User size={32} color="#1E293B" strokeWidth={2.5} />
            </View>
            <Text style={styles.formTitle}>Tell us about yourself</Text>
            <Text style={styles.formSubtitle}>This helps the AI provide better guidance</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Session Code</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g., HEAL-123"
              placeholderTextColor="#94A3B8"
              value={sessionCode}
              onChangeText={(text) => setSessionCode(text.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Name</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Enter your name"
              placeholderTextColor="#94A3B8"
              value={partnerInfo.name}
              onChangeText={(text) => setPartnerInfo({ ...partnerInfo, name: text })}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Email</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Enter your email"
              placeholderTextColor="#94A3B8"
              value={partnerInfo.email}
              onChangeText={(text) => setPartnerInfo({ ...partnerInfo, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Age</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Enter your age"
              placeholderTextColor="#94A3B8"
              value={partnerInfo.age}
              onChangeText={(text) => setPartnerInfo({ ...partnerInfo, age: text })}
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Gender</Text>
            <View style={styles.genderOptions}>
              <TouchableOpacity
                style={[styles.genderButton, partnerInfo.gender === 'Male' && styles.genderButtonSelected]}
                onPress={() => setPartnerInfo({ ...partnerInfo, gender: 'Male' })}
              >
                <Text style={[styles.genderButtonText, partnerInfo.gender === 'Male' && styles.genderButtonTextSelected]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderButton, partnerInfo.gender === 'Female' && styles.genderButtonSelected]}
                onPress={() => setPartnerInfo({ ...partnerInfo, gender: 'Female' })}
              >
                <Text style={[styles.genderButtonText, partnerInfo.gender === 'Female' && styles.genderButtonTextSelected]}>Female</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderButton, partnerInfo.gender === 'Other' && styles.genderButtonSelected]}
                onPress={() => setPartnerInfo({ ...partnerInfo, gender: 'Other' })}
              >
                <Text style={[styles.genderButtonText, partnerInfo.gender === 'Other' && styles.genderButtonTextSelected]}>Other</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleContinueAsJoiner}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.primaryButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.primaryButtonText}>Join Session</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return null;
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
  logoContainer: {
    marginBottom: 20,
  },
  logoOuter: {
    padding: 4,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  logoGradient: {
    width: 72,
    height: 72,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 8,
    letterSpacing: -1.5,
  },
  tagline: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 20,
    marginBottom: 48,
  },
  optionCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  optionCardGradient: {
    padding: 28,
    borderRadius: 24,
  },
  optionContent: {
    alignItems: 'flex-start',
  },
  iconCircleWhite: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  optionTitleWhite: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  optionDescriptionWhite: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 21,
  },
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  stepsList: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    fontWeight: '500',
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
  formHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  codePreview: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  codePreviewLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  codePreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  codePreviewText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 1,
  },
  codeRefreshIcon: {
    padding: 4,
  },
  formSection: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 10,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  genderButtonSelected: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  genderButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  genderButtonTextSelected: {
    color: '#FFFFFF',
  },
  primaryButton: {
    borderRadius: 16,
    marginTop: 8,
    overflow: 'hidden',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  privacyNote: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  privacyNoteText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '700',
    color: '#1E293B',
  },
});
