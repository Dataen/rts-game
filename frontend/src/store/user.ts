import { create } from "zustand";
import type { GitHubUser } from "../types/GitHubUser";
import { createJSONStorage, persist } from "zustand/middleware";

interface UserCacheState {
    cache: Record<string, GitHubUser>;
    fetchUser: (id: string) => Promise<GitHubUser>;
}

export const useUserCacheStore = create(
    persist<UserCacheState>(
        (set, get) => ({
            cache: {},

            fetchUser: async (id) => {
                if (get().cache[id]) return get().cache[id];

                const res = await fetch(`https://api.github.com/user/${id}`);
                if (!res.ok) throw Error("Unable to get GitHub user data");

                const data = await res.json();
                set(state => ({
                    cache: {
                        ...state.cache, [id]: {
                            id: data.id,
                            avatarUrl: data.avatar_url,
                            username: data.login
                        }
                    },
                }));
                return data;
            },
        }),
        {
            name: "users-cache",
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);