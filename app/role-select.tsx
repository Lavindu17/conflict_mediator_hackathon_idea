import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { UserCircle, ArrowLeft, Check } from 'lucide-react-native';
import { createSession, getSessionByCode } from '@/lib/database';

export default function RoleSelectScreen() {
  const { sessionCode, isCreator } = useLocalSearchParams<{
    sessionCode: string;
    isCreator: string;
  }>();
  const [selectedRole, setSelectedRole] = useState<'partner_a' | 'partner_b' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: 'partner_a' | 'partner_b') => {
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (!selectedRole) {
      Alert.alert('Error', 'Please select your role');
      return;
    }

    setLoading(true);

    try {
      let session;

      if (isCreator === 'true') {
        session = await createSession(sessionCode);
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
      }

      router.replace({
        pathname: '/chat',
        params: {
          sessionId: session.id,
          sessionCode: sessionCode,
          role: selectedRole,
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
          <Text style={styles.title}>Choose Your Role</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>Session Code</Text>
            <Text style={styles.code}>{sessionCode}</Text>
          </View>
          <Text style={styles.description}>
            Select which partner you are. This is for organizing the conversation only.
          </Text>
        </View>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleCard, selectedRole === 'partner_a' && styles.roleCardSelected]}
            onPress={() => handleRoleSelect('partner_a')}
            activeOpacity={0.7}
          >
            {selectedRole === 'partner_a' && (
              <View style={styles.checkBadge}>
                <Check size={20} color="#FFFFFF" strokeWidth={3} />
              </View>
            )}
            <View style={[styles.roleIconCircle, selectedRole === 'partner_a' && styles.roleIconCircleSelected]}>
              <UserCircle
                size={48}
                color={selectedRole === 'partner_a' ? '#1E293B' : '#94A3B8'}
                strokeWidth={2}
              />
            </View>
            <Text
              style={[
                styles.roleTitle,
                selectedRole === 'partner_a' && styles.roleTitleSelected,
              ]}
            >
              Partner A
            </Text>
            <Text style={styles.roleDescription}>Typically the session creator</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleCard, selectedRole === 'partner_b' && styles.roleCardSelected]}
            onPress={() => handleRoleSelect('partner_b')}
            activeOpacity={0.7}
          >
            {selectedRole === 'partner_b' && (
              <View style={styles.checkBadge}>
                <Check size={20} color="#FFFFFF" strokeWidth={3} />
              </View>
            )}
            <View style={[styles.roleIconCircle, selectedRole === 'partner_b' && styles.roleIconCircleSelected]}>
              <UserCircle
                size={48}
                color={selectedRole === 'partner_b' ? '#1E293B' : '#94A3B8'}
                strokeWidth={2}
              />
            </View>
            <Text
              style={[
                styles.roleTitle,
                selectedRole === 'partner_b' && styles.roleTitleSelected,
              ]}
            >
              Partner B
            </Text>
            <Text style={styles.roleDescription}>Typically joined with the code</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, !selectedRole && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedRole || loading}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>
            {loading ? 'Loading...' : 'Start Conversation'}
          </Text>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 24,
  },
  codeContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
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
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
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
