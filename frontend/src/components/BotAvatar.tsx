import { Avatar, Box, Typography } from "@mui/material";
import { useUserCacheStore } from "../store/user";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Bot } from "../types/Bot";
import { useApiStore } from "../store/api";
import { LanguageIcon } from "./LanguageIcon";

type Props = {
    id: string;
}

export function BotAvatar({ id }: Props) {
    const apiUrl = useApiStore(state => state.apiBaseUrl);

    const { data, isLoading, error } = useQuery<Bot>({
        queryKey: ['bot', id],
        queryFn: async () => {
            const res = await fetch(`${apiUrl}/bots/${id}`);
            if (!res.ok) {
                const err = await res.json().catch(() => null);
                throw new Error(err?.detail || "Failed to fetch bot");
            }

            return res.json();
        },
        enabled: !!id,
    });

    if (isLoading) return <Typography>Loading...</Typography>
    if (error || data === undefined) return <Typography>Error!</Typography>

    return (
        <Box
            onClick={() => {

            }}
            sx={{
                display: "flex", alignItems: "center", gap: 1, ':hover': {
                    cursor: 'pointer'
                }
            }}>
            {data.language && (
                <LanguageIcon lang={data.language} />
            )}
            <Typography variant="body1" sx={{ whiteSpace: "nowrap" }}>
                {data.name}
            </Typography>
        </Box>
    );
}