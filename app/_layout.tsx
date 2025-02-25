import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../context/ThemeContext';
import { DatabaseProvider } from '../context/DatabaseContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <DatabaseProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </DatabaseProvider>
    </ThemeProvider>
  );
}