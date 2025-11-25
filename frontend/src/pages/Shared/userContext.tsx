import {  createContext, useContext, useState } from "react";
import type { User } from "./types/User";


type UserContextType={
    user: User|null;
    setUser:(user:User|null)=>void;
}
const UserContext=createContext<UserContextType|undefined>(undefined);
export default function UserContextProvider({children}: { children: React.ReactNode }){
    const [user,setUser]=useState<User|null>(null);
    return (
        <UserContext.Provider value={{user,setUser}}>
            {children}
        </UserContext.Provider>    
    )
    
}
export function useUser(){
    const context=useContext(UserContext);
    if(!context){
        throw new Error("the useUser must be used within the DashboardContextProvider")
    }
    return context;
}
