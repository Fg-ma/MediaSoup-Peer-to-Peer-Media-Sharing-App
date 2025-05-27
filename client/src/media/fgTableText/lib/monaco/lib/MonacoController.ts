import { OnMount } from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import type * as monacoEditor from "monaco-editor";
import TableTextMediaInstance from "../../../TableTextMediaInstance";
import { IncomingLiveTextEditingMessages } from "../../../../../serverControllers/liveTextEditingServer/lib/typeConstant";
import LiveTextEditingSocketController from "../../../../../serverControllers/liveTextEditingServer/LiveTextEditingSocketController";
import { Settings } from "../../typeConstant";

class MonacoController {
  constructor(
    private textMediaInstance: TableTextMediaInstance,
    private liveTextEditingSocket: React.MutableRefObject<
      LiveTextEditingSocketController | undefined
    >,
    private editorRef: React.MutableRefObject<monacoEditor.editor.IStandaloneCodeEditor | null>,
    private monacoRef: React.MutableRefObject<typeof monacoEditor | null>,
    private ydocRef: React.MutableRefObject<Y.Doc | null>,
    private yTextRef: React.MutableRefObject<Y.Text | null>,
    private bindingRef: React.MutableRefObject<MonacoBinding | null>,
    private recreatedRef: React.MutableRefObject<boolean>,
    private settings: Settings,
    private textAreaContainerRef: React.RefObject<HTMLDivElement>,
    private isLineNums: boolean,
    private setIsLineNums:
      | React.Dispatch<React.SetStateAction<boolean>>
      | undefined,
  ) {}

  private messageListener = (msg: IncomingLiveTextEditingMessages) => {
    switch (msg.type) {
      case "docUpdated": {
        const { contentId, instanceId } = msg.header;
        if (
          contentId !== this.textMediaInstance.textMedia.textId ||
          instanceId !== this.textMediaInstance.textInstanceId ||
          !this.ydocRef.current
        ) {
          return;
        }
        const payload = msg.data.payload;

        Y.applyUpdate(this.ydocRef.current, payload);
        break;
      }
      case "initialDocResponded": {
        const { contentId, instanceId } = msg.header;
        if (
          contentId !== this.textMediaInstance.textMedia.textId ||
          instanceId !== this.textMediaInstance.textInstanceId ||
          !this.ydocRef.current
        ) {
          return;
        }

        if (msg.data.payload.byteLength !== 0) {
          Y.applyUpdate(this.ydocRef.current, msg.data.payload, "noup");
        }
        break;
      }
      default:
        break;
    }
  };

  private recreateY = () => {
    if (
      this.recreatedRef.current ||
      !this.textMediaInstance.textMedia.textData.length
    )
      return;
    if (this.textMediaInstance.textMedia.loadingState === "downloaded")
      this.recreatedRef.current = true;

    // 1. Create a new Y.Doc and apply all chunks
    const newDoc = new Y.Doc();
    const newText = newDoc.getText("monaco");

    for (const update of this.textMediaInstance.textMedia.textData) {
      Y.applyUpdate(newDoc, update, "noup");
    }
    for (const update of this.textMediaInstance.ops) {
      Y.applyUpdate(newDoc, update, "noup");
    }

    // 2. Destroy the old binding (prevents memory leaks & lag)
    this.bindingRef.current?.destroy();

    // 3. Rebind the new doc to Monaco
    this.ydocRef.current?.destroy(); // optional: free memory
    this.ydocRef.current = newDoc;
    this.yTextRef.current = newText;

    this.bindingRef.current = new MonacoBinding(
      newText,
      this.editorRef.current!.getModel()!,
      new Set([this.editorRef.current!]),
    );

    // 4. Reattach the update handler
    this.ydocRef.current.on("update", (update: Uint8Array, origin) => {
      if (origin === this.bindingRef.current && origin !== "noup") {
        this.liveTextEditingSocket.current?.docUpdate(
          this.textMediaInstance.textMedia.textId,
          this.textMediaInstance.textInstanceId,
          update,
        );
      }
    });
  };

  handleEditorDidMount: OnMount = (editor, monaco) => {
    this.editorRef.current = editor;
    this.monacoRef.current = monaco;

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
        "editorLineNumber.foreground": this.settings.colors.indexColor.value,
        "editor.foreground": this.settings.colors.textColor.value,
        "minimap.background": "#00000000",
        focusBorder: "#00000000",
      },
    });
    monaco.editor.setTheme("transparent-theme");

    const container = this.textAreaContainerRef.current?.getElementsByClassName(
      "monaco-editor",
    )[0] as HTMLElement;
    if (container) {
      container.style.setProperty(
        "--vscode-editor-background",
        this.settings.colors.backgroundColor.value,
      );
      container.style.setProperty(
        "--vscode-editorLineNumber-foreground",
        this.settings.colors.indexColor.value,
      );
      this.textAreaContainerRef.current?.style.setProperty(
        "--text-color",
        this.settings.colors.textColor.value,
      );
    }

    // Initial editor options
    editor.updateOptions({
      fontSize: parseInt(this.settings.fontSize.value, 10),
      fontFamily: this.settings.fontStyle.value,
      lineNumbers: this.isLineNums ? "on" : "off",
    });

    // Setup Yjs doc
    this.ydocRef.current = new Y.Doc();
    this.yTextRef.current = this.ydocRef.current.getText("monaco");

    if (this.textMediaInstance.textMedia.textData.length) {
      for (const data of this.textMediaInstance.textMedia.textData) {
        Y.applyUpdate(this.ydocRef.current, data, "noup");
      }
    }

    // Create Monaco binding
    this.bindingRef.current = new MonacoBinding(
      this.yTextRef.current,
      editor.getModel()!,
      new Set([editor]),
    );

    this.ydocRef.current.on("update", (update: Uint8Array, origin) => {
      if (origin === this.bindingRef.current && origin !== "noup") {
        this.liveTextEditingSocket.current?.docUpdate(
          this.textMediaInstance.textMedia.textId,
          this.textMediaInstance.textInstanceId,
          update,
        );
      }
    });

    if (this.textMediaInstance.textMedia.loadingState !== "downloaded") {
      editor.onDidScrollChange(() => {
        const model = editor.getModel();
        if (!model || this.recreatedRef.current) return;

        const totalLines = model.getLineCount();
        const visibleRanges = editor.getVisibleRanges();
        if (visibleRanges.length === 0) return;

        const lastVisibleLine =
          visibleRanges[visibleRanges.length - 1].endLineNumber;

        if (totalLines - lastVisibleLine <= 200) {
          this.recreateY();
        }
      });
    }

    this.liveTextEditingSocket.current?.addMessageListener(
      this.messageListener,
    );

    this.liveTextEditingSocket.current?.getInitialDocState(
      this.textMediaInstance.textMedia.textId,
      this.textMediaInstance.textInstanceId,
    );

    editor.onMouseDown((e) => {
      const targetType = e.target.type;
      if (targetType === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS) {
        if (this.setIsLineNums) {
          this.setIsLineNums(false);
          editor.updateOptions({ lineNumbers: "off" });
        }
      }
    });

    return () => {
      this.liveTextEditingSocket.current?.removeMessageListener(
        this.messageListener,
      );
      this.bindingRef.current?.destroy();
      this.ydocRef.current?.destroy();
    };
  };
}

export default MonacoController;
