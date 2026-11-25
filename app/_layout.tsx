import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../contexts/AuthContext';
import { LearningProvider } from '../contexts/LearningContext';
import { theme } from '../constants/theme';
export default function RootLayout() { return <SafeAreaProvider><AuthProvider><LearningProvider><StatusBar style="light" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}><Stack.Screen name="index" /><Stack.Screen name="(tabs)" /><Stack.Screen name="login" /><Stack.Screen name="register" /><Stack.Screen name="forgot-password" /><Stack.Screen name="admin-login" /><Stack.Screen name="admin" /><Stack.Screen name="course/[id]" /><Stack.Screen name="batch/[id]" /><Stack.Screen name="enroll/[id]" /><Stack.Screen name="player/[id]" /><Stack.Screen name="test/[id]" /></Stack></LearningProvider></AuthProvider></SafeAreaProvider>; }
