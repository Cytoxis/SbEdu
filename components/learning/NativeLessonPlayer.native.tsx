import { useEffect, useRef } from 'react';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';
interface PlayerProps { videoId: string; height: number; playing: boolean; startSeconds: number; onState: (state: string) => void; onTime: (seconds: number) => void }
export function NativeLessonPlayer({ videoId, height, playing, startSeconds, onState, onTime }: PlayerProps) {
  const ref = useRef<YoutubeIframeRef>(null); const timeCallback = useRef(onTime); timeCallback.current = onTime;
  useEffect(() => { const timer = setInterval(() => { void ref.current?.getCurrentTime().then(value => timeCallback.current(value)).catch(() => {}); }, 1000); return () => clearInterval(timer); }, []);
  return <YoutubePlayer ref={ref} height={height} videoId={videoId} play={playing} onChangeState={onState} onReady={() => { if (startSeconds > 0) ref.current?.seekTo(startSeconds, true); }} initialPlayerParams={{ controls: true, rel: false, preventFullScreen: true }} webViewProps={{ allowsFullscreenVideo: false }} />;
}
