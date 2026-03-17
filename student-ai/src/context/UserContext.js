import { createContext, useState } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {

    const [user, setUser] = useState(null);

    const startUsingApp = () => {
        setUser({
            name: "Student",
            progress: 0,
            activeDays: [],
        });
    };

    return(
        <UserContext.Provider value={{ user, setUser, startUsingApp }}>
            {children}
        </UserContext.Provider>
    );
}