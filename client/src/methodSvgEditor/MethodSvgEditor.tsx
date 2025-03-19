import React, { useEffect, useRef } from "react";
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
import "./css/sponsors.css";
import "./css/zoom-dropdown.css";
import "./css/loading.css";
import Rulers from "./elements/rulers/Rulers";
import WorkArea from "./elements/workArea/WorkArea";
import MenuBar from "./elements/menuBar/MenuBar";
import ToolPanels from "./elements/toolPanels/ToolPanels";
import LeftTools from "./elements/leftTools/LeftTools";
import BottomTools from "./elements/bottomTools/BottomTools";
import DialogBox from "./elements/dialogBox/DialogBox";
import ContextMenu from "./elements/contentMenu/ContextMenu";
import ShapeButtons from "./elements/ShapeButtons";

const loadScript = (src: string) => {
  const script = document.createElement("script");
  script.src = src;
  script.async = true; // Make sure the script is loaded asynchronously
  document.body.appendChild(script);
  return new Promise((resolve, reject) => {
    script.onload = resolve;
    script.onerror = reject;
  });
};

export default function MethodSvgEditor() {
  useEffect(() => {
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
    ];

    const loadScripts = async () => {
      try {
        for (let script of scripts) {
          await loadScript(script);
        }
        console.log("All scripts loaded successfully.");
      } catch (error) {
        console.error("Error loading script:", error);
      }
    };

    loadScripts();

    return () => {
      // Cleanup: remove all scripts if needed
      const scriptTags = document.querySelectorAll('script[src^="./js"]');
      scriptTags.forEach((script) => script.remove());
    };
  }, []);

  const workAreaRef = useRef<HTMLDivElement>(null);
  const svgCanvasRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className='w-full h-full absolute top-0 left-0 bg-fg-tone-black-1 z-[500000000000] pointer-events-auto'
      style={{ marginTop: "0px" }}
    >
      <div id='method-draw' className='app'>
        <Rulers />

        <WorkArea workAreaRef={workAreaRef} svgCanvasRef={svgCanvasRef} />

        <MenuBar />

        <ToolPanels />
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
