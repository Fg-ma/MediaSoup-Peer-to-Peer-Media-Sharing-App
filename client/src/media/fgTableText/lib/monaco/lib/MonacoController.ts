import { OnMount } from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import type * as monacoEditor from "monaco-editor";
import TableTextMediaInstance, {
  TextInstanceListenerTypes,
} from "../../../TableTextMediaInstance";
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
    private binding: React.MutableRefObject<MonacoBinding | null>,
    private settings: Settings,
    private textAreaContainerRef: React.RefObject<HTMLDivElement>,
    private isLineNums: boolean,
    private setIsLineNums:
      | React.Dispatch<React.SetStateAction<boolean>>
      | undefined,
    private sendGeneralSignal: (signal: GeneralSignals) => void,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
  ) {}

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

    // Create Monaco binding
    this.binding.current = new MonacoBinding(
      this.textMediaInstance.yText,
      this.editor.current.getModel()!,
      new Set([this.editor.current]),
    );

    this.textMediaInstance.ydoc.on("update", (update: Uint8Array, origin) => {
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

    this.editor.current.onMouseDown((e) => {
      const targetType = e.target.type;
      if (targetType === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS) {
        if (this.setIsLineNums) {
          this.setIsLineNums(false);
          this.editor.current?.updateOptions({ lineNumbers: "off" });
        }
      }
    });
  };

  handleTextInstanceMessage = (msg: TextInstanceListenerTypes) => {
    switch (msg.type) {
      case "initialized":
        this.setRerender((prev) => !prev);
        break;
      case "saved":
        if (!this.editor.current) return;

        this.binding.current?.destroy();

        this.binding.current = new MonacoBinding(
          this.textMediaInstance.yText,
          this.editor.current.getModel()!,
          new Set([this.editor.current]),
        );

        this.textMediaInstance.ydoc.on(
          "update",
          (update: Uint8Array, origin) => {
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
          },
        );
        break;
      default:
        break;
    }
  };
}

export default MonacoController;
