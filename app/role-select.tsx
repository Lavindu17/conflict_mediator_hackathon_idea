import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { UserCircle, ArrowLeft, Check } from 'lucide-react-native';
import { createSession, getSessionByCode, updatePartnerInfo } from '@/lib/database';

export default function RoleSelectScreen() {
  const { sessionCode, isCreator, name, age, gender, email } = useLocalSearchParams<{
    sessionCode: string;
    isCreator: string;
    name?: string;
    age?: string;
    gender?: string;
    email?: string;
  }>();
  const [selectedRole, setSelectedRole] = useState<'partner_a' | 'partner_b' | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isCreator === 'true') {
      setSelectedRole('partner_a');
    } else {
      setSelectedRole('partner_b');
    }
  }, [isCreator]);

  const handleRoleSelect = (role: 'partner_a' | 'partner_b') => {
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    console.log('--- Handle Continue Clicked ---');
    
    if (!selectedRole) {
      Alert.alert('Error', 'Please select your role');
      return;
    }

    setLoading(true);

    try {
      let session;
      const partnerInfo = name && age && gender && email ? {
        name: name,
        age: Number(age),
        gender: gender,
        email: email
      } : undefined;

      console.log('Partner Info:', partnerInfo);
      console.log('Is Creator:', isCreator);

      if (isCreator === 'true') {
        console.log('Creating session...');
        session = await createSession(sessionCode, partnerInfo);
      } else {
        console.log('Getting session...');
        session = await getSessionByCode(sessionCode);
        if (session && partnerInfo) {
          await updatePartnerInfo(session.id, selectedRole, partnerInfo);
        }
      }

      console.log('Session Result:', session);

      if (!session) {
        Alert.alert('Error', 'Failed to create/join session. Check database connection.');
        setLoading(false);
        return;
      }

      console.log('Navigating to scenario-intake...');
      router.replace({
        pathname: '/scenario-intake',
        params: {
          sessionId: session.id,
          sessionCode: sessionCode,
          role: selectedRole,
          partnerName: name || '',
        },
      });
    } catch (error) {
      console.error('Error setting up session:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

    setLoading(true);

    try {
      let session;
      const partnerInfo = name && age && gender && email ? {
        name: name,
        age: Number(age),
        gender: gender,
        email: email
      } : undefined;

      if (isCreator === 'true') {
        session = await createSession(sessionCode, partnerInfo);
        if (!session) {
          Alert.alert('Error', 'Failed to create session. Please try again.');
          setLoading(false);
          return;
        }
      } else {
        session = await getSessionByCode(sessionCode);
        if (!session) {
          Alert.alert('Error', 'Session not found. Please check the code and try again.');
          setLoading(false);
          return;
        }
        if (partnerInfo) {
          await updatePartnerInfo(session.id, selectedRole, partnerInfo);
        }
      }

      router.replace({
        pathname: '/scenario-intake',
        params: {
          sessionId: session.id,
          sessionCode: sessionCode,
          role: selectedRole,
          partnerName: name || '',
        },
      });
    } catch (error) {
      console.error('Error setting up session:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#64748B" strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.checkCircle}>
            <Check size={32} color="#10B981" strokeWidth={3} />
          </View>
          <Text style={styles.title}>
            {isCreator === 'true' ? 'Session Created!' : 'Joining Session'}
          </Text>
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>Session Code</Text>
            <Text style={styles.code}>{sessionCode}</Text>
          </View>
          {name && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Your Information</Text>
              <Text style={styles.infoText}>Name: {name}</Text>
              <Text style={styles.infoText}>Age: {age}</Text>
              <Text style={styles.infoText}>Gender: {gender}</Text>
            </View>
          )}
          <View style={styles.roleInfo}>
            <Text style={styles.roleInfoTitle}>
              You are <Text style={styles.roleHighlight}>{selectedRole === 'partner_a' ? 'Partner A' : 'Partner B'}</Text>
            </Text>
            <Text style={styles.roleInfoDesc}>
              {isCreator === 'true'
                ? 'As the session creator, you are Partner A'
                : 'You joined with a code, so you are Partner B'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={!selectedRole || loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={!selectedRole || loading ? ['#E2E8F0', '#CBD5E1'] : ['#1E293B', '#475569']}
            style={styles.continueButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.continueButtonText}>
              {loading ? 'Loading...' : 'Start Conversation'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.privacyNotice}>
          <Text style={styles.privacyText}>
            Your conversations are completely private. Your partner cannot see what you share with the AI mediator.
          </Text>
        </View>
      </ScrollView>
    </View>
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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 32,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 24,
    textAlign: 'center',
  },
  codeContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  codeLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  code: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 1,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'stretch',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  roleInfo: {
    backgroundColor: '#FEF9C3',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE047',
    alignSelf: 'stretch',
  },
  roleInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#854D0E',
    marginBottom: 8,
    textAlign: 'center',
  },
  roleHighlight: {
    fontWeight: '700',
    color: '#1E293B',
  },
  roleInfoDesc: {
    fontSize: 13,
    color: '#A16207',
    textAlign: 'center',
    lineHeight: 18,
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 20,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  roleCardSelected: {
    borderColor: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  roleIconCircleSelected: {
    backgroundColor: '#F8FAFC',
    borderColor: '#1E293B',
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  roleTitleSelected: {
    color: '#1E293B',
  },
  roleDescription: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  continueButton: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  continueButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 16,
  },
  continueButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  privacyNotice: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  privacyText: {
    fontSize: 13,
    color: '#15803D',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
});
