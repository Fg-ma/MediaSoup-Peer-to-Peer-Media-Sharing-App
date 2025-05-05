import React, { createContext, useContext, useRef } from "react";
import ChunkedUploader from "../../uploader/lib/chunkUploader/ChunkUploader";
import { UploadSignals } from "./lib/typeConstant";

export interface UploadContextProviderProps {
  children: React.ReactNode;
}

export interface UploadContextType {
  addUploadSignalListener: (listener: (signal: UploadSignals) => void) => void;
  removeUploadSignalListener: (
    listener: (signal: UploadSignals) => void,
  ) => void;
  sendUploadSignal: (signal: UploadSignals) => void;
  addCurrentUpload: (id: string, upload: ChunkedUploader) => void;
  removeCurrentUpload: (id: string) => void;
  getCurrentUploads: () => {
    [filename: string]: ChunkedUploader;
  };
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const useUploadContext = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error(
      "useUploadContext must be used within an UploadContextProvider",
    );
  }
  return context;
};

export function UploadContextProvider({
  children,
}: UploadContextProviderProps) {
  const currentUploads = useRef<{
    [filename: string]: ChunkedUploader;
  }>({});
  const uploadSignalListeners: Set<(signal: UploadSignals) => void> = new Set();

  const addUploadSignalListener = (
    listener: (signal: UploadSignals) => void,
  ): void => {
    uploadSignalListeners.add(listener);
  };

  const removeUploadSignalListener = (
    listener: (signal: UploadSignals) => void,
  ): void => {
    uploadSignalListeners.delete(listener);
  };

  const sendUploadSignal = (signal: UploadSignals) => {
    uploadSignalListeners.forEach((listener) => {
      listener(signal);
    });
  };

  const addCurrentUpload = (id: string, upload: ChunkedUploader) => {
    if (currentUploads.current[id]) return;

    currentUploads.current[id] = upload;
  };

  const removeCurrentUpload = (id: string) => {
    if (!currentUploads.current[id]) return;

    delete currentUploads.current[id];
  };

  const getCurrentUploads = () => {
    return currentUploads.current;
  };

  return (
    <UploadContext.Provider
      value={{
        addUploadSignalListener,
        removeUploadSignalListener,
        sendUploadSignal,
        addCurrentUpload,
        removeCurrentUpload,
        getCurrentUploads,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export default UploadContext;
