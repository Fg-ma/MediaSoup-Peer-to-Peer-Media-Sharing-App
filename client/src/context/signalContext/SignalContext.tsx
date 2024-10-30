import React, { createContext, useContext, useState } from "react";

export type Signals =
  | undefined
  | {
      type: "localMuteChange";
      table_id: string;
      username: string;
      instance: string;
    };

export interface SignalContextProviderProps {
  children: React.ReactNode;
}

export interface SignalContextType {
  signal: Signals;
  setSignal: React.Dispatch<React.SetStateAction<Signals>>;
}

const SignalContext = createContext<SignalContextType | undefined>(undefined);

export const useSignalContext = () => {
  const context = useContext(SignalContext);
  if (!context) {
    throw new Error(
      "useSignalContext must be used within an SignalContextProvider"
    );
  }
  return context;
};

export function SignalContextProvider({
  children,
}: SignalContextProviderProps) {
  const [signal, setSignal] = useState<Signals>(undefined);

  return (
    <SignalContext.Provider
      value={{
        signal,
        setSignal,
      }}
    >
      {children}
    </SignalContext.Provider>
  );
}

export default SignalContext;
