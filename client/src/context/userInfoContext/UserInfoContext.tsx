import React, { createContext, useContext, useRef } from "react";
import { Device } from "mediasoup-client";
import { v4 as uuidv4 } from "uuid";
import { UserPreferences } from "./lib/typeConstant";

export interface UserInfoContextProviderProps {
  children: React.ReactNode;
}

export interface UserInfoContextType {
  userId: React.MutableRefObject<string>;
  tableId: React.MutableRefObject<string>;
  username: React.MutableRefObject<string>;
  instance: React.MutableRefObject<string>;
  preferences: React.MutableRefObject<UserPreferences>;
  device: React.MutableRefObject<Device | undefined>;
}

const UserInfoContext = createContext<UserInfoContextType | undefined>(
  undefined,
);

export const useUserInfoContext = () => {
  const context = useContext(UserInfoContext);
  if (!context) {
    throw new Error(
      "useUserInfoContext must be used within an UserInfoContextProvider",
    );
  }
  return context;
};

export function UserInfoContextProvider({
  children,
}: UserInfoContextProviderProps) {
  const userId = useRef("");
  const tableId = useRef("");
  const username = useRef("");
  const instance = useRef(uuidv4());
  const preferences = useRef<UserPreferences>({
    soundEffects: false,
    loadingAnimation: "bounce",
  });
  const device = useRef<Device>();

  return (
    <UserInfoContext.Provider
      value={{ userId, tableId, username, instance, preferences, device }}
    >
      {children}
    </UserInfoContext.Provider>
  );
}

export default UserInfoContext;
