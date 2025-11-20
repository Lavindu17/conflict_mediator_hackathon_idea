import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { UserCircle } from 'lucide-react-native';
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
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Your Role</Text>
          <Text style={styles.subtitle}>
            Session: <Text style={styles.code}>{sessionCode}</Text>
          </Text>
          <Text style={styles.description}>
            Choose which partner you are. This is for internal organization only.
          </Text>
        </View>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleCard, selectedRole === 'partner_a' && styles.roleCardSelected]}
            onPress={() => handleRoleSelect('partner_a')}
          >
            <UserCircle
              size={64}
              color={selectedRole === 'partner_a' ? '#E74C3C' : '#7F8C8D'}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.roleTitle,
                selectedRole === 'partner_a' && styles.roleTitleSelected,
              ]}
            >
              Partner A
            </Text>
            <Text style={styles.roleDescription}>Select if you initiated the session</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleCard, selectedRole === 'partner_b' && styles.roleCardSelected]}
            onPress={() => handleRoleSelect('partner_b')}
          >
            <UserCircle
              size={64}
              color={selectedRole === 'partner_b' ? '#E74C3C' : '#7F8C8D'}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.roleTitle,
                selectedRole === 'partner_b' && styles.roleTitleSelected,
              ]}
            >
              Partner B
            </Text>
            <Text style={styles.roleDescription}>Select if you joined the session</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, !selectedRole && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedRole || loading}
        >
          <Text style={styles.continueButtonText}>
            {loading ? 'Loading...' : 'Continue to Chat'}
          </Text>
        </TouchableOpacity>

        <View style={styles.privacyNotice}>
          <Text style={styles.privacyText}>
            Your messages are private. Your partner cannot see what you share with the bot.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  code: {
    fontWeight: '700',
    color: '#E74C3C',
  },
  description: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ECF0F1',
  },
  roleCardSelected: {
    borderColor: '#E74C3C',
    backgroundColor: '#FFF5F5',
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8,
  },
  roleTitleSelected: {
    color: '#E74C3C',
  },
  roleDescription: {
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 18,
  },
  continueButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  privacyNotice: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#E8F8F5',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  privacyText: {
    fontSize: 13,
    color: '#27AE60',
    textAlign: 'center',
    lineHeight: 20,
  },
});
