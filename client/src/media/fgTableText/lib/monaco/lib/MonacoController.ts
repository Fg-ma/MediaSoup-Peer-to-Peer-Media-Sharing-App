import { OnMount } from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import type * as monacoEditor from "monaco-editor";
import TableTextMediaInstance from "../../../TableTextMediaInstance";
import { IncomingLiveTextEditingMessages } from "../../../../../serverControllers/liveTextEditingServer/lib/typeConstant";
import LiveTextEditingSocketController from "../../../../../serverControllers/liveTextEditingServer/LiveTextEditingSocketController";
import { Settings } from "../../typeConstant";
import { GeneralSignals } from "../../../../../context/signalContext/lib/typeConstant";

class MonacoController {
  private MAX_UPDATE_SIZE_BYTES = 10000;

  constructor(
    private textMediaInstance: TableTextMediaInstance,
    private liveTextEditingSocket: React.MutableRefObject<
      LiveTextEditingSocketController | undefined
    >,
    private editor: React.MutableRefObject<monacoEditor.editor.IStandaloneCodeEditor | null>,
    private monaco: React.MutableRefObject<typeof monacoEditor | null>,
    private ydoc: React.MutableRefObject<Y.Doc | null>,
    private yText: React.MutableRefObject<Y.Text | null>,
    private binding: React.MutableRefObject<MonacoBinding | null>,
    private recreatedRef: React.MutableRefObject<boolean>,
    private settings: Settings,
    private textAreaContainerRef: React.RefObject<HTMLDivElement>,
    private isLineNums: boolean,
    private setIsLineNums:
      | React.Dispatch<React.SetStateAction<boolean>>
      | undefined,
    private sendGeneralSignal: (signal: GeneralSignals) => void,
    private setIsInitializing: React.Dispatch<React.SetStateAction<boolean>>,
  ) {}

  private messageListener = (msg: IncomingLiveTextEditingMessages) => {
    switch (msg.type) {
      case "docUpdated": {
        const { contentId, instanceId } = msg.header;
        if (
          contentId !== this.textMediaInstance.textMedia.textId ||
          instanceId !== this.textMediaInstance.textInstanceId ||
          !this.ydoc.current
        ) {
          return;
        }
        const payload = msg.data.payload;

        Y.applyUpdate(this.ydoc.current, payload);
        break;
      }
      case "initialDocResponded": {
        const { contentId, instanceId, lastOps } = msg.header;
        if (
          contentId !== this.textMediaInstance.textMedia.textId ||
          instanceId !== this.textMediaInstance.textInstanceId
        )
          return;

        const ops = msg.data.payload;

        if (ops.length !== 0 && ops[0].byteLength !== 0) {
          if (this.ydoc.current)
            for (const op of ops) {
              Y.applyUpdate(this.ydoc.current, op, "noup");
            }
          if (lastOps) {
            this.setIsInitializing(false);
          }
        } else {
          this.setIsInitializing(false);
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
    this.binding.current?.destroy();

    // 3. Rebind the new doc to Monaco
    this.ydoc.current?.destroy(); // optional: free memory
    this.ydoc.current = newDoc;
    this.yText.current = newText;

    this.binding.current = new MonacoBinding(
      newText,
      this.editor.current!.getModel()!,
      new Set([this.editor.current!]),
    );

    // 4. Reattach the update handler
    this.ydoc.current.on("update", (update: Uint8Array, origin) => {
      if (origin === this.binding.current && origin !== "noup") {
        this.liveTextEditingSocket.current?.docUpdate(
          this.textMediaInstance.textMedia.textId,
          this.textMediaInstance.textInstanceId,
          update,
        );
      }
    });
  };

  handleEditorDidMount: OnMount = (editor, monaco) => {
    this.editor.current = editor;
    this.monaco.current = monaco;

    // Set the model language to plaintext
    if (this.editor.current.getModel()) {
      this.monaco.current.editor.setModelLanguage(
        this.editor.current.getModel()!,
        "plaintext",
      );
    }

    this.monaco.current.editor.defineTheme("transparent-theme", {
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
    this.monaco.current.editor.setTheme("transparent-theme");

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
    this.editor.current.updateOptions({
      fontSize: parseInt(this.settings.fontSize.value, 10),
      fontFamily: this.settings.fontStyle.value,
      lineNumbers: this.isLineNums ? "on" : "off",
    });

    // Setup Yjs doc
    this.ydoc.current = new Y.Doc();
    this.yText.current = this.ydoc.current.getText("monaco");

    if (this.textMediaInstance.textMedia.textData.length) {
      for (const data of this.textMediaInstance.textMedia.textData) {
        Y.applyUpdate(this.ydoc.current, data, "noup");
      }
    }

    // Create Monaco binding
    this.binding.current = new MonacoBinding(
      this.yText.current,
      editor.getModel()!,
      new Set([editor]),
    );

    this.ydoc.current.on("update", (update: Uint8Array, origin) => {
      if (
        origin === this.binding.current &&
        origin !== "noup" &&
        update.length < this.MAX_UPDATE_SIZE_BYTES
      ) {
        this.liveTextEditingSocket.current?.docUpdate(
          this.textMediaInstance.textMedia.textId,
          this.textMediaInstance.textInstanceId,
          update,
        );
      }
    });

    this.editor.current.onDidPaste((e) => {
      const pastedText = e.range
        ? this.editor.current?.getModel()?.getValueInRange(e.range)
        : "";
      if (pastedText && pastedText.length > this.MAX_UPDATE_SIZE_BYTES) {
        this.sendGeneralSignal({
          type: "tableInfoSignal",
          data: { message: "Pasted text is too long", timeout: 1250 },
        });
        this.editor.current?.trigger("cancelPaste", "undo", null);
      }
    });

    if (this.textMediaInstance.textMedia.loadingState !== "downloaded") {
      this.editor.current.onDidScrollChange(() => {
        const model = this.editor.current?.getModel();
        if (!model || this.recreatedRef.current) return;

        const totalLines = model.getLineCount();
        const visibleRanges = this.editor.current?.getVisibleRanges();
        if (!visibleRanges || visibleRanges.length === 0) return;

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

    this.editor.current.onMouseDown((e) => {
      const targetType = e.target.type;
      if (targetType === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS) {
        if (this.setIsLineNums) {
          this.setIsLineNums(false);
          this.editor.current?.updateOptions({ lineNumbers: "off" });
        }
      }
    });

    return () => {
      this.liveTextEditingSocket.current?.removeMessageListener(
        this.messageListener,
      );
      this.binding.current?.destroy();
      this.ydoc.current?.destroy();
    };
  };
}

export default MonacoController;
