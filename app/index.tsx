import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Users } from 'lucide-react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F0F9FF', '#E0F2FE']} style={styles.background} />
      
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Heart size={40} color="#EC4899" fill="#EC4899" />
        </View>
        <Text style={styles.title}>Couple Resolve</Text>
        <Text style={styles.subtitle}>AI-Powered Mediation</Text>
      </View>

      <View style={styles.buttonContainer}>
        {/* CREATE SESSION */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push({ pathname: '/setup', params: { mode: 'create' } })}
        >
          <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
            <Heart size={24} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.cardTitle}>New Session</Text>
            <Text style={styles.cardDesc}>I want to start a conversation</Text>
          </View>
        </TouchableOpacity>

        {/* JOIN SESSION */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push({ pathname: '/setup', params: { mode: 'join' } })}
        >
          <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
            <Users size={24} color="#16A34A" />
          </View>
          <View>
            <Text style={styles.cardTitle}>Join Session</Text>
            <Text style={styles.cardDesc}>I have a code from my partner</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  header: { alignItems: 'center', marginBottom: 60 },
  iconContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 50, elevation: 5, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 16, color: '#64748B', marginTop: 8 },
  buttonContainer: { gap: 16 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 16, elevation: 2 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  cardDesc: { fontSize: 14, color: '#64748B' },
});