import { useLocalSearchParams } from 'expo-router';
import { BatchScreen } from '../../components/learning/BatchScreen';
export default function BatchPage() { const { id } = useLocalSearchParams<{ id: string }>(); return <BatchScreen id={id} />; }
