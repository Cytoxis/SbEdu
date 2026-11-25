import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
export default function AdminLayout() { const { user, loading } = useAuth(); if (loading) return null; if (!user) return <Redirect href="/admin-login" />; if (user.role !== 'admin') return <Redirect href="/(tabs)" />; return <Stack screenOptions={{ headerShown: false }} />; }
