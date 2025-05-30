// globals
var svgCanvas = new $.SvgCanvas(document.getElementById("svgcanvas"));
var editor = new MD.Editor();
window.methodEditor = editor;
var state = new State();

editor.modal = {
  about: new MD.Modal({
    html: `
      <div class="aboutModal">
        <h1>About this application</h1>
        <p>Method Draw is a simple <a href="https://github.com/methodofaction/Method-Draw">open source</a> vector drawing application. Method Draw was forked from <a href="https://github.com/SVG-Edit/svgedit">SVG-Edit</a> several years ago with the goal of improving and modernizing the interface.</p>
        <p>At this time (2021), the author (<a href="http://method.ac/writing">Mark MacKay</a>) is working on improving stability and improving the codebase, which contains a lot of legacy practices. The goal is to create a vector editor suitable for simple graphic design tasks.</p>
        <p>
          Method Draw relies on your generous donations for continued development.
          <a href="https://method.ac/donate/">Donate now</a> if you find this application useful.
        </p>
      </div>
    `,
  }),
  source: new MD.Modal({
    html: `
      <div id="svg_source_editor">
        <div id="svg_source_editor_container">
          <div id="svg_source_overlay" class="overlay"></div>
          <div id="svg_source_container">
            <form>
              <textarea id="svg_source_textarea" spellcheck="false"></textarea>
            </form>
            <div id="tool_source_back" class="toolbar_button">
              <button id="tool_source_cancel" class="cancel method-button">Cancel</button>
              <button id="tool_source_save" class="ok method-button">Ok</button>
            </div>
          </div>
        </div>
    </div>`,
    js: function (el) {
      el.children[0].classList.add("modal-item-source");
      el.querySelector("#tool_source_save").addEventListener(
        "click",
        function () {
          var saveChanges = function () {
            $("#svg_source_textarea").blur();
            editor.zoom.multiply(1);
            editor.rulers.update();
            editor.paintBox.fill.prep();
            editor.paintBox.stroke.prep();
            editor.paintBox.shadow.prep();
            editor.paintBox.shadow.updateFromActual();
            editor.paintBox.neon.prep();
            editor.paintBox.neon.updateFromActual();
            editor.paintBox.overlay.prep();
            editor.paintBox.overlay.updateFromActual();
            editor.modal.source.close();
            svgCanvas.clearSelection();
          };

          if (!svgCanvas.setSvgString($("#svg_source_textarea").val())) {
            $.confirm(
              "There were parsing errors in your SVG source.\nRevert back to original SVG source?",
              function (ok) {
                if (!ok) return false;
                saveChanges();
              }
            );
          } else {
            saveChanges();
          }
        }
      );
      el.querySelector("#tool_source_cancel").addEventListener(
        "click",
        function () {
          editor.modal.source.close();
        }
      );
    },
  }),
  configure: new MD.Modal({
    html: `
      <div class="configureModal">
        <h1>Clear all data?</h1>
        <div id="configuration">
          <button class="warning method-button">Erase</button>
        </div>
      </div>
    `,
    js: function (el) {
      const input = el.querySelector("#configuration button.warning");
      input.addEventListener("click", function () {
        state.clean();
      });
    },
  }),
  shortcuts: new MD.Modal({
    html: `
      <div class="shortcutModal">
        <h1>Shortcuts</h1>
        <div id="shortcuts"></div>
      </div>
      `,
    js: function (el) {
      el.children[0].classList.add("modal-item-wide");
    },
  }),
};
