import React, { useRef, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import type * as monacoEditor from "monaco-editor";
import { useSocketContext } from "../../../../context/socketContext/SocketContext";
import { useSignalContext } from "../../../../context/signalContext/SignalContext";
import { Settings } from "../typeConstant";
import TableTextMediaInstance from "../../TableTextMediaInstance";
import MonacoController from "./lib/MonacoController";
import "./lib/monaco.css";

export default function Monaco({
  className,
  settings,
  isLineNums = false,
  setIsLineNums,
  isReadOnly = true,
  setIsReadOnly,
  textMediaInstance,
  externalTextAreaContainerRef,
  limitChunks,
}: {
  className?: string;
  settings: Settings;
  isLineNums?: boolean;
  setIsLineNums?: React.Dispatch<React.SetStateAction<boolean>>;
  isReadOnly?: boolean;
  setIsReadOnly?: React.Dispatch<React.SetStateAction<boolean>>;
  textMediaInstance: TableTextMediaInstance;
  externalTextAreaContainerRef?: React.RefObject<HTMLDivElement>;
  limitChunks?: number;
}) {
  const { liveTextEditingSocket } = useSocketContext();
  const { sendGeneralSignal } = useSignalContext();

  const editor = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const monaco = useRef<typeof monacoEditor | null>(null);

  const [isInitializing, setIsInitializing] = useState(true);

  const ydoc = useRef<Y.Doc | null>(null);
  const yText = useRef<Y.Text | null>(null);
  const binding = useRef<MonacoBinding | null>(null);

  const recreatedRef = useRef(false);

  const textAreaContainerRef = externalTextAreaContainerRef
    ? externalTextAreaContainerRef
    : useRef<HTMLDivElement>(null);

  const monacoController = useRef(
    new MonacoController(
      textMediaInstance,
      liveTextEditingSocket,
      editor,
      monaco,
      ydoc,
      yText,
      binding,
      recreatedRef,
      settings,
      textAreaContainerRef,
      isLineNums,
      setIsLineNums,
      sendGeneralSignal,
      setIsInitializing,
      limitChunks,
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

  return (
    <div
      ref={textAreaContainerRef}
      className={`${className} ${isReadOnly ? "readonly" : ""} monaco-container pointer-events-auto flex h-full w-full px-4 py-3`}
      style={{
        backgroundColor: settings.colors.backgroundColor.value,
      }}
      onDoubleClick={() => {
        if (setIsReadOnly) setIsReadOnly(false);
      }}
    >
      <Editor
        className={`${isInitializing ? "absolute opacity-0" : ""}`}
        height="100%"
        width="100%"
        defaultLanguage="plaintext"
        onMount={monacoController.current.handleEditorDidMount}
        options={{
          minimap: { enabled: settings.minimap.value },
          readOnly: isReadOnly,
          domReadOnly: isReadOnly,
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
      {isInitializing && (
        <div className="flex absolute inset-0 items-center justify-center">
          <span className="font-K2D text-xl text-fg-white">
            Initializing...
          </span>
        </div>
      )}
    </div>
  );
}
