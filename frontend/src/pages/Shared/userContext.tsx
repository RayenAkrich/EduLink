import { createContext, useContext, useState, useEffect } from "react";
import type { User } from "./types/User";

type UserContextType = {
    user: User | null;
    setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export default function UserContextProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        // Initialiser depuis localStorage au montage
        const stored = localStorage.getItem("edulink_user");
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return null;
            }
        }
        return null;
    });

    // Sauvegarder dans localStorage à chaque changement de user
    useEffect(() => {
        if (user) {
            localStorage.setItem("edulink_user", JSON.stringify(user));
        } else {
            localStorage.removeItem("edulink_user");
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser }}>
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
