import { CircularProgress, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

export default function Match() {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading, error } = useQuery({
        queryKey: ['match', id],
        queryFn: async () => {
            const res = await fetch(`/api/matches/${id}`);
            if (!res.ok) throw new Error('Failed to fetch match');
            return res.json();
        }
    });

    if (isLoading) return <CircularProgress />;
    if (error) return <Typography>Error loading match 😵</Typography>;

    return (
        <>
            <Typography variant="h4" gutterBottom>
                Match #{data.id} Details
            </Typography>
            <Typography>Winner: {data.winner || 'TBD'}</Typography>
            <Typography>Duration: {data.duration || 'Unknown'}</Typography>
            <Typography>Logs:</Typography>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{data.logs || 'No logs available'}</pre>
        </>
    );
}
