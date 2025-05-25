import { useQuery } from '@tanstack/react-query';
import { Typography, CircularProgress, Button, Stack } from '@mui/material';
import { useApiStore } from '../store/api';
import type { Bot } from '../types/Bot';
import { useState } from 'react';
import { AddBotDialog } from '../components/AddBotDialog';
import { TbRobotFace } from 'react-icons/tb';
import { BotTable } from '../components/BotTable';

export default function Bots() {
    const apiUrl = useApiStore(state => state.apiBaseUrl);

    const { data, isLoading, error } = useQuery<Bot[]>({
        queryKey: ['bots'],
        queryFn: () =>
            fetch(`${apiUrl}/bots`).then(res => {
                if (!res.ok) throw new Error('Failed to fetch bots');
                return res.json();
            }),
    });

    const [open, setOpen] = useState(false);

    if (isLoading) return <CircularProgress />;
    if (error || data === undefined) return <Typography color="error">Oops, couldn't load bots 🤷‍♂️</Typography>;

    return (
        <>
            <Stack spacing={2} display={"block"}>
                <Typography variant="h4">Bots</Typography>
                <Button color={"info"} startIcon={<TbRobotFace size={24} />} variant="contained" onClick={() => setOpen(true)}>New Bot</Button>

                <BotTable bots={data} />
            </Stack>

            <AddBotDialog
                open={open}
                onClose={() => setOpen(false)}
            />
        </>
    );
}
