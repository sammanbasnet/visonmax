import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Clock } from 'lucide-react';

const ActivityLogs = ({ endpoint = '/users/logs' }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, [endpoint]);

    const fetchLogs = async () => {
        try {
            const { data } = await api.get(endpoint);
            setLogs(data.data);
        } catch (err) {
            console.error('Error fetching logs', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading activity...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {logs.length === 0 ? (
                <p style={{ color: '#64748b' }}>No activity recorded yet.</p>
            ) : (
                logs.map(log => (
                    <div key={log._id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <div style={{ marginTop: '3px' }}><Clock size={16} color="#94a3b8" /></div>
                            <div>
                                <p style={{ fontWeight: '500', textTransform: 'capitalize' }}>
                                    {log.action.replace(/_/g, ' ').toLowerCase()}
                                    {log.user && log.user.name && (
                                        <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                                            by {log.user.name} ({log.user.email})
                                        </span>
                                    )}
                                </p>
                                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{log.details || 'No details'}</p>
                            </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                            {new Date(log.createdAt).toLocaleString()}
                        </span>
                    </div>
                ))
            )}
        </div>
    );
};

export default ActivityLogs;
