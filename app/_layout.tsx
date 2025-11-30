import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function Layout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />   {/* Home/Login */}
        <Stack.Screen name="setup" />   {/* Enter Name/Details */}
        <Stack.Screen name="lobby" />   {/* Wait for partner */}
        <Stack.Screen name="intake" />  {/* How do you feel? */}
        <Stack.Screen name="chat" />    {/* The Mediation */}
      </Stack>
      <StatusBar style="dark" />
    </View>
  );
}