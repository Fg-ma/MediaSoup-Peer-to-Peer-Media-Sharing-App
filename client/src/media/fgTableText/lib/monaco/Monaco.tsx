import React, { useRef, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import type * as monacoEditor from "monaco-editor";
import { useSocketContext } from "../../../../context/socketContext/SocketContext";
import { useSignalContext } from "../../../../context/signalContext/SignalContext";
import { useEffectsContext } from "../../../../context/effectsContext/EffectsContext";
import TableTextMediaInstance from "../../TableTextMediaInstance";
import MonacoController from "./lib/MonacoController";
import "./lib/monaco.css";

export default function Monaco({
  height,
  textMediaInstance,
  className,
  isLineNums = false,
  setIsLineNums,
  externalInitializing,
  externalRerender,
  externalTextAreaContainerRef,
  forceFinishInitialization,
  forceIsReadOnly,
}: {
  height?: string;
  textMediaInstance: TableTextMediaInstance;
  className?: string;
  isLineNums?: boolean;
  setIsLineNums?: React.Dispatch<React.SetStateAction<boolean>>;
  externalInitializing?: React.MutableRefObject<boolean>;
  externalRerender?: React.Dispatch<React.SetStateAction<boolean>>;
  externalTextAreaContainerRef?: React.RefObject<HTMLDivElement>;
  forceFinishInitialization?: React.MutableRefObject<boolean>;
  forceIsReadOnly?: boolean;
}) {
  const { staticContentEffectsStyles } = useEffectsContext();
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
      staticContentEffectsStyles,
      editor,
      monaco,
      binding,
      textAreaContainerRef,
      isLineNums,
      setIsLineNums,
      sendGeneralSignal,
      setRerender,
      initializing,
      forceFinishInitialization,
      externalRerender,
      forceIsReadOnly,
    ),
  );

  useEffect(() => {
    if (!editor.current) return;

    const effectsStyles =
      staticContentEffectsStyles.current.text[textMediaInstance.textInstanceId];

    editor.current.updateOptions({
      fontSize: parseInt(effectsStyles.fontSize, 10),
      fontFamily: effectsStyles.fontStyle,
      lineNumbers: isLineNums ? "on" : "off",
      letterSpacing: effectsStyles.letterSpacing,
    });

    const container = textAreaContainerRef.current?.getElementsByClassName(
      "monaco-editor",
    )[0] as HTMLElement;
    if (container) {
      container.style.setProperty(
        "--vscode-editor-background",
        effectsStyles.backgroundColor,
      );
      container.style.setProperty(
        "--vscode-editorLineNumber-foreground",
        effectsStyles.indexColor,
      );
      textAreaContainerRef.current?.style.setProperty(
        "--text-color",
        effectsStyles.textColor,
      );
    }
  }, [
    JSON.stringify(
      staticContentEffectsStyles.current.text[textMediaInstance.textInstanceId],
    ),
  ]);

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
      className={`${className} ${forceIsReadOnly || textMediaInstance.isReadOnly ? "readonly" : ""} monaco-container pointer-events-auto flex w-full px-4 py-3`}
      style={{
        backgroundColor:
          staticContentEffectsStyles.current.text[
            textMediaInstance.textInstanceId
          ].backgroundColor,
        height: height ? height : "100%",
      }}
      onDoubleClick={() => {
        if (!forceIsReadOnly && textMediaInstance.isReadOnly) {
          textMediaInstance.isReadOnly = false;
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
          minimap: { enabled: textMediaInstance.settings.minimap.value },
          readOnly: initializing.current
            ? true
            : forceIsReadOnly || textMediaInstance.isReadOnly,
          domReadOnly: forceIsReadOnly || textMediaInstance.isReadOnly,
          cursorStyle: textMediaInstance.settings.cursorStyle.value,
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
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-K2D text-xl text-fg-white">
              Initializing...
            </span>
          </div>
        }
      />
      {textMediaInstance.initializingState === "initializing" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-K2D text-xl text-fg-white">
            Initializing...
          </span>
        </div>
      )}
    </div>
  );
}
