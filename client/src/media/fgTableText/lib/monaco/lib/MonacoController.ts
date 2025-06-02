import { OnMount } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import type * as monacoEditor from "monaco-editor";
import TableTextMediaInstance, {
  TextInstanceListenerTypes,
} from "../../../TableTextMediaInstance";
import LiveTextEditingSocketController from "../../../../../serverControllers/liveTextEditingServer/LiveTextEditingSocketController";
import { Settings } from "../../typeConstant";
import { GeneralSignals } from "../../../../../context/signalContext/lib/typeConstant";
import { StaticContentEffectsStylesType } from "../../../../../../../universal/effectsTypeConstant";

class MonacoController {
  private MAX_UPDATE_SIZE_BYTES = 10_000;
  private INITIALIZE_CHUNK_SIZE = 1_000_000;

  constructor(
    private textMediaInstance: TableTextMediaInstance,
    private liveTextEditingSocket: React.MutableRefObject<
      LiveTextEditingSocketController | undefined
    >,
    private staticContentEffectsStyles: React.MutableRefObject<StaticContentEffectsStylesType>,
    private editor: React.MutableRefObject<monacoEditor.editor.IStandaloneCodeEditor | null>,
    private monaco: React.MutableRefObject<typeof monacoEditor | null>,
    private binding: React.MutableRefObject<MonacoBinding | null>,
    private textAreaContainerRef: React.RefObject<HTMLDivElement>,
    private isLineNums: boolean,
    private setIsLineNums:
      | React.Dispatch<React.SetStateAction<boolean>>
      | undefined,
    private sendGeneralSignal: (signal: GeneralSignals) => void,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private initializing: React.MutableRefObject<boolean>,
    private forceFinishInitialization:
      | React.MutableRefObject<boolean>
      | undefined,
    private externalRerender:
      | React.Dispatch<React.SetStateAction<boolean>>
      | undefined,
    private forceIsReadOnly: boolean | undefined,
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

    const effectsStyles =
      this.staticContentEffectsStyles.current.text[
        this.textMediaInstance.textInstanceId
      ];

    this.monaco.current.editor.defineTheme("transparent-theme", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#00000000",
        "editorGutter.background": "#00000000",
        "editorLineNumber.foreground": effectsStyles.indexColor,
        "editor.foreground": effectsStyles.textColor,
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
        effectsStyles.backgroundColor,
      );
      container.style.setProperty(
        "--vscode-editorLineNumber-foreground",
        effectsStyles.indexColor,
      );
      this.textAreaContainerRef.current?.style.setProperty(
        "--text-color",
        effectsStyles.textColor,
      );
    }

    // Initial editor options
    this.editor.current.updateOptions({
      fontSize: parseInt(effectsStyles.fontSize, 10),
      fontFamily: effectsStyles.fontStyle,
      lineNumbers: this.isLineNums ? "on" : "off",
      letterSpacing: effectsStyles.letterSpacing,
    });

    const model = this.editor.current.getModel()!;
    const fullText = this.textMediaInstance.yText.toString();

    (async () => {
      this.initializing.current = true;
      if (this.externalRerender) this.externalRerender((prev) => !prev);
      this.editor.current?.updateOptions({
        readOnly: true,
      });

      // 1) Loop in fixed‐size steps
      for (
        let offset = 0;
        offset < fullText.length;
        offset += this.INITIALIZE_CHUNK_SIZE
      ) {
        if (!this.monaco.current) continue;

        if (this.forceFinishInitialization?.current) {
          const remainingText = fullText.substring(offset);
          const currentValueLength = model.getValueLength();
          const insertPos = model.getPositionAt(currentValueLength);
          model.applyEdits([
            {
              range: new this.monaco.current.Range(
                insertPos.lineNumber,
                insertPos.column,
                insertPos.lineNumber,
                insertPos.column,
              ),
              text: remainingText,
              forceMoveMarkers: true,
            },
          ]);
          this.forceFinishInitialization.current = false;
          break;
        }

        const textChunk = fullText.substring(
          offset,
          offset + this.INITIALIZE_CHUNK_SIZE,
        );

        // 2) Compute the *exact* insertion position at end of current model
        const currentValueLength = model.getValueLength();
        const insertPos = model.getPositionAt(currentValueLength);

        // 3) Apply just that one chunk
        model.applyEdits([
          {
            range: new this.monaco.current.Range(
              insertPos.lineNumber,
              insertPos.column,
              insertPos.lineNumber,
              insertPos.column,
            ),
            text: textChunk,
            forceMoveMarkers: true,
          },
        ]);

        // 4) Yield so we never block >~16ms
        await new Promise<void>((resolve) => {
          if ("requestIdleCallback" in window) {
            window.requestIdleCallback(() => resolve());
          } else {
            setTimeout(resolve, 0);
          }
        });
      }

      this.binding.current = new MonacoBinding(
        this.textMediaInstance.yText,
        model,
        new Set([this.editor.current!]),
      );

      this.initializing.current = false;
      if (this.externalRerender) this.externalRerender((prev) => !prev);
      this.editor.current?.updateOptions({
        readOnly: this.forceIsReadOnly || this.textMediaInstance.isReadOnly,
      });
    })();

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
          this.editor.current?.updateOptions({
            lineNumbers: "off",
          });
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
