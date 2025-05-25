import { useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useApiStore } from '../store/api';
import type { Bot } from '../types/Bot';
import { Alert, Button, CircularProgress, IconButton, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { useAuthStore } from '../store/auth';
import { CodeEditor } from '../components/CodeEditor';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaPlay } from 'react-icons/fa';


type Params = {
    id: string;
}

export default function BotCode() {
    const apiUrl = useApiStore(state => state.apiBaseUrl);
    const { id } = useParams<Params>();
    const token = useAuthStore(state => state.token);
    const navigate = useNavigate();

    const [code, setCode] = useState('this is my code');
    const [loadingCode, setLoadingCode] = useState(true);
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [runOutput, setRunOutput] = useState('');
    const [running, setRunning] = useState(false);

    const prevCodeRef = useRef<string | null>(null);


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

    const handleUpload = async (newCode: string) => {
        setSaveState('saving');
        const file = new File([newCode], "code.txt", { type: "text/plain" });
        const formData = new FormData();
        formData.append("file", file);

        try {
            await fetch(`${apiUrl}/bots/${id}/code`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            setSaveState('saved');
            prevCodeRef.current = newCode;
        } catch (err) {
            console.error("Auto-save failed", err);
        } finally {
            setTimeout(() => setSaveState('idle'), 1000);
        }
    };

    const handleRun = async () => {
        setRunning(true);
        try {
            const res = await fetch(`${apiUrl}/bots/${data?.id}/run`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const output = await res.text();
            setRunOutput(output);
        } catch (err) {
            setRunOutput("❌ Error running bot");
        } finally {
            setRunning(false);
        }
    };

    useEffect(() => {
        fetch(`${apiUrl}/bots/${id}/code`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
            .then(res => {
                if (!res.ok) throw new Error("Code fetch fail");
                return res.text();
            })
            .then(setCode)
            .catch(console.error)
            .finally(() => setLoadingCode(false));
    }, [id]);

    const debouncedSave = useRef(
        debounce((newCode: string) => {
            if (newCode !== prevCodeRef.current) {
                handleUpload(newCode);
            }
        }, 500)
    ).current;

    useEffect(() => {
        if (!loadingCode) {
            debouncedSave(code);
        }
    }, [code]);

    useEffect(() => {
        return () => {
            debouncedSave.cancel();
        };
    }, []);

    if (isLoading) return <CircularProgress />;
    if (error || data === undefined || id === undefined) return <div>Something went wrong 🧨</div>;

    return (
        <Stack spacing={2} display="block">
            <Typography variant="h4" fontWeight="bold" mb={2}>
                {data.name}
            </Typography>
            {loadingCode ?
                <CircularProgress /> :
                <CodeEditor
                    language={data.language}
                    value={code}
                    onChange={(code) => setCode(code)}
                    onBlur={() => handleUpload(code)}
                />}

            <Button startIcon={<FaPlay size={24} />} variant="contained" onClick={handleRun} disabled={running}>
                Run
            </Button>

            {runOutput && (
                <TextField
                    multiline
                    fullWidth
                    value={runOutput}
                    label="Output"
                    slotProps={{
                        input: {
                            readOnly: true
                        }
                    }}
                />
            )}
        </Stack>
    );
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay = 300) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const debounced = (...args: Parameters<T>) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            fn(...args);
        }, delay);
    };

    debounced.cancel = () => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = null;
    };

    return debounced as T & { cancel: () => void };
}