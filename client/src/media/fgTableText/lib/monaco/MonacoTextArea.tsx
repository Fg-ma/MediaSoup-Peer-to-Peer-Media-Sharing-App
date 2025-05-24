import React, { useRef, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type * as monacoEditor from "monaco-editor";
import { Settings } from "../typeConstant";
import { TextListenerTypes } from "../../TableTextMedia";
import TableTextMediaInstance from "../../TableTextMediaInstance";
import "./monaco.css";

export default function MonacoTextArea({
  className,
  initialText,
  settings,
  isLineNums = false,
  setIsLineNums,
  isReadOnly = true,
  setIsReadOnly,
  textMediaInstance,
  externalTextAreaContainerRef,
}: {
  className?: string;
  initialText: string;
  settings: Settings;
  isLineNums?: boolean;
  setIsLineNums?: React.Dispatch<React.SetStateAction<boolean>>;
  isReadOnly?: boolean;
  setIsReadOnly?: React.Dispatch<React.SetStateAction<boolean>>;
  textMediaInstance: TableTextMediaInstance;
  externalTextAreaContainerRef?: React.RefObject<HTMLDivElement>;
}) {
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
    null,
  );
  const monacoRef = useRef<typeof monacoEditor | null>(null);
  const textAreaContainerRef = externalTextAreaContainerRef
    ? externalTextAreaContainerRef
    : useRef<HTMLDivElement>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Set the model language to plaintext
    if (editor.getModel()) {
      monaco.editor.setModelLanguage(editor.getModel()!, "plaintext");
    }

    monaco.editor.defineTheme("transparent-theme", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#00000000",
        "editorGutter.background": "#00000000",
        "editorLineNumber.foreground": settings.colors.indexColor.value,
        "editor.foreground": settings.colors.textColor.value,
        "minimap.background": "#00000000",
        focusBorder: "#00000000",
      },
    });
    monaco.editor.setTheme("transparent-theme");

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

    // Initial editor options
    editor.updateOptions({
      fontSize: parseInt(settings.fontSize.value, 10),
      fontFamily: settings.fontStyle.value,
      lineNumbers: isLineNums ? "on" : "off",
    });

    editor.onMouseDown((e) => {
      const targetType = e.target.type;
      if (targetType === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS) {
        if (setIsLineNums) {
          setIsLineNums(false);
          editor.updateOptions({ lineNumbers: "off" });
        }
      }
    });

    // Listen for content changes
    // editor.getModel()?.onDidChangeContent(() => {
    //   onChange?.(editor.getValue());
    // });
  };

  // Update editor options when settings change
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

  useEffect(() => {
    const handleTextMessages = (event: TextListenerTypes) => {
      if (
        event.type === "downloadComplete" &&
        textMediaInstance.textMedia.text
      ) {
        editorRef.current?.setValue(textMediaInstance.textMedia.text);
      }
    };

    textMediaInstance.textMedia.addTextListener(handleTextMessages);

    return () => {
      textMediaInstance.textMedia.addTextListener(handleTextMessages);
    };
  }, []);

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
        defaultValue={initialText}
        onMount={handleEditorDidMount}
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
