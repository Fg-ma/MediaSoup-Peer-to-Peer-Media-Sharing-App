import React, { createContext, useContext, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

export interface UserInfoContextProviderProps {
  children: React.ReactNode;
}

export interface UserInfoContextType {
  table_id: React.MutableRefObject<string>;
  username: React.MutableRefObject<string>;
  instance: React.MutableRefObject<string>;
}

const UserInfoContext = createContext<UserInfoContextType | undefined>(
  undefined
);

export const useUserInfoContext = () => {
  const context = useContext(UserInfoContext);
  if (!context) {
    throw new Error(
      "usePermisionsContext must be used within an UserInfoContextProvider"
    );
  }
  return context;
};

export function UserInfoContextProvider({
  children,
}: UserInfoContextProviderProps) {
  const table_id = useRef("");
  const username = useRef("");
  const instance = useRef(uuidv4());

  return (
    <UserInfoContext.Provider value={{ table_id, username, instance }}>
      {children}
    </UserInfoContext.Provider>
  );
}

export default UserInfoContext;
