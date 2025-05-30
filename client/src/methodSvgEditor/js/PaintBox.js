MD.PaintBox = function (container, type) {
  var _self = this;
  var colorPicker = function (elem) {
    var picker = elem[0].id === "stroke_color" ? "stroke" : "fill";
    var is_background = elem[0].id === "canvas_color";
    if (is_background) picker = "canvas";
    var is_shadow = elem[0].id === "shadow_color";
    if (is_shadow) picker = "shadow";
    var is_overlay = elem[0].id === "overlay_color";
    if (is_overlay) picker = "overlay";
    var is_neon = elem[0].id === "neon_color";
    if (is_neon) picker = "neon";
    var paint = editor.paintBox[picker].paint;

    var title = "Pick a color and opacity";

    var pos = { right: 0, top: 0 };

    switch (picker) {
      case "fill":
        title = "Pick a fill paint and opacity";
        var fillColor = $("#fill_color");
        var offset = fillColor.offset() || {
          left: 0,
          top: 0,
        };
        pos = {
          left: offset.left + fillColor.width() + 10,
          top: offset.top,
          transform: "translate(0%, -50%)",
        };
        break;
      case "stroke":
        title = "Pick a stroke paint and opacity";
        var strokeColor = $("#stroke_color");
        var offset = strokeColor.offset() || {
          left: 0,
          top: 0,
        };
        pos = {
          left: offset.left + strokeColor.width() + 10,
          top: offset.top,
          transform: "translate(0%, -50%)",
        };
        break;
      case "canvas":
        title = "Pick a canvas color and opacity";
        var toolCanvas = $("#tool_canvas");

        var offset = toolCanvas.offset() || {
          left: 0,
          top: 0,
        };
        pos = {
          left: offset.left - 10,
          top: offset.top,
          transform: "translate(-100%, -50%)",
        };
        break;
      case "shadow":
        title = "Pick a shadow color and opacity";
        var shadowColorSection = $("#shadow_color_section");
        var offset = shadowColorSection.offset() || {
          left: 0,
          top: 0,
        };
        pos = {
          left: offset.left - 10,
          top: offset.top,
          transform: "translate(-100%, -50%)",
        };
        break;
      case "neon":
        title = "Pick a neon color and opacity";
        var neonColorSection = $("#neon_color_section");
        var offset = neonColorSection.offset() || {
          left: 0,
          top: 0,
        };
        pos = {
          left: offset.left - 10,
          top: offset.top,
          transform: "translate(-100%, -50%)",
        };
        break;
      case "overlay":
        title = "Pick a overlay color and opacity";
        var overlayColorSection = $("#overlay_color_section");
        var offset = overlayColorSection.offset() || {
          left: 0,
          top: 0,
        };
        pos = {
          left: offset.left - 10,
          top: offset.top,
          transform: "translate(-100%, -50%)",
        };
        break;
      default:
        break;
    }

    $(document).on("mousedown", function (e) {
      if (!e.target.closest("#color_picker")) $("#color_picker").hide();
    });

    const unsupportedGradient = getUnsupportedGradient(picker);

    $("#color_picker")
      .removeAttr("style")
      .toggleClass("radialUserSpace", unsupportedGradient)
      .attr("data-radialUserSpace", Boolean(unsupportedGradient))
      .css(pos)
      .jGraduate(
        {
          paint: paint,
          window: { pickerTitle: title },
          images: { clientPath: "./src/methodSvgEditor/images/" },
          newstop: "inverse",
        },
        function (p) {
          paint = new $.jGraduate.Paint(p);

          if (unsupportedGradient) {
            // remove current gradient stops
            while (unsupportedGradient.firstChild)
              unsupportedGradient.removeChild(unsupportedGradient.lastChild);
            Array.from(paint.radialGradient.children).forEach((stop) => {
              unsupportedGradient.appendChild(stop);
            });
          } else {
            editor.paintBox[picker].setPaint(paint, true);
            svgCanvas.setPaint(picker, paint);
          }
          if (picker === "fill") state.set("canvasFill", paint);
          if (picker === "stroke") state.set("canvasStroke", paint);
          if (picker === "canvas") state.set("canvasBackground", paint);
          if (picker === "shadow") {
            editor.changeShadowColor(paint);
            state.set("canvasShadow", paint);
          }
          if (picker === "neon") {
            editor.changeNeonColor(paint);
            state.set("canvasNeon", paint);
          }
          if (picker === "overlay") {
            editor.changeOverlayColor(paint);
            state.set("canvasOverlay", paint);
          }
          $("#color_picker").hide();
        },
        function (p) {
          $("#color_picker").hide();
        }
      );
  };

  var cur = { color: "f2f2f2", opacity: 1 };
  if (type === "stroke") cur = { color: "090909", opacity: 1 };
  else if (type === "fill") cur = { color: "f2f2f2", opacity: 1 };
  else if (type === "canvas") cur = { color: "f2f2f2", opacity: 0 };
  else if (type === "shadow") cur = { color: "090909", opacity: 1 };
  else if (type === "overlay") cur = { color: "d40213", opacity: 0.65 };
  else if (type === "neon") cur = { color: "d40213", opacity: 1 };

  // set up gradients to be used for the buttons
  var svgdocbox = new DOMParser().parseFromString(
    '<svg xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%"\
    fill="#' +
      cur.color +
      '" opacity="' +
      cur.opacity +
      '"/>\
    <defs><linearGradient id="gradbox_"/></defs></svg>',
    "text/xml"
  );
  var docElem = svgdocbox.documentElement;
  docElem = $(container)[0].appendChild(document.importNode(docElem, true));
  if (type === "canvas") docElem.setAttribute("width", 60.5);
  else docElem.setAttribute("width", "100%");

  this.rect = docElem.firstChild;
  this.defs = docElem.getElementsByTagName("defs")[0];
  this.grad = this.defs.firstChild;
  this.paint = new $.jGraduate.Paint({ solidColor: cur.color });
  this.type = type;

  function getUnsupportedGradient(type) {
    const selectedElems = svgCanvas.getSelectedElems().filter(Boolean);
    if (!selectedElems.length) return false;
    const elem = selectedElems[0];
    // fill or stroke
    var url = elem.getAttribute(type);
    if (url && url.includes("(")) {
      url = url.split("(")[1].split(")")[0];
    }
    // not a gradient
    else return false;
    const originalGradient = svgCanvas.svgroot.querySelector(url);
    if (!originalGradient) return false;
    const isRadial = originalGradient.tagName === "radialGradient";
    // not a radial gradient
    if (!isRadial) return false;
    const isUserSpaceOnUse =
      originalGradient.getAttribute("gradientUnits") === "userSpaceOnUse";
    if (!isUserSpaceOnUse) return false;
    return originalGradient;
  }

  this.setPaint = function (paint, apply, noUndo) {
    this.paint = paint;

    var fillAttr = "none";
    var ptype = paint.type;
    var opac = paint.alpha / 100;
    switch (ptype) {
      case "solidColor":
        fillAttr =
          paint[ptype] === "none" || paint[ptype] === "one"
            ? "none"
            : "#" + paint[ptype];
        break;
      case "linearGradient":
      case "radialGradient":
        if (typeof paint[ptype] === "string") {
          var parser = new DOMParser();
          var doc = parser.parseFromString(paint[ptype], "image/svg+xml");
          paint[ptype] = doc.documentElement;
        }
        this.defs.removeChild(this.grad);
        this.grad = this.defs.appendChild(paint[ptype]);
        var id = (this.grad.id = "gradbox_" + this.type);
        fillAttr = "url(#" + id + ")";

        if (this.grad.getAttribute("gradientUnits") === "userSpaceOnUse") {
          const gradient = this.grad;
          [
            "userSpaceOnUse",
            "gradientTransform",
            "gradientUnits",
            "cx",
            "cy",
            "fx",
            "fy",
            "r",
          ].forEach((attr) => {
            gradient.removeAttribute(attr);
          });
        }
    }
    this.rect.setAttribute("fill", fillAttr);
    this.rect.setAttribute("opacity", opac);

    if (this.type === "canvas") {
      if (fillAttr.indexOf("url") === -1) svgCanvas.setBackground(fillAttr);
    }

    if (apply) {
      svgCanvas.setColor(this.type, fillAttr, true);
      svgCanvas.setPaintOpacity(this.type, opac, true);
    }
  };

  this.getPaint = function (color, opac, type) {
    // update the editor's fill paint
    var opts = null;
    if (color.indexOf("url(#") === 0) {
      var refElem = svgCanvas.getRefElem(color);
      if (refElem) {
        refElem = refElem.cloneNode(true);
      } else {
        refElem = $("#" + type + "_color defs *")[0];
      }

      opts = { alpha: opac };
      opts[refElem.tagName] = refElem;
    } else if (color.indexOf("#") === 0) {
      opts = {
        alpha: opac,
        solidColor: color.substr(1),
      };
    } else {
      opts = {
        alpha: opac,
        solidColor: "none",
      };
    }
    return new $.jGraduate.Paint(opts);
  };

  this.update = function (apply) {
    const selectedElement = editor.selected[0];
    if (!selectedElement) return;
    var type = this.type;
    switch (selectedElement.tagName) {
      case "use":
      case "image":
      case "foreignObject":
        // These elements don't have fill or stroke, so don't change
        // the current value
        return;
      case "g":
      case "a":
        var gPaint = null;

        var childs = selectedElement.getElementsByTagName("*");
        for (var i = 0, len = childs.length; i < len; i++) {
          var elem = childs[i];
          var p = elem.getAttribute(type);
          if (i === 0) {
            gPaint = p;
          } else if (gPaint !== p) {
            gPaint = null;
            break;
          }
        }
        if (gPaint === null) {
          // No common color, don't update anything
          var paintColor = null;
          return;
        }
        var paintColor = gPaint;

        var paintOpacity = 1;
        break;
      default:
        var paintOpacity = parseFloat(
          selectedElement.getAttribute(type + "-opacity")
        );
        if (isNaN(paintOpacity)) {
          paintOpacity = 1.0;
        }

        var defColor = "none";
        switch (type) {
          case "fill":
            defColor = "#090909";
            break;
          case "stroke":
            defColor = "#090909";
            break;
          case "shadow":
            defColor = "#090909";
            break;
          case "neon":
            defColor = "#d40213";
            break;
          case "overlay":
            defColor = "#d40213";
            break;
          default:
            break;
        }

        var paintColor = selectedElement.getAttribute(type) || defColor;
    }
    if (apply) {
      svgCanvas.setColor(type, paintColor, true);
      svgCanvas.setPaintOpacity(type, paintOpacity, true);
    }

    paintOpacity *= 100;

    var paint = this.getPaint(paintColor, paintOpacity, type);
    // update the rect inside #fill_color/#stroke_color

    this.setPaint(paint);
  };

  this.update = function (apply) {
    const selectedElement = editor.selected[0];
    if (!selectedElement) return;
    var type = this.type;
    switch (selectedElement.tagName) {
      case "use":
      case "image":
      case "foreignObject":
        // These elements don't have fill or stroke, so don't change
        // the current value
        return;
      case "g":
      case "a":
        var gPaint = null;

        var childs = selectedElement.getElementsByTagName("*");
        for (var i = 0, len = childs.length; i < len; i++) {
          var elem = childs[i];
          var p = elem.getAttribute(type);
          if (i === 0) {
            gPaint = p;
          } else if (gPaint !== p) {
            gPaint = null;
            break;
          }
        }
        if (gPaint === null) {
          // No common color, don't update anything
          var paintColor = null;
          return;
        }
        var paintColor = gPaint;

        var paintOpacity = 1;
        break;
      default:
        var paintOpacity = parseFloat(
          selectedElement.getAttribute(type + "-opacity")
        );
        if (isNaN(paintOpacity)) {
          paintOpacity = 1.0;
        }

        var defColor = "none";
        switch (type) {
          case "fill":
            defColor = "#090909";
            break;
          case "stroke":
            defColor = "#090909";
            break;
          case "shadow":
            defColor = "#090909";
            break;
          case "neon":
            defColor = "#d40213";
            break;
          case "overlay":
            defColor = "#d40213";
            break;
          default:
            break;
        }

        var paintColor = selectedElement.getAttribute(type) || defColor;
    }
    if (apply) {
      svgCanvas.setColor(type, paintColor, true);
      svgCanvas.setPaintOpacity(type, paintOpacity, true);
    }

    paintOpacity *= 100;

    var paint = this.getPaint(paintColor, paintOpacity, type);
    // update the rect inside #fill_color/#stroke_color

    this.setPaint(paint);
  };

  function parseColor(color) {
    const parsedColor = tinycolor(color);

    if (!parsedColor.isValid()) {
      return null;
    }

    const hex = parsedColor.toHex();

    const alpha = Math.round(parsedColor.getAlpha() * 100);

    return { color: hex, alpha };
  }

  this.updateFromActual = function () {
    const selectedElement = editor.selected[0];

    if (!selectedElement) return;

    var extension;
    if (this.type === "shadow") {
      extension = "_shadow";
    } else if (this.type === "neon") {
      extension = "_neon";
    } else if (this.type === "overlay") {
      extension = "_overlay";
    }

    if (!extension) return;

    var color = svgCanvas.getEffectAttr(
      selectedElement,
      extension,
      "feFlood",
      "flood-color",
      undefined
    );

    if (color) {
      var colorObj = parseColor(color);

      this.setPaint({
        alpha: colorObj.alpha,
        type: "solidColor",
        solidColor: colorObj.color,
      });
    }
  };

  this.prep = function () {
    var ptype = this.paint.type;

    switch (ptype) {
      case "linearGradient":
      case "radialGradient":
        var paint = new $.jGraduate.Paint({ copy: this.paint });
        svgCanvas.setPaint(type, paint);
    }
  };

  this.colorPicker = colorPicker;
};

// todo organize
(function () {
  $("#tool_fill").click(function () {
    if ($("#tool_fill").hasClass("active")) {
      editor.paintBox.fill.colorPicker($("#fill_color"));
    } else {
      $("#tool_fill").addClass("active");
      $("#tool_stroke").removeClass("active");
    }
  });

  $("#tool_stroke").on("click", function () {
    if ($("#tool_stroke").hasClass("active")) {
      editor.paintBox.stroke.colorPicker($("#stroke_color"));
    } else {
      $("#tool_stroke").addClass("active");
      $("#tool_fill").removeClass("active");
    }
  });

  $("#tool_canvas").on("click touchstart", function () {
    editor.paintBox.canvas.colorPicker($("#canvas_color"));
  });

  $("#tool_shadow_color").on("click touchstart", function () {
    editor.paintBox.shadow.colorPicker($("#shadow_color"));
  });

  $("#tool_neon_color").on("click touchstart", function () {
    editor.paintBox.neon.colorPicker($("#neon_color"));
  });

  $("#tool_overlay_color").on("click touchstart", function () {
    editor.paintBox.overlay.colorPicker($("#overlay_color"));
  });

  $("#tool_switch").on("click touchstart", function () {
    editor.switchPaint();
  });
})();
