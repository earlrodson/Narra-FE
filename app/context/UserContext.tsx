"use client";

import { createContext, useContext, useState } from "react";
interface user {
    id: string;
    email: string;
    chapter: string;
}


interface UserContextType {
    user: user | null;
    setUser: (user: user) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<user | null>(null);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const BUBBLE_VALIDATE_URL = process.env.NEXT_PUBLIC_BUBBLE_VALIDATE_URL;
    console.log('BACKEND_URL, BUBBLE_VALIDATE_URL:', BACKEND_URL, BUBBLE_VALIDATE_URL);
    

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
