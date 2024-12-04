import React, { createContext, useContext, useRef } from "react";

export type Permissions = {
  acceptsCameraEffects: boolean;
  acceptsScreenEffects: boolean;
  acceptsAudioEffects: boolean;
  acceptsPositionScaleRotationManipulation: boolean;
};

export interface PermissionsContextProviderProps {
  children: React.ReactNode;
}

export interface PermissionsContextType {
  permissions: React.MutableRefObject<Permissions>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(
  undefined
);

export const usePermissionsContext = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error(
      "usePermisionsContext must be used within an PermissionsContextProvider"
    );
  }
  return context;
};

export function PermissionsContextProvider({
  children,
}: PermissionsContextProviderProps) {
  const permissions = useRef<Permissions>({
    acceptsCameraEffects: true,
    acceptsScreenEffects: true,
    acceptsAudioEffects: true,
    acceptsPositionScaleRotationManipulation: true,
  });

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export default PermissionsContext;
