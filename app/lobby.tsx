import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Share, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Copy } from 'lucide-react-native';

export default function LobbyScreen() {
  const { sessionId, code, role, name } = useLocalSearchParams();
  const [status, setStatus] = useState('Waiting for partner...');

  useEffect(() => {
    // If I am Partner B, I'm already late to the party, so I'm ready.
    if (role === 'partner_b') {
      router.replace({ pathname: '/intake', params: { sessionId, role, name } });
    }

    // If I am Partner A, I wait for B.
    const channel = supabase.channel(`lobby-${sessionId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'sessions', 
        filter: `id=eq.${sessionId}` 
      }, (payload) => {
        const newData = payload.new;
        if (newData.partner_b_ready || newData.partner_b_name) {
          router.replace({ pathname: '/intake', params: { sessionId, role, name } });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const shareCode = () => {
    Share.share({ message: `Join my mediation session with code: ${code}` });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>SESSION CODE</Text>
      <TouchableOpacity style={styles.codeBox} onPress={shareCode}>
        <Text style={styles.code}>{code}</Text>
        <Copy size={20} color="#64748B" />
      </TouchableOpacity>
      
      <Text style={styles.status}>{status}</Text>
      <Text style={styles.subtext}>Share this code with your partner.</Text>
      <Text style={styles.subtext}>The app will update when they join.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#F8FAFC' },
  label: { fontSize: 14, fontWeight: '700', color: '#64748B', marginBottom: 10 },
  codeBox: { flexDirection: 'row', backgroundColor: '#fff', padding: 20, borderRadius: 16, alignItems: 'center', gap: 10, elevation: 2, marginBottom: 40 },
  code: { fontSize: 36, fontWeight: '800', color: '#1E293B', letterSpacing: 2 },
  status: { fontSize: 18, fontWeight: '600', color: '#10B981', marginBottom: 10 },
  subtext: { fontSize: 14, color: '#94A3B8' }
});