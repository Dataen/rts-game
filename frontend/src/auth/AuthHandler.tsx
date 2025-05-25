import { useEffect } from "react";
import { useAuthStore } from "../store/auth";
import { useLocation, useNavigate } from "react-router";
import { useApiStore } from "../store/api";
import type { User } from "../types/User";

export function AuthHandler() {
    const apiUrl = useApiStore((state) => state.apiBaseUrl);
    const setToken = useAuthStore((state) => state.setToken);
    const setUser = useAuthStore((state) => state.setUser);
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchInfo() {
            try {
                const res = await fetch(`${apiUrl}/user/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error("Failed to fetch user info");

                const userData: User = await res.json();
                setUser(userData);
            } catch (err) {
                console.error("fetchUserInfo error:", err);
                clearAuth();
            } finally {
                navigate("/", { replace: true });
            }
        }

        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        if (token) {
            setToken(token);
            fetchInfo();
        }
    }, [location, setToken, navigate]);

    return null;
}

