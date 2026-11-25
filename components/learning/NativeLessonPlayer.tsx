import { Text, View, Linking } from 'react-native';
import { Button, ui } from '../ui/Primitives';
interface PlayerProps { videoId: string; height: number; playing: boolean; startSeconds: number; onState: (state: string) => void; onTime: (seconds: number) => void }
export function NativeLessonPlayer({ videoId }: PlayerProps) { return <View style={[ui.card, { minHeight: 180, justifyContent: 'center' }]}><Text style={ui.section}>Native classroom player</Text><Text style={ui.subtitle}>Install the Android APK to view the embedded, watermarked player. Browser playback opens YouTube without native capture protection.</Text><Button title="Open YouTube preview" secondary onPress={() => { void Linking.openURL(`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`); }} /></View>; }
