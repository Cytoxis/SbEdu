import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { theme } from '../constants/theme';
export default function AuthRouter() { const { user, loading } = useAuth(); if (loading) return <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center' }}><ActivityIndicator color={theme.colors.primary} /></View>; return <Redirect href={user ? (user.role === 'admin' ? '/admin' : '/(tabs)') : '/login'} />; }
