import React, { useRef, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import type * as monacoEditor from "monaco-editor";
import { useSocketContext } from "../../../../context/socketContext/SocketContext";
import { useSignalContext } from "../../../../context/signalContext/SignalContext";
import { Settings } from "../typeConstant";
import TableTextMediaInstance from "../../TableTextMediaInstance";
import MonacoController from "./lib/MonacoController";
import "./lib/monaco.css";

export default function Monaco({
  textMediaInstance,
  className,
  settings,
  isLineNums = false,
  setIsLineNums,
  isReadOnly,
  externalInitializing,
  externalRerender,
  externalTextAreaContainerRef,
  forceFinishInitialization,
}: {
  textMediaInstance: TableTextMediaInstance;
  className?: string;
  settings: Settings;
  isLineNums?: boolean;
  setIsLineNums?: React.Dispatch<React.SetStateAction<boolean>>;
  isReadOnly?: React.MutableRefObject<boolean>;
  externalInitializing?: React.MutableRefObject<boolean>;
  externalRerender?: React.Dispatch<React.SetStateAction<boolean>>;
  externalTextAreaContainerRef?: React.RefObject<HTMLDivElement>;
  forceFinishInitialization?: React.MutableRefObject<boolean>;
}) {
  const { liveTextEditingSocket } = useSocketContext();
  const { sendGeneralSignal } = useSignalContext();

  const editor = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const monaco = useRef<typeof monacoEditor | null>(null);
  const binding = useRef<MonacoBinding | null>(null);
  const initializing = externalInitializing
    ? externalInitializing
    : useRef(false);

  const [_, setRerender] = useState(false);

  const textAreaContainerRef = externalTextAreaContainerRef
    ? externalTextAreaContainerRef
    : useRef<HTMLDivElement>(null);

  const monacoController = useRef(
    new MonacoController(
      textMediaInstance,
      liveTextEditingSocket,
      editor,
      monaco,
      binding,
      settings,
      textAreaContainerRef,
      isLineNums,
      setIsLineNums,
      sendGeneralSignal,
      setRerender,
      isReadOnly,
      initializing,
      forceFinishInitialization,
      externalRerender,
    ),
  );

  useEffect(() => {
    if (!editor.current) return;
    editor.current.updateOptions({
      fontSize: parseInt(settings.fontSize.value, 10),
      fontFamily: settings.fontStyle.value,
      lineNumbers: isLineNums ? "on" : "off",
    });

    const container = textAreaContainerRef.current?.getElementsByClassName(
      "monaco-editor",
    )[0] as HTMLElement;
    if (container) {
      container.style.setProperty(
        "--vscode-editor-background",
        settings.colors.backgroundColor.value,
      );
      container.style.setProperty(
        "--vscode-editorLineNumber-foreground",
        settings.colors.indexColor.value,
      );
      textAreaContainerRef.current?.style.setProperty(
        "--text-color",
        settings.colors.textColor.value,
      );
    }
  }, [settings]);

  useEffect(() => {
    if (!editor.current) return;

    editor.current.updateOptions({
      lineNumbers: isLineNums ? "on" : "off",
    });
  }, [isLineNums]);

  useEffect(() => {
    textMediaInstance.addTextInstanceListener(
      monacoController.current.handleTextInstanceMessage,
    );

    return () => {
      textMediaInstance.removeTextInstanceListener(
        monacoController.current.handleTextInstanceMessage,
      );
    };
  }, []);

  return (
    <div
      ref={textAreaContainerRef}
      className={`${className} ${isReadOnly?.current ? "readonly" : ""} monaco-container pointer-events-auto flex h-full w-full px-4 py-3`}
      style={{
        backgroundColor: settings.colors.backgroundColor.value,
      }}
      onDoubleClick={() => {
        if (isReadOnly && isReadOnly.current) {
          isReadOnly.current = false;
          if (externalRerender) externalRerender((prev) => !prev);
        }
      }}
    >
      <Editor
        className={`${textMediaInstance.initializingState === "initializing" ? "absolute opacity-0" : ""}`}
        height="100%"
        width="100%"
        defaultLanguage="plaintext"
        onMount={monacoController.current.handleEditorDidMount}
        options={{
          stickyScroll: { enabled: false },
          minimap: { enabled: settings.minimap.value },
          readOnly: initializing.current ? true : (isReadOnly?.current ?? true),
          domReadOnly: isReadOnly?.current ?? true,
          cursorStyle: settings.cursorStyle.value,
          automaticLayout: true,
          largeFileOptimizations: true,
          overviewRulerLanes: 0,
          folding: false,
          smoothScrolling: true,
          renderLineHighlight: "none",
          wordWrap: "off",
          occurrencesHighlight: "off",
          selectionHighlight: false,
          renderWhitespace: "none",
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          wordBasedSuggestions: "off",
          contextmenu: false,
          tabSize: 2,
          detectIndentation: false,
          glyphMargin: false,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 0,
        }}
        loading={
          <div className="flex absolute inset-0 items-center justify-center">
            <span className="font-K2D text-xl text-fg-white">
              Initializing...
            </span>
          </div>
        }
      />
      {textMediaInstance.initializingState === "initializing" && (
        <div className="flex absolute inset-0 items-center justify-center">
          <span className="font-K2D text-xl text-fg-white">
            Initializing...
          </span>
        </div>
      )}
    </div>
  );
}
