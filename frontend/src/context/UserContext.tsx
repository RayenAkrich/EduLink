import React from "react";

type UserContextType = {
  id_user: number;
  token: string | null;
  setUser?: (id: number, token: string | null) => void;
};

export const UserContext = React.createContext<UserContextType>({
  id_user: 1,
  token: null,
});

export const UserProvider: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const [id_user, setIdUser] = React.useState<number>(Number(localStorage.getItem("id_user")) || 1);
  const [token, setToken] = React.useState<string | null>(localStorage.getItem("token"));

  const setUser = (id: number, t: string | null) => {
    setIdUser(id);
    setToken(t);
    if (t) {
      localStorage.setItem("token", t);
      localStorage.setItem("id_user", String(id));
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("id_user");
    }
  };

  return (
    <UserContext.Provider value={{ id_user, token, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
