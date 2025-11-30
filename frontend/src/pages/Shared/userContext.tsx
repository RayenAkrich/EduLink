import { createContext, useContext, useState, useEffect } from "react";
import type { User } from "./types/User";

type UserContextType = {
    user: User | null;
    setUser: (user: User | null) => void;
    refreshUser: () => Promise<void>;
    loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export default function UserContextProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch user from server using token on mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetchUserFromToken();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserFromToken = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            const response = await fetch("http://localhost:5000/api/auth/me", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                // Token invalide ou expiré
                localStorage.removeItem("token");
                setUser(null);
                setLoading(false);
                return;
            }

            const data = await response.json();
            if (data.success && data.user) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Error fetching user from token:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const refreshUser = async () => {
        await fetchUserFromToken();
    };

    return (
        <UserContext.Provider value={{ user, setUser, refreshUser, loading }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("the useUser must be used within the UserContextProvider")
    }
    return context;
}
