import { Avatar, Box, Typography } from "@mui/material";
import { useUserCacheStore } from "../store/user";
import { useEffect } from "react";

type Props = {
    id: string;
}

export function UserAvatar({ id }: Props) {
    const cache = useUserCacheStore(state => state.cache);
    const fetchUser = useUserCacheStore(state => state.fetchUser);

    useEffect(() => {
        if (id) {
            fetchUser(id);
        }
    }, [id, fetchUser]);

    const user = cache[id];

    if (!user) return <Typography>Loading...</Typography>

    return (
        <Box
            onClick={() => {

            }}
            sx={{
                display: "flex", alignItems: "center", gap: 1, ':hover': {
                    cursor: 'pointer'
                }
            }}>
            {user.avatarUrl && (
                <Avatar
                    src={user.avatarUrl}
                    alt={user.username}
                    sx={{ width: 32, height: 32 }}
                />
            )}
            <Typography variant="body1" sx={{ whiteSpace: "nowrap" }}>
                {user.username}
            </Typography>
        </Box>
    );
}