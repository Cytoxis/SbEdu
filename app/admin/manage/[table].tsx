import { useLocalSearchParams } from 'expo-router';
import { ManagerScreen } from '../../../components/admin/ManagerScreen';
export default function ManagerPage() { const { table } = useLocalSearchParams<{ table: string }>(); return <ManagerScreen table={table} />; }
