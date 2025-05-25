import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Button,
    CircularProgress,
    Fade,
    Box,
    Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiStore } from '../store/api';
import { useAuthStore } from '../store/auth';
import { MdAdd } from 'react-icons/md';
import type { MatchCreate } from '../types/Match';
import type { Bot } from '../types/Bot';

type Props = {
    open: boolean;
    onClose: () => void;
};



export function AddMatchDialog({ open, onClose }: Props) {
    const token = useAuthStore((state) => state.token);
    const apiUrl = useApiStore((state) => state.apiBaseUrl);
    const queryClient = useQueryClient();

    const [bot1, setBot1] = useState('');
    const [bot2, setBot2] = useState('');

    const { data: bots = [], isLoading: botsLoading } = useQuery<Bot[]>({
        queryKey: ['bots'],
        queryFn: () => fetch(`${apiUrl}/bots`).then((res) => res.json()),
        enabled: open,
    });

    const mutation = useMutation({
        mutationFn: (newMatch: MatchCreate) =>
            fetch(`${apiUrl}/matches`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newMatch),
            }).then((res) => {
                if (!res.ok) throw new Error('Failed to create match');
                return res.json();
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['matches'] });
            onClose();
            setBot1('');
            setBot2('');
        },
    });

    const handleSubmit = () => {
        if (!bot1 || !bot2 || bot1 === bot2) return;
        mutation.mutate({ bot1Uuid: bot1, bot2Uuid: bot2 });
    };

    useEffect(() => {
        if (!open) {
            setBot1('');
            setBot2('');
        }
    }, [open]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 600 }}>⚔️ Create New Match</DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                {botsLoading ? (
                    <CircularProgress />
                ) : (
                    <>
                        <TextField
                            select
                            fullWidth
                            margin="normal"
                            label="Bot 1"
                            value={bot1}
                            onChange={(e) => setBot1(e.target.value)}
                            disabled={mutation.isPending}
                        >
                            {bots.map((bot) => (
                                <MenuItem key={bot.id} value={bot.id}>
                                    {bot.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            fullWidth
                            margin="normal"
                            label="Bot 2"
                            value={bot2}
                            onChange={(e) => setBot2(e.target.value)}
                            disabled={mutation.isPending}
                            error={bot1 === bot2 && bot2 !== ''}
                            helperText={bot1 === bot2 && 'Choose different bots'}
                        >
                            {bots.map((bot) => (
                                <MenuItem key={bot.id} value={bot.id}>
                                    {bot.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Fade in={mutation.isError}>
                            <Box mt={1}>
                                <Typography color="error" variant="body2">
                                    {mutation.error instanceof Error ? mutation.error.message : 'Something went wrong'}
                                </Typography>
                            </Box>
                        </Fade>
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={mutation.isPending}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={mutation.isPending || !bot1 || !bot2 || bot1 === bot2}
                    variant="contained"
                    startIcon={!mutation.isPending && <MdAdd size={24} />}
                >
                    {mutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Create Match'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
