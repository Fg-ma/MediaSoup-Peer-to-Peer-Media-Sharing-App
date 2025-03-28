MD.PaintBox = function (container, type, setPaintCallback) {
  var _self = this;
  var colorPicker = function (elem) {
    var picker = elem[0].id === "stroke_color" ? "stroke" : "fill";
    var is_background = elem[0].id === "canvas_color";
    if (is_background) picker = "canvas";
    var is_shadow = elem[0].id === "shadow_color";
    if (is_shadow) picker = "shadow";
    var paint = editor.paintBox[picker].paint;

    var title =
      picker === "stroke"
        ? "Pick a stroke paint and opacity"
        : picker === "shadow"
        ? "Pick a shadow color and opacity"
        : "Pick a fill paint and opacity";
    var was_none = false;
    var shadowColorSection = $("#shadow_color_section");
    var shadowColorSectionPos = shadowColorSection.offset() || {
      left: 0,
      top: 0,
    };
    var pos = is_background
      ? { right: 175, top: 50 }
      : is_shadow
      ? {
          left: shadowColorSectionPos.left,
          top: shadowColorSectionPos.top,
          transform: "translate(-100%, -50%)",
        }
      : { left: 48, bottom: 36 };

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
          if (picker === "shadow") state.set("canvasShadow", paint);
          $("#color_picker").hide();
        },
        function (p) {
          $("#color_picker").hide();
        }
      );
  };

  var cur = { color: "f2f2f2", opacity: 1 };
  if (type === "stroke") cur = { color: "090909", opacity: 1 };
  if (type === "fill") cur = { color: "f2f2f2", opacity: 1 };
  if (type === "canvas") cur = { color: "f2f2f2", opacity: 0 };
  if (type === "shadow") cur = { color: "d40213", opacity: 1 };

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
    console.log(paint);
    if (setPaintCallback) setPaintCallback(paint);
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

        var defColor =
          type === "fill" || type === "stroke"
            ? "#090909"
            : type === "shadow"
            ? "d40213"
            : "none";
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

  $("#tool_switch").on("click touchstart", function () {
    editor.switchPaint();
  });
})();
