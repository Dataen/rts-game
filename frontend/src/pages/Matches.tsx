import { useQuery } from '@tanstack/react-query';
import {
    Typography,
    CircularProgress,
    Stack,
    Button
} from '@mui/material';
import { useApiStore } from '../store/api';
import type { Match } from '../types/Match';
import { MatchTable } from '../components/MatchTable';
import { LuSwords } from "react-icons/lu";
import { useState } from 'react';
import { AddMatchDialog } from '../components/AddMatchDialog';

export default function Matches() {
    const apiUrl = useApiStore(state => state.apiBaseUrl);

    const { data, isLoading, error } = useQuery<Match[]>({
        queryKey: ['matches'],
        queryFn: () =>
            fetch(`${apiUrl}/matches`).then(res => {
                if (!res.ok) throw new Error('Failed to fetch matches');
                return res.json();
            }),
    });

    const [open, setOpen] = useState(false);

    if (isLoading) return <CircularProgress />;
    if (error || data === undefined)
        return (
            <Typography color="error">Oops, couldn't load matches 🤷‍♂️</Typography>
        );

    return (
        <>
            <Stack spacing={2} display={"block"}>
                <Typography variant="h4" mb={2}>
                    Matches
                </Typography>
                <Button color={"info"} startIcon={<LuSwords size={24} />} variant="contained" onClick={() => setOpen(true)}>New Match</Button>

                <MatchTable matches={data} />
            </Stack>

            <AddMatchDialog
                open={open}
                onClose={() => setOpen(false)}
            />
        </>
    );
}