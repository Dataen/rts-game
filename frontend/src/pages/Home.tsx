import { Typography } from "@mui/material";
import { useAuthStore } from "../store/auth";

export default function Home() {
    const user = useAuthStore(store => store.user);

    if (!user) return;

    return <>
        <Typography variant="h3" gutterBottom>
            Welcome {user.displayName}!
        </Typography>
        <Typography>
            Create some bots and do some matches.
        </Typography>
        <Typography>
            Some more text should be here...
        </Typography>
    </>
}
