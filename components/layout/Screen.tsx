import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
interface ScreenProps { children: ReactNode; title?: string; subtitle?: string; back?: boolean; scroll?: boolean; tab?: boolean; keyboard?: boolean }
export function Screen({ children, title, subtitle, back = false, scroll = true, tab = false, keyboard = false }: ScreenProps) {
  const router = useRouter();
  const content = <View style={styles.inner}>{title ? <View style={styles.header}>{back ? <Pressable accessibilityLabel="Go back" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={({ pressed }) => [styles.back, { opacity: pressed ? 0.5 : 1 }]}><Feather name="arrow-left" size={22} color={theme.colors.text} /></Pressable> : null}<View style={styles.heading}><Text style={styles.title}>{title}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View></View> : null}{children}</View>;
  return <SafeAreaView style={styles.root} edges={tab ? ['top'] : ['top', 'bottom']}><KeyboardAvoidingView style={styles.root} enabled={keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>{scroll ? <ScrollView style={styles.root} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{content}</ScrollView> : content}</KeyboardAvoidingView></SafeAreaView>;
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: theme.colors.background }, scroll: { flexGrow: 1 }, inner: { width: '100%', maxWidth: 960, alignSelf: 'center', padding: theme.spacing.md, paddingBottom: theme.spacing.lg, gap: theme.spacing.md, flexGrow: 1 }, header: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }, heading: { flex: 1, gap: theme.spacing.xs }, title: { fontSize: 24, fontWeight: '700', color: theme.colors.text }, subtitle: { color: theme.colors.muted, fontSize: 16, lineHeight: 24 }, back: { width: 48, height: 48, borderRadius: theme.radius.sm, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' } });
