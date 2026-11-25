import { useState } from 'react';
import { rpc } from '../services/supabaseService';
import { useResource } from './useResource';
import { useAuth } from './useAuth';
export function usePayments() { const auth = useAuth(); const resource = useResource('enrollments', { status: 'pending' }, '*,profiles!enrollments_student_id_fkey(full_name,username),batches(name,price)'); const [busyId, setBusyId] = useState(''); const [error, setError] = useState(''); const [message, setMessage] = useState(''); async function approve(id: string) { setBusyId(id); setError(''); try { await rpc('rpc_approve_enrollment', { p_admin_id: auth.user?.id, p_enrollment_id: id }); setMessage('Enrollment activated. The student can now access this batch.'); await resource.refresh(); } catch (err) { setError(err instanceof Error ? err.message : 'Approval failed'); } finally { setBusyId(''); } } return { ...resource, error: error || resource.error, busyId, message, approve }; }
