import React, { useEffect, useRef, useState } from "react";
import Rulers from "./elements/rulers/Rulers";
import WorkArea from "./elements/workArea/WorkArea";
import MenuBar from "./elements/menuBar/MenuBar";
import ToolPanels from "./elements/toolPanels/ToolPanels";
import LeftTools from "./elements/leftTools/LeftTools";
import BottomTools from "./elements/bottomTools/BottomTools";
import DialogBox from "./elements/dialogBox/DialogBox";
import ContextMenu from "./elements/contentMenu/ContextMenu";
import ShapeButtons from "./elements/ShapeButtons";
import SplitBar from "./elements/splitBar/SplitBar";
import "./css/base.css";
import "./css/method-draw.css";
import "./css/jpicker.css";
import "./css/jgraduate.css";
import "./css/fonts.css";
import "./css/dropdown.css";
import "./css/draginput.css";
import "./css/menu.css";
import "./css/rulers.css";
import "./css/palette.css";
import "./css/color-tool.css";
import "./css/context-menu.css";
import "./css/shapelib.css";
import "./css/modal.css";
import "./css/source.css";
import "./css/keyboard.css";
import "./css/dialog.css";
import "./css/app.css";
import "./css/tools.css";
import "./css/button.css";
import "./css/select.css";
import "./css/panel.css";
import "./css/align_buttons.css";
import "./css/text.css";
import "./css/zoom-dropdown.css";
import "./css/loading.css";

const loadScript = (src: string) => {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }

    // Create and load script
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      reject(false);
    };
  });
};

declare global {
  interface Window {
    methodEditor: any;
  }
}

