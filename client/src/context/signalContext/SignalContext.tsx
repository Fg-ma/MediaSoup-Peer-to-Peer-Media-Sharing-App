import React, { createContext, useContext } from "react";
import { StaticContentTypes } from "../../../../universal/contentTypeConstant";

export type Signals =
  | {
      type: "localMuteChange";
      header: {
        table_id: string;
        username: string;
        instance: string;
        producerType: "audio" | "screenAudio";
        producerId: string | undefined;
      };
    }
  | {
      type: "startInstancesDrag";
      data: {
        instances: {
          contentType: StaticContentTypes;
          contentId: string;
          instances: {
            width: number;
            height: number;
          }[];
        }[];
      };
    }
  | {
      type: "stopInstancesDrag";
    };

export interface SignalContextProviderProps {
  children: React.ReactNode;
}

export interface SignalContextType {
  addSignalListener: (listener: (signal: Signals) => void) => void;
  removeSignalListener: (listener: (signal: Signals) => void) => void;
  sendSignal: (signal: Signals) => void;
}

const SignalContext = createContext<SignalContextType | undefined>(undefined);

export const useSignalContext = () => {
  const context = useContext(SignalContext);
  if (!context) {
    throw new Error(
      "useSignalContext must be used within an SignalContextProvider",
    );
  }
  return context;
};

export function SignalContextProvider({
  children,
}: SignalContextProviderProps) {
  const signalListeners: Set<(signal: Signals) => void> = new Set();

  const sendSignal = (signal: Signals) => {
    signalListeners.forEach((listener) => {
      listener(signal);
    });
  };

  const addSignalListener = (listener: (signal: Signals) => void): void => {
    signalListeners.add(listener);
  };

  const removeSignalListener = (listener: (signal: Signals) => void): void => {
    signalListeners.delete(listener);
  };

  return (
    <SignalContext.Provider
      value={{
        addSignalListener,
        removeSignalListener,
        sendSignal,
      }}
    >
      {children}
    </SignalContext.Provider>
  );
}

export default SignalContext;
