import { View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Clock, ArrowLeft, Check } from 'lucide-react-native';
import { updateScenarioInfo } from '@/lib/database';

const FEELING_OPTIONS = [
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'angry', label: 'Angry', emoji: '😠' },
  { value: 'frustrated', label: 'Frustrated', emoji: '😤' },
  { value: 'hurt', label: 'Hurt', emoji: '💔' },
  { value: 'disappointed', label: 'Disappointed', emoji: '😞' },
  { value: 'disrespected', label: 'Disrespected', emoji: '😣' },
  { value: 'unvalued', label: 'Unvalued', emoji: '😔' },
  { value: 'confused', label: 'Confused', emoji: '😕' },
];

const TIME_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'longer', label: 'Longer Ago' },
];

export default function ScenarioIntakeScreen() {
  const { sessionId, sessionCode, role, partnerName } = useLocalSearchParams<{
    sessionId: string;
    sessionCode: string;
    role: string;
    partnerName?: string;
  }>();

  const [feeling, setFeeling] = useState('');
  const [whenHappened, setWhenHappened] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!feeling || !whenHappened) return;

    setLoading(true);
    const partnerRole = role as 'partner_a' | 'partner_b';

    const success = await updateScenarioInfo(sessionId, partnerRole, {
      feeling,
      when_happened: whenHappened,
    });

    if (success) {
      router.replace({
        pathname: '/chat',
        params: {
          sessionId,
          sessionCode,
          role,
          partnerName: partnerName || '',
        },
      });
    }
    setLoading(false);
  };

  return (
    <LinearGradient
      colors={['#F0F9FF', '#FFFFFF', '#FEF3C7']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E293B" strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.header}>
            <LinearGradient
              colors={['#EC4899', '#DB2777']}
              style={styles.headerIcon}
            >
              <Heart size={32} color="#FFFFFF" strokeWidth={2.5} />
            </LinearGradient>
            <Text style={styles.title}>Tell Us How You Feel</Text>
            <Text style={styles.subtitle}>
              This helps us understand the situation better and provide more personalized guidance
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Heart size={20} color="#1E293B" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>How are you feeling?</Text>
            </View>
            <View style={styles.optionsGrid}>
              {FEELING_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionCard,
                    feeling === option.value && styles.optionCardSelected,
                  ]}
                  onPress={() => setFeeling(option.value)}
                  activeOpacity={0.7}
                >
                  {feeling === option.value && (
                    <View style={styles.checkBadge}>
                      <Check size={12} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                  <Text
                    style={[
                      styles.optionLabel,
                      feeling === option.value && styles.optionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color="#1E293B" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>When did this happen?</Text>
            </View>
            <View style={styles.timeOptions}>
              {TIME_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.timeOption,
                    whenHappened === option.value && styles.timeOptionSelected,
                  ]}
                  onPress={() => setWhenHappened(option.value)}
                  activeOpacity={0.7}
                >
                  {whenHappened === option.value && (
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      style={styles.timeOptionCheckCircle}
                    >
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    </LinearGradient>
                  )}
                  <Text
                    style={[
                      styles.timeOptionText,
                      whenHappened === option.value && styles.timeOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            disabled={!feeling || !whenHappened || loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                !feeling || !whenHappened || loading
                  ? ['#E2E8F0', '#CBD5E1']
                  : ['#1E293B', '#475569']
              }
              style={styles.continueButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.continueButtonText}>
                {loading ? 'Loading...' : 'Continue to Chat'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: '#1E293B',
    backgroundColor: '#F8FAFC',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: '#1E293B',
    fontWeight: '700',
  },
  timeOptions: {
    gap: 12,
  },
  timeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeOptionSelected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  timeOptionCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    flex: 1,
  },
  timeOptionTextSelected: {
    color: '#1E293B',
    fontWeight: '700',
  },
  continueButton: {
    borderRadius: 16,
    marginTop: 16,
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
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
