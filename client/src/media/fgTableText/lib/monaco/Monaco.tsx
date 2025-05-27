import React, { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import type * as monacoEditor from "monaco-editor";
import { Settings } from "../typeConstant";
import TableTextMediaInstance from "../../TableTextMediaInstance";
import { useSocketContext } from "../../../../context/socketContext/SocketContext";
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
}: {
  className?: string;
  settings: Settings;
  isLineNums?: boolean;
  setIsLineNums?: React.Dispatch<React.SetStateAction<boolean>>;
  isReadOnly?: boolean;
  setIsReadOnly?: React.Dispatch<React.SetStateAction<boolean>>;
  textMediaInstance: TableTextMediaInstance;
  externalTextAreaContainerRef?: React.RefObject<HTMLDivElement>;
}) {
  const { liveTextEditingSocket } = useSocketContext();

  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
    null,
  );
  const monacoRef = useRef<typeof monacoEditor | null>(null);

  const ydocRef = useRef<Y.Doc | null>(null);
  const yTextRef = useRef<Y.Text | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  const recreatedRef = useRef(false);

  const textAreaContainerRef = externalTextAreaContainerRef
    ? externalTextAreaContainerRef
    : useRef<HTMLDivElement>(null);

  const monacoController = useRef(
    new MonacoController(
      textMediaInstance,
      liveTextEditingSocket,
      editorRef,
      monacoRef,
      ydocRef,
      yTextRef,
      bindingRef,
      recreatedRef,
      settings,
      textAreaContainerRef,
      isLineNums,
      setIsLineNums,
    ),
  );

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.updateOptions({
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
    const editor = editorRef.current;
    if (!editor) return;
    editor.updateOptions({
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
      />
    </div>
  );
}