export default function MethodSvgEditor({
  editing = true,
  initialSVGString,
  finishCallback,
  cancelCallback,
}: {
  editing?: boolean;
  initialSVGString?: () => string | undefined;
  finishCallback?: (svg: string) => void;
  cancelCallback?: () => void;
}) {
  const [editorLoaded, setEditorLoaded] = useState(false);
  const methodDrawRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editing) return;

    const scripts = [
      "./src/methodSvgEditor/js/loading.js",
      "./src/methodSvgEditor/js/lib/jquery-3.5.1.min.js",
      "./src/methodSvgEditor/js/lib/pathseg.js",
      "./src/methodSvgEditor/js/lib/jquery.hotkeys.min.js",
      "./src/methodSvgEditor/js/lib/jquery.jgraduate.js",
      "./src/methodSvgEditor/js/lib/jquery.contextMenu.js",
      "./src/methodSvgEditor/js/lib/jquery-ui-1.8.17.custom.min.js",
      "./src/methodSvgEditor/js/jquery.attr.js",
      "./src/methodSvgEditor/js/lib/jquery-draginput.js",
      "./src/methodSvgEditor/js/lib/css.min.js",
      "./src/methodSvgEditor/js/utils.js",
      "./src/methodSvgEditor/js/dao.js",
      "./src/methodSvgEditor/js/state.js",
      "./src/methodSvgEditor/js/sanitize.js",
      "./src/methodSvgEditor/js/browser.js",
      "./src/methodSvgEditor/js/svgutils.js",
      "./src/methodSvgEditor/js/history.js",
      "./src/methodSvgEditor/js/select.js",
      "./src/methodSvgEditor/js/path.js",
      "./src/methodSvgEditor/js/sanitize.js",
      "./src/methodSvgEditor/js/units.js",
      "./src/methodSvgEditor/js/math.js",
      "./src/methodSvgEditor/js/translate.js",
      "./src/methodSvgEditor/js/svgtransformlist.js",
      "./src/methodSvgEditor/js/draw.js",
      "./src/methodSvgEditor/js/svgcanvas.js",
      "./src/methodSvgEditor/js/editor.js",
      "./src/methodSvgEditor/js/Canvas.js",
      "./src/methodSvgEditor/js/Text.js",
      "./src/methodSvgEditor/js/Pan.js",
      "./src/methodSvgEditor/js/Panel.js",
      "./src/methodSvgEditor/js/Rulers.js",
      "./src/methodSvgEditor/js/Toolbar.js",
      "./src/methodSvgEditor/js/Menu.js",
      "./src/methodSvgEditor/js/Keyboard.js",
      "./src/methodSvgEditor/js/Import.js",
      "./src/methodSvgEditor/js/PaintBox.js",
      "./src/methodSvgEditor/js/Palette.js",
      "./src/methodSvgEditor/js/Zoom.js",
      "./src/methodSvgEditor/js/Modal.js",
      "./src/methodSvgEditor/js/Title.js",
      "./src/methodSvgEditor/js/Darkmode.js",
      "./src/methodSvgEditor/js/ContextMenu.js",
      "./src/methodSvgEditor/js/Shapelib.js",
      "./src/methodSvgEditor/js/fonts.js",
      "./src/methodSvgEditor/js/dialog.js",
      "./src/methodSvgEditor/js/lib/contextmenu.js",
      "./src/methodSvgEditor/js/lib/jpicker.min.js",
      "./src/methodSvgEditor/js/lib/mousewheel.js",
      "./src/methodSvgEditor/js/eyedropper.js",
      "./src/methodSvgEditor/js/lib/requestanimationframe.js",
      "./src/methodSvgEditor/js/lib/taphold.js",
      "./src/methodSvgEditor/js/lib/filesaver.js",
      "./src/methodSvgEditor/js/paste.js",
      "./src/methodSvgEditor/js/modals.js",
      "./src/methodSvgEditor/js/start.js",
      "./src/methodSvgEditor/js/lib/tinycolor-min.js",
    ];

    const loadedScripts: HTMLScriptElement[] = [];

    const loadScripts = async () => {
      try {
        for (let script of scripts) {
          const scriptElement = document.createElement("script");
          scriptElement.src = script;
          scriptElement.async = true;
          document.body.appendChild(scriptElement);
          loadedScripts.push(scriptElement);

          await new Promise((resolve, reject) => {
            scriptElement.onload = resolve;
            scriptElement.onerror = reject;
          });
        }
        setEditorLoaded(true);
      } catch (error) {
        console.error("Failed to load scripts:", error);
      }
    };

    loadScripts();
  }, [editing]);

  useEffect(() => {
    if (editing && editorLoaded && initialSVGString) {
      const initialString = initialSVGString();

      if (initialString) {
        window.methodEditor?.import?.loadSvgString(initialString);
      }
    }
  }, [editing, editorLoaded, initialSVGString]);

  useEffect(() => {
    if (editorLoaded) {
      // Initialize the editor modals, passing cancelCallback
      window.methodEditor.modal.cancel = new MD.Modal({
        html: `
          <div class="cancelModal">
            <h1>Close without saving?</h1>
            <div id="cancellation">
              <button class="warning method-button">Close</button>
            </div>
          </div>
        `,
        js: function (el: HTMLElement) {
          const input = el.querySelector("#cancellation button.warning");
          input?.addEventListener("click", function () {
            if (cancelCallback) cancelCallback();
            window.methodEditor.modal.cancel.close();
          });
        },
      });
    }
  }, [editorLoaded]);

  return (
    <div
      id='methodDrawRoot'
      ref={methodDrawRootRef}
      className='w-full h-full bg-fg-tone-black-1 pointer-events-auto font-K2D'
    >
      <div id='method-draw' className='app'>
        <Rulers />

        <WorkArea />

        <SplitBar methodDrawRootRef={methodDrawRootRef} />

        <MenuBar />

        <ToolPanels finishCallback={finishCallback} />

        <div id='cur_context_panel'></div>

        <LeftTools />

        <BottomTools />

        <div id='color_picker'></div>
      </div>

      <DialogBox />

      <ContextMenu />

      <ShapeButtons />
    </div>
  );
}
