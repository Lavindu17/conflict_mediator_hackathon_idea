import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function SetupScreen() {
  const params = useLocalSearchParams();
  const mode = params.mode as 'create' | 'join';
  
  const [name, setName] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    console.log("1. Button Pressed"); // Check if click registers

    if (!name) {
      Alert.alert("Name Required", "Please enter your name.");
      return;
    }
    if (mode === 'join' && !sessionCode) {
      Alert.alert("Code Required", "Enter the code.");
      return;
    }

    setLoading(true);
    console.log("2. Loading started");

    try {
      if (mode === 'create') {
        const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        console.log("3. Generated Code:", newCode);
        
        console.log("4. Attempting DB Insert...");
        const { data, error } = await supabase.from('sessions').insert({
          session_code: newCode,
          partner_a_name: name,
          status: 'waiting'
        }).select().single();

        if (error) {
          console.error("DB Insert Error:", error);
          throw error;
        }
        console.log("5. DB Insert Success:", data);

        console.log("6. Creating Contexts...");
        const { error: contextError } = await supabase.from('session_context').insert([
          { session_id: data.id, partner_role: 'partner_a', conversation_history: [] },
          { session_id: data.id, partner_role: 'partner_b', conversation_history: [] }
        ]);

        if (contextError) {
            console.error("Context Error:", contextError);
            throw contextError;
        }

        console.log("7. Navigating to Lobby...");
        router.replace({
          pathname: '/lobby',
          params: { sessionId: data.id, code: newCode, role: 'partner_a', name }
        });

      } else {
        // JOIN LOGIC
        console.log("4. Attempting to Find Session:", sessionCode);
        const { data: session, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('session_code', sessionCode.toUpperCase())
          .single();

        if (error || !session) {
            console.error("Find Session Error:", error);
            throw new Error("Session not found");
        }
        console.log("5. Session Found:", session);

        console.log("6. Updating Partner B...");
        const { error: updateError } = await supabase.from('sessions').update({
          partner_b_name: name,
          partner_b_ready: true
        }).eq('id', session.id);

        if (updateError) {
             console.error("Update Error:", updateError);
             throw updateError;
        }

        console.log("7. Navigating to Lobby...");
        router.replace({
          pathname: '/lobby',
          params: { sessionId: session.id, code: session.session_code, role: 'partner_b', name }
        });
      }
    } catch (e: any) {
      console.error("FINAL ERROR:", e);
      Alert.alert("Error", e.message || "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mode === 'create' ? "Start New Session" : "Join Session"}</Text>
      
      <Text style={styles.label}>Your Name</Text>
      <TextInput 
        style={styles.input} 
        value={name} 
        onChangeText={setName} 
        placeholder="Enter your name" 
        placeholderTextColor="#94A3B8"
      />

      {mode === 'join' && (
        <>
          <Text style={styles.label}>Session Code</Text>
          <TextInput 
            style={styles.input} 
            value={sessionCode} 
            onChangeText={setSessionCode} 
            placeholder="e.g. A1B2C3" 
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
          />
        </>
      )}

      <TouchableOpacity 
        style={[styles.btn, loading && { opacity: 0.7 }]} 
        onPress={handleContinue} 
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnText}>Continue</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 40, color: '#1E293B' },
  label: { fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#F1F5F9', padding: 16, borderRadius: 12, fontSize: 16, color: '#1E293B' },
  btn: { backgroundColor: '#1E293B', padding: 18, borderRadius: 12, marginTop: 32, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});