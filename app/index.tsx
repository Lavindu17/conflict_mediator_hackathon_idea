import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Heart } from 'lucide-react-native';

export default function HomeScreen() {
  const [sessionCode, setSessionCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const generateSessionCode = () => {
    const words = ['TALK', 'CHAT', 'RESOLVE', 'LISTEN', 'CONNECT', 'HEAL'];
    const numbers = Math.floor(Math.random() * 900) + 100;
    const word = words[Math.floor(Math.random() * words.length)];
    return `${word}-${numbers}`;
  };

  const handleCreateSession = () => {
    const code = generateSessionCode();
    setSessionCode(code);
    setIsCreating(true);
  };

  const handleStartSession = () => {
    if (!sessionCode.trim()) {
      Alert.alert('Error', 'Please enter or create a session code');
      return;
    }

    router.push({
      pathname: '/role-select',
      params: { sessionCode: sessionCode.toUpperCase(), isCreator: isCreating.toString() },
    });
  };

  const handleJoinSession = () => {
    if (!sessionCode.trim()) {
      Alert.alert('Error', 'Please enter a session code');
      return;
    }

    router.push({
      pathname: '/role-select',
      params: { sessionCode: sessionCode.toUpperCase(), isCreator: 'false' },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Heart size={64} color="#E74C3C" strokeWidth={2} />
          <Text style={styles.title}>CoupleBot Resolve</Text>
          <Text style={styles.subtitle}>Private Conflict Mediation</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Get Started</Text>
          <Text style={styles.cardDescription}>
            Create a new session or join an existing one with your partner
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter Session Code"
            placeholderTextColor="#95A5A6"
            value={sessionCode}
            onChangeText={(text) => {
              setSessionCode(text.toUpperCase());
              setIsCreating(false);
            }}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <TouchableOpacity style={styles.generateButton} onPress={handleCreateSession}>
            <Text style={styles.generateButtonText}>Generate New Code</Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            {isCreating ? (
              <TouchableOpacity style={styles.primaryButton} onPress={handleStartSession}>
                <Text style={styles.primaryButtonText}>Create Session</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.primaryButton} onPress={handleJoinSession}>
                <Text style={styles.primaryButtonText}>Join Session</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How It Works</Text>
          <Text style={styles.infoText}>
            1. One partner creates a session code{'\n'}
            2. Share the code with your partner{'\n'}
            3. Both join and select your roles{'\n'}
            4. Chat privately with the mediator bot{'\n'}
            5. Receive personalized advice
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    fontSize: 32,
    fontWeight: '700',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#ECF0F1',
  },
  generateButton: {
    backgroundColor: '#ECF0F1',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  generateButtonText: {
    color: '#34495E',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 22,
  },
});
