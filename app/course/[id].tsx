import { useLocalSearchParams } from 'expo-router';
import { CatalogScreen } from '../../components/learning/CatalogScreen';
export default function CoursePage() { const { id } = useLocalSearchParams<{ id: string }>(); return <CatalogScreen courseId={id} />; }
