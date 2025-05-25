import { AppBar, Avatar, Box, CssBaseline, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { MdHome } from 'react-icons/md';
import { LuSwords } from "react-icons/lu";

import { TbRobotFace } from 'react-icons/tb';
import { Link, Outlet, useLocation } from 'react-router';
import { useAuthStore } from './store/auth';
import { useApiStore } from './store/api';
import { FaSignOutAlt } from 'react-icons/fa';

const drawerWidth = 240;

export default function Layout() {
    const baseUrl = useApiStore((state) => state.baseUrl);
    const location = useLocation();
    const user = useAuthStore((state) => state.user);

    const handleLogout = () => {
        window.location.href = `${baseUrl}/auth/logout`;
    };
    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="h6" noWrap component="div">
                        Utimate Nexus
                    </Typography>

                    {user ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {user.picture && (
                                <Avatar
                                    src={user.picture}
                                    alt={user.displayName}
                                    sx={{ width: 32, height: 32 }}
                                />
                            )}
                            <Typography variant="body1" sx={{ whiteSpace: "nowrap" }}>
                                {user.displayName}
                            </Typography>
                            <IconButton color="inherit" onClick={handleLogout} aria-label="logout">
                                <FaSignOutAlt size={20} />
                            </IconButton>
                        </Box>
                    ) : null}
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        backgroundColor: '#1a1a2e',
                        color: '#fff',
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {[
                            { label: 'Home', to: '/home', icon: <MdHome size={24} /> },
                            { label: 'Matches', to: '/matches', icon: <LuSwords size={24} /> },
                            { label: 'Bots', to: '/bots', icon: <TbRobotFace size={24} /> },
                        ].map(({ label, to, icon }) => {
                            const selected = location.pathname === to;
                            return (
                                <ListItem key={to} disablePadding>
                                    <ListItemButton
                                        component={Link}
                                        to={to}
                                        sx={{
                                            color: '#fff',
                                            '&:hover': {
                                                backgroundColor: '#3f51b5',
                                            },
                                            ...(selected && {
                                                backgroundColor: '#3f51b5',
                                                fontWeight: 'bold',
                                            }),
                                        }}
                                    >
                                        <ListItemIcon sx={{ color: '#fff' }}>{icon}</ListItemIcon>
                                        <ListItemText primary={label} />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{ flexGrow: 1, bgcolor: 'background.default', p: 2, pt: 1 }}
            >
                <Toolbar />
                <Outlet /> {/* This renders whatever page matches the route */}
            </Box>
        </Box>
    );
}
