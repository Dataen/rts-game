import { useNavigate, useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiStore } from '../store/api';
import { UserAvatar } from '../components/UserAvatar';
import type { Bot } from '../types/Bot';
import { Box, Button, CircularProgress, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import { MatchTable } from '../components/MatchTable';
import type { Match } from '../types/Match';
import { useAuthStore } from '../store/auth';
import { LanguageIcon } from '../components/LanguageIcon';
import { useState } from 'react';

type Params = {
    id: string;
}

export default function Bot() {
    const apiUrl = useApiStore(state => state.apiBaseUrl);
    const { id } = useParams<Params>();
    const user = useAuthStore(state => state.user);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [code, setCode] = useState('this is my code');

    const { data, isLoading, error } = useQuery<Bot>({
        queryKey: ['bot', id],
        queryFn: async () => {
            const res = await fetch(`${apiUrl}/bots/${id}`);
            if (res.status === 404) navigate('/404')
            if (!res.ok) {
                const err = await res.json().catch(() => null);
                throw new Error(err?.detail || "Failed to fetch bot");
            }

            return res.json();
        },
        enabled: !!id,
    });

    const deleteMutation = useMutation({
        mutationFn: async (botId: string) => {
            const res = await fetch(`${apiUrl}/bots/${botId}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const { detail } = await res.json();
                throw new Error(detail || 'Failed to delete bot');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bots'] });
            navigate("/bots")
        },
    });

    if (isLoading) return <CircularProgress />;
    if (error || data === undefined || id === undefined) return <div>Something went wrong 🧨</div>;

    return (
        <Stack spacing={2} display="block">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" mb={2}>
                    {data.name}
                </Typography>
                <Typography variant="h5" fontWeight="bold" mb={2}>
                    Info
                </Typography>
                <TableContainer component={Paper} sx={{ mb: 4, maxWidth: 500 }}>
                    <Table size="small" aria-label="bot details">
                        <TableBody>

                            <TableRow>
                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '40%' }}>
                                    Created
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        {new Date(data.creationDate).toLocaleDateString()}
                                    </Stack>
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '40%' }}>
                                    Owner
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <UserAvatar id={data.userId} />
                                    </Stack>
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                    Programmed in
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <LanguageIcon lang={data.language} />
                                        <Typography>{data.language}</Typography>
                                    </Stack>
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                    Rating
                                </TableCell>
                                <TableCell>{data.rating}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <Box>
                <Typography variant="h5" fontWeight="bold" mb={2}>
                    Code
                </Typography>
                <Button variant="contained" onClick={() => {
                    navigate("code")
                }}>Edit</Button>
            </Box>

            {/* Matches as a table */}
            <Box>
                <Typography variant="h5" fontWeight="bold" mb={2}>
                    Bot Matches
                </Typography>
                <BotMatches id={id} />
            </Box>

            {/* Delete Button */}
            <Button
                onClick={() => deleteMutation.mutate(id)}
                variant="contained"
                color="error"
                disabled={user != null && user.id !== data.userId}
                sx={{ mt: 3 }}
            >
                Delete
            </Button>

        </Stack>
    );
}

function BotMatches({ id }: { id: string }) {
    const apiUrl = useApiStore(state => state.apiBaseUrl);

    const { data, isLoading, error } = useQuery<Match[]>({
        queryKey: ['bot', id, 'matches'],
        queryFn: async () => {
            const res = await fetch(`${apiUrl}/matches/bot/${id}`);
            if (!res.ok) {
                const err = await res.json().catch(() => null);
                throw new Error(err?.detail || "Failed to fetch matches");
            }

            return res.json();
        },
        enabled: !!id,
    });

    console.log(isLoading);

    if (isLoading) return <CircularProgress />;
    if (error || data === undefined)
        return (
            <Typography color="error">Oops, couldn't load matches 🤷‍♂️</Typography>
        );

    return <MatchTable matches={data} />;
}