import { Button, Box, Typography } from '@mui/material';
import { useApiStore } from '../store/api';

export default function Login() {
    const baseUrl = useApiStore((state) => state.baseUrl);

    const handleLogin = () => {
        window.location.href = `${baseUrl}/auth/login`;
    };

    return (
        <Box
            sx={{
                height: '80vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Typography variant="h4" mb={4}>
                Welcome to AI RTS Arena
            </Typography>
            <Button variant="contained" color="primary" onClick={handleLogin}>
                Login with GitHub
            </Button>
        </Box>
    );
}
