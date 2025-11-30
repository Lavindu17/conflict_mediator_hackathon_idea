import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function SetupScreen() {
  const params = useLocalSearchParams();
  const mode = params.mode as 'create' | 'join';
  
  const [name, setName] = useState('');
  const [sessionCode, setSessionCode] = useState(''); // Only for joiners
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!name) return Alert.alert("Name Required", "Please enter your name.");
    if (mode === 'join' && !sessionCode) return Alert.alert("Code Required", "Enter the code.");

    setLoading(true);

    try {
      if (mode === 'create') {
        // GENERATE CODE
        const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        // INSERT INTO DB
        const { data, error } = await supabase.from('sessions').insert({
          session_code: newCode,
          partner_a_name: name,
          status: 'waiting'
        }).select().single();

        if (error) throw error;

        // CREATE CONTEXTS
        await supabase.from('session_context').insert([
          { session_id: data.id, partner_role: 'partner_a', conversation_history: [] },
          { session_id: data.id, partner_role: 'partner_b', conversation_history: [] }
        ]);

        router.replace({
          pathname: '/lobby',
          params: { sessionId: data.id, code: newCode, role: 'partner_a', name }
        });

      } else {
        // JOIN LOGIC
        const { data: session, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('session_code', sessionCode.toUpperCase())
          .single();

        if (error || !session) throw new Error("Session not found");

        // UPDATE PARTNER B INFO
        await supabase.from('sessions').update({
          partner_b_name: name,
          partner_b_ready: true // Mark as joined
        }).eq('id', session.id);

        router.replace({
          pathname: '/lobby',
          params: { sessionId: session.id, code: session.session_code, role: 'partner_b', name }
        });
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mode === 'create' ? "Start New Session" : "Join Session"}</Text>
      
      <Text style={styles.label}>Your Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter your name" />

      {mode === 'join' && (
        <>
          <Text style={styles.label}>Session Code</Text>
          <TextInput 
            style={styles.input} 
            value={sessionCode} 
            onChangeText={setSessionCode} 
            placeholder="e.g. A1B2C3" 
            autoCapitalize="characters"
          />
        </>
      )}

      <TouchableOpacity style={styles.btn} onPress={handleContinue} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnText}>Continue</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 40, color: '#1E293B' },
  label: { fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#F1F5F9', padding: 16, borderRadius: 12, fontSize: 16 },
  btn: { backgroundColor: '#1E293B', padding: 18, borderRadius: 12, marginTop: 32, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});