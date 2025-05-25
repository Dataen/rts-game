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
    Stack
} from '@mui/material';
import { botLanguages, type BotCreate } from '../types/Bot';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiStore } from '../store/api';
import { MdAdd } from "react-icons/md";
import { useAuthStore } from '../store/auth';
import { LanguageIcon } from './LanguageIcon';

type Props = {
    open: boolean;
    onClose: () => void;
};

export function AddBotDialog({ open, onClose }: Props) {
    const token = useAuthStore((state) => state.token);
    const apiUrl = useApiStore(state => state.apiBaseUrl);
    const [name, setName] = useState('');
    const [language, setLanguage] = useState<typeof botLanguages[number]>('python');
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (newBot: BotCreate) =>
            fetch(`${apiUrl}/bots`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newBot),
            }).then(res => {
                if (!res.ok) throw new Error('Failed to create bot');
                return res.json();
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bots"] });
            onClose();
            setName('');
            setLanguage('python');
        },
    });

    const handleSubmit = () => {
        if (!name.trim()) return;
        mutation.mutate({ name, language });
    };

    useEffect(() => {
        if (!open) {
            setName('');
            setLanguage('python');
        }
    }, [open]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 600 }}>✨ Add New Bot</DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                <TextField
                    autoFocus
                    margin="normal"
                    label="Bot Name"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    disabled={mutation.isPending}
                />

                <TextField
                    select
                    label="Language"
                    fullWidth
                    variant="outlined"
                    value={language}
                    onChange={e => setLanguage(e.target.value as typeof botLanguages[number])}
                    margin="normal"
                    disabled={mutation.isPending}
                >
                    {botLanguages.map(lang => (
                        <MenuItem key={lang} value={lang}>
                            <Stack alignItems="center" direction="row" spacing={1}>
                                <LanguageIcon lang={lang} />
                                <Typography>{lang}</Typography>
                            </Stack>
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
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={mutation.isPending}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={mutation.isPending || !name.trim()}
                    variant="contained"
                    startIcon={!mutation.isPending && <MdAdd size={24} />}
                >
                    {mutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Add Bot'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
