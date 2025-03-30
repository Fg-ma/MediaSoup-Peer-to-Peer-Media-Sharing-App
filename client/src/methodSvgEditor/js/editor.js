const MD = {};

MD.Editor = function () {
  const el = document.getElementById("method-draw");
  const serializer = new XMLSerializer();
  const _self = this;
  const workarea = document.getElementById("workarea");
  _self.selected = [];

  function clear() {
    var dims = state.get("canvasSize");
    $.confirm(
      "<h4>Do you want to clear the drawing?</h4><p>This will also erase your undo history</p>",
      function (ok) {
        if (!ok) return;
        state.set("canvasMode", "select");
        svgCanvas.clear();
        svgCanvas.setResolution(dims[0], dims[1]);
        editor.canvas.update(true);
        editor.zoom.reset();
        editor.panel.updateContextPanel();
        editor.paintBox.fill.prep();
        editor.paintBox.stroke.prep();
        svgCanvas.runExtensions("onNewDocument");
      }
    );
  }

  function save() {
    _self.menu.flash($("#file_menu"));
    svgCanvas.save();
  }

  function undo() {
    if (!svgCanvas.undoMgr.getUndoStackSize()) return false;
    _self.menu.flash($("#edit_menu"));
    svgCanvas.undoMgr.undo();
  }

  function redo() {
    if (svgCanvas.undoMgr.getRedoStackSize() > 0) {
      _self.menu.flash($("#edit_menu"));
      svgCanvas.undoMgr.redo();
    }
  }

  function duplicateSelected() {
    if (!_self.selected.length) return false;
    _self.menu.flash($("#edit_menu"));
    svgCanvas.cloneSelectedElements(20, 20);
  }

  function deleteSelected() {
    if (
      svgCanvas.getMode() === "pathedit" &&
      svgCanvas.pathActions.getNodePoint()
    )
      svgCanvas.pathActions.deletePathNode();
    else svgCanvas.deleteSelectedElements();
  }

  function cutSelected() {
    if (!_self.selected.length) return false;
    _self.menu.flash($("#edit_menu"));
    svgCanvas.cutSelectedElements();
  }

  function copySelected() {
    if (!_self.selected.length) return false;
    _self.menu.flash($("#edit_menu"));
    svgCanvas.copySelectedElements();
  }

  function pasteSelected() {
    _self.menu.flash($("#edit_menu"));
    var zoom = svgCanvas.getZoom();
    var x =
      (workarea.scrollLeft + workarea.offsetWidth / 2) / zoom -
      svgCanvas.contentW;
    var y =
      (workarea.scrollTop + workarea.offsetHeight / 2) / zoom -
      svgCanvas.contentH;
    svgCanvas.pasteElements("point", x, y);
  }

  function moveToTopSelected() {
    if (!_self.selected.length) return false;
    _self.menu.flash($("#object_menu"));
    svgCanvas.moveToTopSelectedElement();
  }

  function moveToBottomSelected() {
    if (!_self.selected.length) return false;
    _self.menu.flash($("#object_menu"));
    svgCanvas.moveToBottomSelectedElement();
  }

  function moveUpSelected() {
    if (!_self.selected.length) return false;
    _self.menu.flash($("#object_menu"));
    svgCanvas.moveUpDownSelected("Up");
  }

  function moveDownSelected() {
    if (!_self.selected.length) return false;
    _self.menu.flash($("#object_menu"));
    svgCanvas.moveUpDownSelected("Down");
  }

  function convertToPath() {
    if (!_self.selected.length) return false;
    svgCanvas.convertToPath();
    var elems = svgCanvas.getSelectedElems();
    svgCanvas.selectorManager.requestSelector(elems[0]).reset(elems[0]);
    //svgCanvas.selectorManager.requestSelector(elems[0]).selectorRect.setAttribute("display", "none");
    svgCanvas.setMode("pathedit");
    svgCanvas.pathActions.toEditMode(elems[0]);
    svgCanvas.clearSelection();
    editor.panel.updateContextPanel();
  }

  function reorientPath() {
    if (!_self.selected.length) return false;
    svgCanvas.pathActions.reorient();
  }

  function focusPaint() {
    $("#tool_stroke").toggleClass("active");
    $("#tool_fill").toggleClass("active");
  }

  function switchPaint(strokeOrFill) {
    focusPaint();
    var stroke_rect = document.querySelector("#tool_stroke rect");
    var fill_rect = document.querySelector("#tool_fill rect");
    var fill_color = fill_rect.getAttribute("fill");
    var stroke_color = stroke_rect.getAttribute("fill");
    var stroke_opacity = parseFloat(stroke_rect.getAttribute("opacity"));
    if (isNaN(stroke_opacity)) {
      stroke_opacity = 1;
    }
    var fill_opacity = parseFloat(fill_rect.getAttribute("opacity"));
    if (isNaN(fill_opacity)) {
      fill_opacity = 1;
    }
    stroke_opacity *= 100;
    fill_opacity *= 100;
    var stroke = editor.paintBox.stroke.getPaint(
      stroke_color,
      stroke_opacity,
      "stroke"
    );
    var fill = editor.paintBox.fill.getPaint(fill_color, fill_opacity, "fill");
    editor.paintBox.fill.setPaint(stroke, true);
    editor.paintBox.stroke.setPaint(fill, true);
  }

  function escapeMode() {
    for (key in editor.modal) editor.modal[key].close();
    state.set("canvasMode", "select");
    if ($("#cur_context_panel").is(":visible")) {
      svgCanvas.leaveContext();
    } else saveCanvas();
  }

  // called when we've selected a different element
  function selectedChanged(window, elems) {
    const mode = svgCanvas.getMode();
    _self.selected = elems.filter(Boolean);
    editor.paintBox.fill.update();
    editor.paintBox.stroke.update();
    editor.paintBox.shadow.update();
    editor.paintBox.shadow.updateFromActual();
    editor.paintBox.neon.update();
    editor.paintBox.neon.updateFromActual();
    editor.paintBox.overlay.update();
    editor.paintBox.overlay.updateFromActual();
    editor.panel.updateContextPanel(_self.selected);
  }

  function contextChanged(win, context) {
    var link_str = "";
    if (context) {
      var str = "";
      link_str =
        '<a href="#" data-root="y">' +
        svgCanvas.getCurrentDrawing().getCurrentLayerName() +
        "</a>";

      $(context)
        .parentsUntil("#svgcontent > g")
        .addBack()
        .each(function () {
          if (this.id) {
            str += " > " + this.id;
            if (this !== context) {
              link_str += ' > <a href="#">' + this.id + "</a>";
            } else {
              link_str += " > " + this.id;
            }
          }
        });

      cur_context = str;
    } else {
      cur_context = null;
    }
    $("#cur_context_panel").toggle(!!context).html(link_str);
  }

  function elementChanged(window, elems) {
    const mode = svgCanvas.getMode();

    // if the element changed was the svg, then it could be a resolution change
    if (elems[0] && elems[0].tagName === "svg")
      return editor.canvas.update(true);

    editor.panel.updateContextPanel(elems);

    svgCanvas.runExtensions("elementChanged", {
      elems: elems,
    });

    if (!svgCanvas.getContext()) {
      saveCanvas();
    }
  }

  function changeAttribute(attr, value, completed) {
    if (attr === "opacity") value *= 0.01;
    if (completed) {
      svgCanvas.changeSelectedAttribute(attr, value);
    } else {
      svgCanvas.changeSelectedAttributeNoUndo(attr, value);
    }
  }

  function elementTransition(window, elems) {
    var mode = svgCanvas.getMode();
    var elem = elems[0];

    if (!elem) return;

    const multiselected = elems.length >= 2 && elems[1] != null ? elems : null;
    // Only updating fields for single elements for now
    if (!multiselected && mode === "rotate") {
      var rotate_string = "rotate(" + svgCanvas.getRotationAngle(elem) + "deg)";
      $("#tool_angle_indicator").css("transform", rotate_string);
    }
    svgCanvas.runExtensions("elementTransition", {
      elems: elems,
    });
  }

  function moveSelected(dx, dy) {
    if (!_self.selected.length) return false;
    if (state.get("canvasSnap")) {
      // Use grid snap value regardless of zoom level
      var multi = svgCanvas.getZoom() * state.get("canvasSnapStep");
      dx *= multi;
      dy *= multi;
    }
    //$('input').blur()
    svgCanvas.moveSelectedElements(dx, dy);
  }

  function extensionAdded(wind, func) {
    if (func.callback) func.callback();
  }

  function alphaToHex(alpha) {
    if (alpha < 0 || alpha > 100) return "ff";

    // Convert percentage to 0-255 range
    let hex = Math.round((alpha / 100) * 255)
      .toString(16)
      .toUpperCase();

    // Ensure two-digit hex format
    return hex.padStart(2, "0");
  }

  const getBlurFilterItems = (val) => [
    svgCanvas.addSvgElementFromJson({
      element: "feGaussianBlur",
      attr: {
        in: "SourceGraphic",
        stdDeviation: val,
      },
    }),
  ];

  function changeBlur() {
    const val = parseFloat($("#blur").val());

    svgCanvas.setEffect(
      [{ val: val, tagName: "feGaussianBlur", attr: "stdDeviation" }],
      true,
      "_blur",
      0,
      getBlurFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getBlurFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getGrayscaleFilterItems = (val) => [
    svgCanvas.addSvgElementFromJson({
      element: "feColorMatrix",
      attr: {
        type: "saturate",
        values: val,
      },
    }),
  ];

  function changeGrayscale() {
    const val = Math.max(0.0001, parseFloat($("#grayscale").val()));

    svgCanvas.setEffect(
      [{ val: val, attr: "values", tagName: "feColorMatrix" }],
      true,
      "_grayscale",
      1,
      getGrayscaleFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getGrayscaleFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getSaturationFilterItems = (val) => [
    svgCanvas.addSvgElementFromJson({
      element: "feColorMatrix",
      attr: {
        type: "saturate",
        values: val,
      },
    }),
  ];

  function changeSaturation() {
    const val = Math.max(0.0001, parseFloat($("#saturation").val()));

    svgCanvas.setEffect(
      [{ val: val, tagName: "feColorMatrix", attr: "values" }],
      true,
      "_saturation",
      1,
      getSaturationFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getSaturationFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getWaveDistortionStrengthFilterItems = (val) => [
    svgCanvas.addSvgElementFromJson({
      element: "feTurbulence",
      attr: {
        type: "fractalNoise",
        baseFrequency: "0",
        result: "turbulence",
      },
    }),
    svgCanvas.addSvgElementFromJson({
      element: "feDisplacementMap",
      attr: {
        in: "SourceGraphic",
        in2: "turbulence",
        scale: val,
      },
    }),
  ];

  function changeWaveDistortionStrength() {
    const val = parseFloat($("#wave_distortion_strength").val());

    svgCanvas.setEffect(
      val,
      true,
      "_wave_distortion",
      "feDisplacementMap",
      "scale",
      getWaveDistortionStrengthFilterItems,
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              getWaveDistortionStrengthFilterItems,
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  const getWaveDistortionFrequencyFilterItems = (val) => [
    svgCanvas.addSvgElementFromJson({
      element: "feTurbulence",
      attr: {
        type: "fractalNoise",
        baseFrequency: val,
        result: "turbulence",
      },
    }),
    svgCanvas.addSvgElementFromJson({
      element: "feDisplacementMap",
      attr: {
        in: "SourceGraphic",
        in2: "turbulence",
        scale: "0",
      },
    }),
  ];

  function changeWaveDistortionFrequency() {
    const val = parseFloat($("#wave_distortion_frequency").val());

    svgCanvas.setEffect(
      val,
      true,
      "_wave_distortion",
      "feTurbulence",
      "baseFrequency",
      getWaveDistortionFrequencyFilterItems,
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              getWaveDistortionFrequencyFilterItems,
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  const getCrackedGlassFrequencyFilterItems = (val) => [
    svgCanvas.addSvgElementFromJson({
      element: "feTurbulence",
      attr: {
        type: "fractalNoise",
        baseFrequency: val,
        numOctaves: "0",
        result: "turbulence",
      },
    }),
    svgCanvas.addSvgElementFromJson({
      element: "feDisplacementMap",
      attr: {
        in: "SourceGraphic",
        in2: "turbulence",
        scale: "0",
      },
    }),
  ];

  function changeCrackedGlassFrequency() {
    const val = parseFloat($("#cracked_glass_frequency").val());

    svgCanvas.setEffect(
      val,
      true,
      "_cracked_glass",
      "feTurbulence",
      "baseFrequency",
      getCrackedGlassFrequencyFilterItems,
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              getCrackedGlassFrequencyFilterItems,
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  const getCrackedGlassDetailFilterItems = (val) => [
    svgCanvas.addSvgElementFromJson({
      element: "feTurbulence",
      attr: {
        type: "fractalNoise",
        baseFrequency: "0",
        numOctaves: val,
        result: "turbulence",
      },
    }),
    svgCanvas.addSvgElementFromJson({
      element: "feDisplacementMap",
      attr: {
        in: "SourceGraphic",
        in2: "turbulence",
        scale: "0",
      },
    }),
  ];

  function changeCrackedGlassDetail() {
    var val = parseFloat($("#cracked_glass_detail").val());

    svgCanvas.setEffect(
      val,
      true,
      "_cracked_glass",
      "feTurbulence",
      "numOctaves",
      getCrackedGlassDetailFilterItems,
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              getCrackedGlassDetailFilterItems,
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  const getCrackedGlassStrengthFilterItems = (val) => [
    svgCanvas.addSvgElementFromJson({
      element: "feTurbulence",
      attr: {
        type: "fractalNoise",
        baseFrequency: "0",
        numOctaves: "0",
        result: "turbulence",
      },
    }),
    svgCanvas.addSvgElementFromJson({
      element: "feDisplacementMap",
      attr: {
        in: "SourceGraphic",
        in2: "turbulence",
        scale: val,
      },
    }),
  ];

  function changeCrackedGlassStrength() {
    const val = parseFloat($("#cracked_glass_strength").val());

    svgCanvas.setEffect(
      val,
      true,
      "_cracked_glass",
      "feDisplacementMap",
      "scale",
      getCrackedGlassStrengthFilterItems,
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              getCrackedGlassStrengthFilterItems,
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  const getShadowXFilterItems = (val) => {
    const feMerge = svgCanvas.addSvgElementFromJson({
      element: "feMerge",
      attr: {},
    });

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "coloredBlur",
        },
      })
    );

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "SourceGraphic",
        },
      })
    );

    return [
      svgCanvas.addSvgElementFromJson({
        element: "feGaussianBlur",
        attr: {
          in: "SourceAlpha",
          stdDeviation: "0",
          result: "blur",
        },
      }),
      svgCanvas.addSvgElementFromJson({
        element: "feOffset",
        attr: {
          in: "blur",
          dx: val,
          dy: "5",
          result: "offsetBlur",
        },
      }),
      svgCanvas.addSvgElementFromJson({
        element: "feFlood",
        attr: {
          "flood-color": "#090909",
          result: "colorBlur",
        },
      }),
      svgCanvas.addSvgElementFromJson({
        element: "feComposite",
        attr: {
          in: "colorBlur",
          in2: "offsetBlur",
          operator: "in",
          result: "coloredBlur",
        },
      }),
      feMerge,
    ];
  };

  function changeShadowX() {
    const val = parseFloat($("#shadow_x").val());

    svgCanvas.setEffect(
      val,
      true,
      "_shadow",
      "feOffset",
      "dx",
      getShadowXFilterItems,
      undefined,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              getShadowXFilterItems,
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  const getShadowYFilterItems = (val) => {
    const feMerge = svgCanvas.addSvgElementFromJson({
      element: "feMerge",
      attr: {},
    });

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "coloredBlur",
        },
      })
    );

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "SourceGraphic",
        },
      })
    );

    return [
      svgCanvas.addSvgElementFromJson({
        element: "feGaussianBlur",
        attr: {
          in: "SourceAlpha",
          stdDeviation: "0",
          result: "blur",
        },
      }),
      svgCanvas.addSvgElementFromJson({
        element: "feOffset",
        attr: {
          in: "blur",
          dx: "0",
          dy: val,
          result: "offsetBlur",
        },
      }),
      svgCanvas.addSvgElementFromJson({
        element: "feFlood",
        attr: {
          "flood-color": "#090909",
          result: "colorBlur",
        },
      }),
      svgCanvas.addSvgElementFromJson({
        element: "feComposite",
        attr: {
          in: "colorBlur",
          in2: "offsetBlur",
          operator: "in",
          result: "coloredBlur",
        },
      }),
      feMerge,
    ];
  };

  function changeShadowY() {
    const val = parseFloat($("#shadow_y").val());

    svgCanvas.setEffect(
      val,
      true,
      "_shadow",
      "feOffset",
      "dy",
      getShadowYFilterItems,
      undefined,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              getShadowYFilterItems,
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  const getShadowStrengthFilterItems = (val) => {
    const feMerge = svgCanvas.addSvgElementFromJson({
      element: "feMerge",
      attr: {},
    });

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "coloredBlur",
        },
      })
    );

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "SourceGraphic",
        },
      })
    );

    return [
      svgCanvas.addSvgElementFromJson({
        element: "feGaussianBlur",
        attr: {
          in: "SourceAlpha",
          stdDeviation: val,
          result: "blur",
        },
      }),
      svgCanvas.addSvgElementFromJson({
        element: "feOffset",
        attr: {
          in: "blur",
          dx: "0",
          dy: "5",
          result: "offsetBlur",
        },
      }),
      svgCanvas.addSvgElementFromJson({
        element: "feFlood",
        attr: {
          "flood-color": "#090909",
          result: "colorBlur",
        },
      }),
      svgCanvas.addSvgElementFromJson({
        element: "feComposite",
        attr: {
          in: "colorBlur",
          in2: "offsetBlur",
          operator: "in",
          result: "coloredBlur",
        },
      }),
      feMerge,
    ];
  };

  function changeShadowStrength() {
    const val = parseFloat($("#shadow_strength").val());

    svgCanvas.setEffect(
      val,
      true,
      "_shadow",
      "feGaussianBlur",
      "stdDeviation",
      getShadowStrengthFilterItems,
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              getShadowStrengthFilterItems,
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  const getShadowColorFilterItems = (val) => {
    const feMerge = svgCanvas.addSvgElementFromJson({
      element: "feMerge",
      attr: {},
    });

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "coloredBlur",
        },
      })
    );

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "SourceGraphic",
        },
      })
    );

    return [
      svgCanvas.addSvgElementFromJson({
        element: "feGaussianBlur",
        attr: {
          in: "SourceAlpha",
          stdDeviation: "0",
          result: "blur",
        },
      }),
      svgCanvas.addSvgElementFromJson({
        element: "feOffset",
        attr: {
          in: "blur",
          dx: "0",
          dy: "5",
          result: "offsetBlur",
        },
      }),
      svgCanvas.addSvgElementFromJson({
        element: "feFlood",
        attr: {
          "flood-color": val,
          result: "colorBlur",
        },
      }),
      svgCanvas.addSvgElementFromJson({
        element: "feComposite",
        attr: {
          in: "colorBlur",
          in2: "offsetBlur",
          operator: "in",
          result: "coloredBlur",
        },
      }),
      feMerge,
    ];
  };

  function changeShadowColor(paint) {
    if (paint.type !== "solidColor" || paint.solidColor === "none") return;

    if (paint.alpha) {
      val = "#" + paint.solidColor + alphaToHex(paint.alpha);

      svgCanvas.setEffect(
        val,
        true,
        "_shadow",
        "feFlood",
        "flood-color",
        getShadowColorFilterItems,
        undefined,
        svgCanvas.setOffsets,
        (val, extension, tagName, attr, deleteValue) =>
          svgCanvas.setEffectNoUndo(
            val,
            extension,
            tagName,
            attr,
            deleteValue,
            (val) =>
              svgCanvas.setEffect(
                val,
                false,
                extension,
                tagName,
                attr,
                getShadowColorFilterItems,
                deleteValue,
                svgCanvas.setOffsets
              )
          )
      );
    } else {
      svgCanvas.removeEffect("_shadow");
      editor.paintBox.shadow.setPaint(
        { alpha: 100, solidColor: "090909", type: "solidColor" },
        true
      );
    }
  }

  const getOverlayColorFilterItems = (val) => [
    svgCanvas.addSvgElementFromJson({
      element: "feFlood",
      attr: {
        "flood-color": val,
        result: "flood",
      },
    }),
    svgCanvas.addSvgElementFromJson({
      element: "feComposite",
      attr: {
        in2: "SourceAlpha",
        operator: "in",
        result: "overlay",
      },
    }),
    svgCanvas.addSvgElementFromJson({
      element: "feComposite",
      attr: {
        in: "overlay",
        in2: "SourceGraphic",
        operator: "over",
      },
    }),
  ];

  function changeOverlayColor(paint) {
    if (paint.type !== "solidColor" || paint.solidColor === "none") return;

    if (paint.alpha) {
      val = "#" + paint.solidColor + alphaToHex(paint.alpha);

      svgCanvas.setEffect(
        val,
        true,
        "_overlay",
        "feFlood",
        "flood-color",
        getOverlayColorFilterItems,
        undefined,
        svgCanvas.setOffsets,
        (val, extension, tagName, attr, deleteValue) =>
          svgCanvas.setEffectNoUndo(
            val,
            extension,
            tagName,
            attr,
            deleteValue,
            (val) =>
              svgCanvas.setEffect(
                val,
                false,
                extension,
                tagName,
                attr,
                getOverlayColorFilterItems,
                deleteValue,
                svgCanvas.setOffsets
              )
          )
      );
    } else {
      svgCanvas.removeEffect("_overlay");
      editor.paintBox.shadow.setPaint(
        { alpha: 100, solidColor: "d40213", type: "solidColor" },
        true
      );
    }
  }

  const getNeonColorFilterItems = (val) => [
    svgCanvas.addSvgElementFromJson({
      element: "feGaussianBlur",
      attr: {
        in: "SourceAlpha",
        stdDeviation: "5",
        result: "blurred",
      },
    }),
    svgCanvas.addSvgElementFromJson({
      element: "feFlood",
      attr: {
        "flood-color": val,
        result: "glowColor",
      },
    }),
    svgCanvas.addSvgElementFromJson({
      element: "feComposite",
      attr: {
        in: "glowColor",
        in2: "blurred",
        operator: "in",
        result: "glow",
      },
    }),
    svgCanvas.addSvgElementFromJson({
      element: "feComposite",
      attr: {
        in: "SourceGraphic",
        in2: "glow",
        operator: "over",
      },
    }),
  ];

  function changeNeonColor(paint) {
    if (paint.type !== "solidColor" || paint.solidColor === "none") return;

    if (paint.alpha) {
      val = "#" + paint.solidColor + alphaToHex(paint.alpha);

      svgCanvas.setEffect(
        val,
        true,
        "_neon",
        "feFlood",
        "flood-color",
        getNeonColorFilterItems,
        undefined,
        svgCanvas.setOffsets,
        (val, extension, tagName, attr, deleteValue) =>
          svgCanvas.setEffectNoUndo(
            val,
            extension,
            tagName,
            attr,
            deleteValue,
            (val) =>
              svgCanvas.setEffect(
                val,
                false,
                extension,
                tagName,
                attr,
                getNeonColorFilterItems,
                deleteValue,
                svgCanvas.setOffsets
              )
          )
      );
    } else {
      svgCanvas.removeEffect("_neon");
      editor.paintBox.shadow.setPaint(
        { alpha: 100, solidColor: "d40213", type: "solidColor" },
        true
      );
    }
  }

  const getHueShiftFilterItems = (val) => [
    svgCanvas.addSvgElementFromJson({
      element: "feColorMatrix",
      attr: {
        type: "hueRotate",
        values: val,
      },
    }),
  ];

  function changeHueShift() {
    const val = parseFloat($("#hue_shift").val());

    svgCanvas.setEffect(
      val,
      true,
      "_hue",
      "feColorMatrix",
      "values",
      getHueShiftFilterItems,
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              getHueShiftFilterItems,
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  const getColorHighlightFilterItems = (val) => {
    const feComponentTransfer = svgCanvas.addSvgElementFromJson({
      element: "feComponentTransfer",
      attr: { in: "SourceGraphic" },
    });

    feComponentTransfer.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feFuncR",
        attr: {
          type: "table",
          tableValues: val + " 0",
        },
      })
    );

    feComponentTransfer.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feFuncG",
        attr: {
          type: "table",
          tableValues: "1 0",
        },
      })
    );

    feComponentTransfer.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feFuncB",
        attr: {
          type: "table",
          tableValues: "1 0",
        },
      })
    );

    return [feComponentTransfer];
  };

  function changeColorHighlightR() {
    const val = parseFloat($("#color_highlight_r").val());

    svgCanvas.setEffect(
      val,
      true,
      "_color_highlight",
      "feFuncR",
      "tableValues",
      getColorHighlightFilterItems,
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              getColorHighlightFilterItems,
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  const getColorHighlightGFilterItems = (val) => {
    const feComponentTransfer = svgCanvas.addSvgElementFromJson({
      element: "feComponentTransfer",
      attr: { in: "SourceGraphic" },
    });

    feComponentTransfer.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feFuncR",
        attr: {
          type: "table",
          tableValues: "1 0",
        },
      })
    );

    feComponentTransfer.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feFuncG",
        attr: {
          type: "table",
          tableValues: val + " 0",
        },
      })
    );

    feComponentTransfer.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feFuncB",
        attr: {
          type: "table",
          tableValues: "1 0",
        },
      })
    );

    return [feComponentTransfer];
  };

  function changeColorHighlightG() {
    const val = parseFloat($("#color_highlight_g").val());

    svgCanvas.setEffect(
      val,
      true,
      "_color_highlight",
      "feFuncG",
      "tableValues",
      getColorHighlightGFilterItems,
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              () => {
                const feComponentTransfer = svgCanvas.addSvgElementFromJson({
                  element: "feComponentTransfer",
                  attr: { in: "SourceGraphic" },
                });

                feComponentTransfer.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feFuncR",
                    attr: {
                      type: "table",
                      tableValues: "1 0",
                    },
                  })
                );

                feComponentTransfer.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feFuncG",
                    attr: {
                      type: "table",
                      tableValues: val + " 0",
                    },
                  })
                );

                feComponentTransfer.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feFuncB",
                    attr: {
                      type: "table",
                      tableValues: "1 0",
                    },
                  })
                );

                return [feComponentTransfer];
              },
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  const getColorHighlightBFilterItems = (val) => {
    const feComponentTransfer = svgCanvas.addSvgElementFromJson({
      element: "feComponentTransfer",
      attr: { in: "SourceGraphic" },
    });

    feComponentTransfer.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feFuncR",
        attr: {
          type: "table",
          tableValues: "1 0",
        },
      })
    );

    feComponentTransfer.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feFuncG",
        attr: {
          type: "table",
          tableValues: "1 0",
        },
      })
    );

    feComponentTransfer.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feFuncB",
        attr: {
          type: "table",
          tableValues: val + " 0",
        },
      })
    );

    return [feComponentTransfer];
  };

  function changeColorHighlightB() {
    const val = parseFloat($("#color_highlight_b").val());

    svgCanvas.setEffect(
      val,
      true,
      "_color_highlight",
      "feFuncB",
      "tableValues",
      getColorHighlightBFilterItems,
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              getColorHighlightBFilterItems,
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  const getGooeyStrengthFilterItems = (val) => [
    svgCanvas.addSvgElementFromJson({
      element: "feGaussianBlur",
      attr: {
        in: "SourceAlpha",
        stdDeviation: val,
        result: "blur",
      },
    }),
    svgCanvas.addSvgElementFromJson({
      element: "feColorMatrix",
      attr: {
        in: "blur",
        mode: "matrix",
        values: "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -10",
        result: "gooey",
      },
    }),
    svgCanvas.addSvgElementFromJson({
      element: "feComposite",
      attr: {
        in: "SourceGraphic",
        in2: "gooey",
        operator: "atop",
      },
    }),
  ];

  function changeGooeyStrength() {
    const val = parseFloat($("#gooey_strength").val());

    svgCanvas.setEffect(
      val,
      true,
      "_shadow",
      "feGaussianBlur",
      "stdDeviation",
      getGooeyStrengthFilterItems,
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              getGooeyStrengthFilterItems,
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  const getCyberpunkStrengthFilterItems = (val) => {
    const feFlood = svgCanvas.addSvgElementFromJson({
      element: "feFlood",
      attr: {
        "flood-color": "#00ffff",
        "flood-opacity": "1",
        result: "neonColor",
      },
    });

    feFlood.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          repeatCount: "indefinite",
          dur: "3s",
          values: "1;0.1;1",
          attributeName: "flood-opacity",
        },
      })
    );

    feFlood.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          repeatCount: "indefinite",
          dur: "6s",
          values: "#00ffff;#ff00ff;#00ffff",
          attributeName: "flood-color",
        },
      })
    );

    const feMerge = svgCanvas.addSvgElementFromJson({
      element: "feMerge",
      attr: {},
    });

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "glow",
        },
      })
    );

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "SourceGraphic",
        },
      })
    );

    return [
      svgCanvas.addSvgElementFromJson({
        element: "feGaussianBlur",
        attr: {
          in: "SourceAlpha",
          stdDeviation: val,
          result: "blurred",
        },
      }),
      feFlood,
      svgCanvas.addSvgElementFromJson({
        element: "feComposite",
        attr: {
          in: "neonColor",
          in2: "blurred",
          operator: "in",
          result: "glow",
        },
      }),
      feMerge,
    ];
  };

  function changeCyberpunkStrength() {
    const val = parseFloat($("#cyberpunk_strength").val());

    svgCanvas.setEffect(
      val,
      true,
      "_cyberpunk",
      "feGaussianBlur",
      "stdDeviation",
      getCyberpunkStrengthFilterItems,
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              getCyberpunkStrengthFilterItems,
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  const getCyberpunkSpeedFilterItems = (val) => {
    const feFlood = svgCanvas.addSvgElementFromJson({
      element: "feFlood",
      attr: {
        "flood-color": "#00ffff",
        "flood-opacity": "1",
        result: "neonColor",
      },
    });

    feFlood.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          repeatCount: "indefinite",
          dur: val + "s",
          values: "1;0.1;1",
          attributeName: "flood-opacity",
        },
      })
    );

    feFlood.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          repeatCount: "indefinite",
          dur: val + "s",
          values: "#00ffff;#ff00ff;#00ffff",
          attributeName: "flood-color",
        },
      })
    );

    const feMerge = svgCanvas.addSvgElementFromJson({
      element: "feMerge",
      attr: {},
    });

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "glow",
        },
      })
    );

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "SourceGraphic",
        },
      })
    );

    return [
      svgCanvas.addSvgElementFromJson({
        element: "feGaussianBlur",
        attr: {
          in: "SourceAlpha",
          stdDeviation: "0",
          result: "blurred",
        },
      }),
      feFlood,
      svgCanvas.addSvgElementFromJson({
        element: "feComposite",
        attr: {
          in: "neonColor",
          in2: "blurred",
          operator: "in",
          result: "glow",
        },
      }),
      feMerge,
    ];
  };

  function changeCyberpunkSpeed() {
    const val = parseFloat($("#cyberpunk_speed").val());

    svgCanvas.setEffect(
      val,
      true,
      "_cyberpunk",
      "animate",
      "dur",
      getCyberpunkSpeedFilterItems,
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              getCyberpunkSpeedFilterItems,
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  const getFireStrengthFilterItems = (val) => {
    const feGaussianBlur = svgCanvas.addSvgElementFromJson({
      element: "feGaussianBlur",
      attr: {
        result: "blurred",
        stdDeviation: val,
        in: "SourceAlpha",
      },
    });

    feGaussianBlur.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          attributeName: "stdDeviation",
          values: `${val};${val + 3};${val}`,
          dur: "0.7s",
          repeatCount: "indefinite",
        },
      })
    );

    const feFlood = svgCanvas.addSvgElementFromJson({
      element: "feFlood",
      attr: {
        result: "glowColor",
        "flood-opacity": "1",
        "flood-color": "#ff6600",
      },
    });

    feFlood.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          attributeName: "flood-opacity",
          values: "1;0.5;1",
          dur: "0.7s",
          repeatCount: "indefinite",
        },
      })
    );

    const feMerge = svgCanvas.addSvgElementFromJson({
      element: "feMerge",
      attr: {},
    });

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "glow",
        },
      })
    );

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "SourceGraphic",
        },
      })
    );

    return [
      feGaussianBlur,
      feFlood,
      svgCanvas.addSvgElementFromJson({
        element: "feComposite",
        attr: {
          result: "glow",
          operator: "in",
          in2: "blurred",
          in: "glowColor",
        },
      }),
      feMerge,
    ];
  };

  function changeFireStrength() {
    const val = parseFloat($("#fire_strength").val());

    svgCanvas.setEffect(
      val,
      true,
      "_fire",
      "feGaussianBlur",
      "stdDeviation",
      getFireStrengthFilterItems,
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              getFireStrengthFilterItems,
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  const getFireSpeedFilterItems = (val) => {
    const feGaussianBlur = svgCanvas.addSvgElementFromJson({
      element: "feGaussianBlur",
      attr: {
        result: "blurred",
        stdDeviation: "5",
        in: "SourceAlpha",
      },
    });

    feGaussianBlur.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          attributeName: "stdDeviation",
          values: "5;8;5",
          dur: val,
          repeatCount: "indefinite",
        },
      })
    );

    const feFlood = svgCanvas.addSvgElementFromJson({
      element: "feFlood",
      attr: {
        result: "glowColor",
        "flood-opacity": "1",
        "flood-color": "#ff6600",
      },
    });

    feFlood.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          attributeName: "flood-opacity",
          values: "1;0.5;1",
          dur: val,
          repeatCount: "indefinite",
        },
      })
    );

    const feMerge = svgCanvas.addSvgElementFromJson({
      element: "feMerge",
      attr: {},
    });

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "glow",
        },
      })
    );

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "SourceGraphic",
        },
      })
    );

    return [
      feGaussianBlur,
      feFlood,
      svgCanvas.addSvgElementFromJson({
        element: "feComposite",
        attr: {
          result: "glow",
          operator: "in",
          in2: "blurred",
          in: "glowColor",
        },
      }),
      feMerge,
    ];
  };

  function changeFireSpeed() {
    const val = parseFloat($("#fire_speed").val());

    svgCanvas.setEffect(
      val,
      true,
      "_fire",
      "animate",
      "dur",
      getFireSpeedFilterItems,
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              getFireSpeedFilterItems,
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  const getGlitchStrengthFilterItems = (val) => {
    const feColorMatrixBlue = svgCanvas.addSvgElementFromJson({
      element: "feColorMatrix",
      attr: {
        values: "0 0 0 0 0 0 0 0 0 0 0 0 1.5 0 0 0 0 0 1 0",
        result: "glitchMatrixBlue",
        in: "SourceGraphic",
        type: "matrix",
      },
    });

    feColorMatrixBlue.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          keySplines: ".42,0,.58,1; .25,1,.75,0; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0; 0.25; 1",
          values:
            "0 0 0 0 0 0 0 0 0 0 0 0 1.5 0 0 0 0 0 1 0; 0 0 0 0 0 0 0 0 0 0 0 0 3 0 -0.5 0 0 0 1 0; 0 0 0 0 0 0 0 0 0 0 0 0 1.5 0 0 0 0 0 1 0",
          repeatCount: "indefinite",
          dur: "1.5s",
          attributeName: "values",
        },
      })
    );

    const feColorMatrixRed = svgCanvas.addSvgElementFromJson({
      element: "feColorMatrix",
      attr: {
        values: "1.5 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0",
        result: "glitchMatrixRed",
        in: "SourceGraphic",
        type: "matrix",
      },
    });

    feColorMatrixRed.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          keySplines: ".42,0,.58,1; .25,1,.75,0; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0; 0.25; 1",
          values:
            "1.5 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0; 3 0 0 0 -0.5 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0; 1.5 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0",
          repeatCount: "indefinite",
          dur: "1.5s",
          attributeName: "values",
        },
      })
    );

    const feOffsetBlue = svgCanvas.addSvgElementFromJson({
      element: "feOffset",
      attr: {
        dy: "1.5",
        dx: "5",
        result: "offsetBlue",
        in: "glitchMatrixBlue",
      },
    });

    feOffsetBlue.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0; 0.25; 1",
          values: "5; 0; 0",
          repeatCount: "indefinite",
          dur: "1.5s",
          attributeName: "dx",
        },
      })
    );

    feOffsetBlue.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0; 0.25; 1",
          values: "0.5; 0; 0",
          repeatCount: "indefinite",
          dur: "1.5s",
          attributeName: "dy",
        },
      })
    );

    const feOffsetRed = svgCanvas.addSvgElementFromJson({
      element: "feOffset",
      attr: {
        dy: "-1.5",
        dx: "-3",
        result: "offsetRed",
        in: "glitchMatrixRed",
      },
    });

    feOffsetRed.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          begin: "0.03s",
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0; 0.25; 1",
          values: "-4; 0; 0",
          repeatCount: "indefinite",
          dur: "1.5s",
          attributeName: "dx",
        },
      })
    );

    feOffsetRed.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          begin: "0.03s",
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0; 0.25; 1",
          values: "-3; 0; 0",
          repeatCount: "indefinite",
          dur: "1.5s",
          attributeName: "dy",
        },
      })
    );

    const feGaussianBlurBlue = svgCanvas.addSvgElementFromJson({
      element: "feGaussianBlur",
      attr: {
        result: "blurredBlue",
        stdDeviation: val,
        in: "offsetBlue",
      },
    });

    feGaussianBlurBlue.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          keySplines: ".42,0,.58,1; .42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          attributeName: "stdDeviation",
          dur: "1.5s",
          repeatCount: "indefinite",
          values: `${val}; 0; 0; 0`,
          keyTimes: "0; 0.25; 0.75; 1",
        },
      })
    );

    const feGaussianBlurRed = svgCanvas.addSvgElementFromJson({
      element: "feGaussianBlur",
      attr: {
        result: "blurredRed",
        stdDeviation: val,
        in: "offsetRed",
      },
    });

    feGaussianBlurRed.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          keySplines: ".42,0,.58,1; .42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          attributeName: "stdDeviation",
          dur: "1.5s",
          repeatCount: "indefinite",
          values: `${val}; 0; 0; 0`,
          keyTimes: "0; 0.25; 0.75; 1",
        },
      })
    );

    const feMerge = svgCanvas.addSvgElementFromJson({
      element: "feMerge",
      attr: {},
    });

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "blurredBlue",
        },
      })
    );

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "blurredRed",
        },
      })
    );

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "SourceGraphic",
        },
      })
    );

    return [
      feColorMatrixBlue,
      feColorMatrixRed,
      feOffsetBlue,
      feOffsetRed,
      feGaussianBlurBlue,
      feGaussianBlurRed,
      feMerge,
    ];
  };

  function changeGlitchStrength() {
    const val = parseFloat($("#glitch_strength").val());

    svgCanvas.setEffect(
      val,
      true,
      "_glitch",
      "feGaussianBlur",
      "stdDeviation",
      getGlitchStrengthFilterItems,
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              getGlitchStrengthFilterItems,
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  const getGlitchOffsetFilterItems = (val) => {
    const feColorMatrixBlue = svgCanvas.addSvgElementFromJson({
      element: "feColorMatrix",
      attr: {
        values: "0 0 0 0 0 0 0 0 0 0 0 0 1.5 0 0 0 0 0 1 0",
        result: "glitchMatrixBlue",
        in: "SourceGraphic",
        type: "matrix",
      },
    });

    feColorMatrixBlue.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          keySplines: ".42,0,.58,1; .25,1,.75,0; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0; 0.25; 1",
          values:
            "0 0 0 0 0 0 0 0 0 0 0 0 1.5 0 0 0 0 0 1 0; 0 0 0 0 0 0 0 0 0 0 0 0 3 0 -0.5 0 0 0 1 0; 0 0 0 0 0 0 0 0 0 0 0 0 1.5 0 0 0 0 0 1 0",
          repeatCount: "indefinite",
          dur: "1.5s",
          attributeName: "values",
        },
      })
    );

    const feColorMatrixRed = svgCanvas.addSvgElementFromJson({
      element: "feColorMatrix",
      attr: {
        values: "1.5 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0",
        result: "glitchMatrixRed",
        in: "SourceGraphic",
        type: "matrix",
      },
    });

    feColorMatrixRed.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          keySplines: ".42,0,.58,1; .25,1,.75,0; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0; 0.25; 1",
          values:
            "1.5 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0; 3 0 0 0 -0.5 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0; 1.5 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0",
          repeatCount: "indefinite",
          dur: "1.5s",
          attributeName: "values",
        },
      })
    );

    const feOffsetBlue = svgCanvas.addSvgElementFromJson({
      element: "feOffset",
      attr: {
        dy: val * 0.5,
        dx: val * 5,
        result: "offsetBlue",
        in: "glitchMatrixBlue",
      },
    });

    feOffsetBlue.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0; 0.25; 1",
          values: `${val * 5}; 0; 0`,
          repeatCount: "indefinite",
          dur: "1.5s",
          attributeName: "dx",
        },
      })
    );

    feOffsetBlue.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0; 0.25; 1",
          values: `${val * 0.5}; 0; 0`,
          repeatCount: "indefinite",
          dur: "1.5s",
          attributeName: "dy",
        },
      })
    );

    const feOffsetRed = svgCanvas.addSvgElementFromJson({
      element: "feOffset",
      attr: {
        dy: val * -3,
        dx: val * -4,
        result: "offsetRed",
        in: "glitchMatrixRed",
      },
    });

    feOffsetRed.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          begin: "0.03s",
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0; 0.25; 1",
          values: `${val * -4}; 0; 0`,
          repeatCount: "indefinite",
          dur: "1.5s",
          attributeName: "dx",
        },
      })
    );

    feOffsetRed.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          begin: "0.03s",
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0; 0.25; 1",
          values: `${val * -3}; 0; 0`,
          repeatCount: "indefinite",
          dur: "1.5s",
          attributeName: "dy",
        },
      })
    );

    const feGaussianBlurBlue = svgCanvas.addSvgElementFromJson({
      element: "feGaussianBlur",
      attr: {
        result: "blurredBlue",
        stdDeviation: "0",
        in: "offsetBlue",
      },
    });

    feGaussianBlurBlue.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          keySplines: ".42,0,.58,1; .42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          attributeName: "stdDeviation",
          dur: "1.5s",
          repeatCount: "indefinite",
          values: "1.5; 0; 0; 0",
          keyTimes: "0; 0.25; 0.75; 1",
        },
      })
    );

    const feGaussianBlurRed = svgCanvas.addSvgElementFromJson({
      element: "feGaussianBlur",
      attr: {
        result: "blurredRed",
        stdDeviation: "0",
        in: "offsetRed",
      },
    });

    feGaussianBlurRed.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          keySplines: ".42,0,.58,1; .42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          attributeName: "stdDeviation",
          dur: "1.5s",
          repeatCount: "indefinite",
          values: "1.5; 0; 0; 0",
          keyTimes: "0; 0.25; 0.75; 1",
        },
      })
    );

    const feMerge = svgCanvas.addSvgElementFromJson({
      element: "feMerge",
      attr: {},
    });

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "blurredBlue",
        },
      })
    );

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "blurredRed",
        },
      })
    );

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "SourceGraphic",
        },
      })
    );

    return [
      feColorMatrixBlue,
      feColorMatrixRed,
      feOffsetBlue,
      feOffsetRed,
      feGaussianBlurBlue,
      feGaussianBlurRed,
      feMerge,
    ];
  };

  function changeGlitchOffset() {
    const val = parseFloat($("#glitch_offset").val());

    svgCanvas.setEffect(
      val,
      true,
      "_glitch",
      "feGaussianBlur",
      "stdDeviation",
      getGlitchOffsetFilterItems,
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              getGlitchOffsetFilterItems,
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  const getGlitchSpeedFilterItems = (val) => {
    const feColorMatrixBlue = svgCanvas.addSvgElementFromJson({
      element: "feColorMatrix",
      attr: {
        values: "0 0 0 0 0 0 0 0 0 0 0 0 1.5 0 0 0 0 0 1 0",
        result: "glitchMatrixBlue",
        in: "SourceGraphic",
        type: "matrix",
      },
    });

    feColorMatrixBlue.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          keySplines: ".42,0,.58,1; .25,1,.75,0; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0; 0.25; 1",
          values:
            "0 0 0 0 0 0 0 0 0 0 0 0 1.5 0 0 0 0 0 1 0; 0 0 0 0 0 0 0 0 0 0 0 0 3 0 -0.5 0 0 0 1 0; 0 0 0 0 0 0 0 0 0 0 0 0 1.5 0 0 0 0 0 1 0",
          repeatCount: "indefinite",
          dur: val + "s",
          attributeName: "values",
        },
      })
    );

    const feColorMatrixRed = svgCanvas.addSvgElementFromJson({
      element: "feColorMatrix",
      attr: {
        values: "1.5 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0",
        result: "glitchMatrixRed",
        in: "SourceGraphic",
        type: "matrix",
      },
    });

    feColorMatrixRed.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          keySplines: ".42,0,.58,1; .25,1,.75,0; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0; 0.25; 1",
          values:
            "1.5 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0; 3 0 0 0 -0.5 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0; 1.5 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0",
          repeatCount: "indefinite",
          dur: val + "s",
          attributeName: "values",
        },
      })
    );

    const feOffsetBlue = svgCanvas.addSvgElementFromJson({
      element: "feOffset",
      attr: {
        dy: "0.5",
        dx: "5",
        result: "offsetBlue",
        in: "glitchMatrixBlue",
      },
    });

    feOffsetBlue.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0; 0.25; 1",
          values: "5; 0; 0",
          repeatCount: "indefinite",
          dur: val + "s",
          attributeName: "dx",
        },
      })
    );

    feOffsetBlue.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0; 0.25; 1",
          values: "0.5; 0; 0",
          repeatCount: "indefinite",
          dur: val + "s",
          attributeName: "dy",
        },
      })
    );

    const feOffsetRed = svgCanvas.addSvgElementFromJson({
      element: "feOffset",
      attr: {
        dy: "-3",
        dx: "-4",
        result: "offsetRed",
        in: "glitchMatrixRed",
      },
    });

    feOffsetRed.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          begin: "0.03s",
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0; 0.25; 1",
          values: "-4; 0; 0",
          repeatCount: "indefinite",
          dur: val + "s",
          attributeName: "dx",
        },
      })
    );

    feOffsetRed.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          begin: "0.03s",
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0; 0.25; 1",
          values: "-3; 0; 0",
          repeatCount: "indefinite",
          dur: val + "s",
          attributeName: "dy",
        },
      })
    );

    const feGaussianBlurBlue = svgCanvas.addSvgElementFromJson({
      element: "feGaussianBlur",
      attr: {
        result: "blurredBlue",
        stdDeviation: "0",
        in: "offsetBlue",
      },
    });

    feGaussianBlurBlue.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          keySplines: ".42,0,.58,1; .42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          attributeName: "stdDeviation",
          dur: val + "s",
          repeatCount: "indefinite",
          values: "0; 0; 0; 0",
          keyTimes: "0; 0.25; 0.75; 1",
        },
      })
    );

    const feGaussianBlurRed = svgCanvas.addSvgElementFromJson({
      element: "feGaussianBlur",
      attr: {
        result: "blurredRed",
        stdDeviation: "0",
        in: "offsetRed",
      },
    });

    feGaussianBlurRed.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          keySplines: ".42,0,.58,1; .42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          attributeName: "stdDeviation",
          dur: val + "s",
          repeatCount: "indefinite",
          values: "0; 0; 0; 0",
          keyTimes: "0; 0.25; 0.75; 1",
        },
      })
    );

    const feMerge = svgCanvas.addSvgElementFromJson({
      element: "feMerge",
      attr: {},
    });

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "blurredBlue",
        },
      })
    );

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "blurredRed",
        },
      })
    );

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "SourceGraphic",
        },
      })
    );

    return [
      feColorMatrixBlue,
      feColorMatrixRed,
      feOffsetBlue,
      feOffsetRed,
      feGaussianBlurBlue,
      feGaussianBlurRed,
      feMerge,
    ];
  };

  function changeGlitchSpeed() {
    const val = parseFloat($("#glitch_speed").val());

    svgCanvas.setEffect(
      val,
      true,
      "_glitch",
      "feGaussianBlur",
      "stdDeviation",
      getGlitchSpeedFilterItems,
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              getGlitchSpeedFilterItems,
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  const getFilterItems = (val) => [];

  function changeShadowStrength() {
    const val = parseFloat($("#shadow_strength").val());

    svgCanvas.setEffect(
      val,
      true,
      "_shadow",
      "feGaussianBlur",
      "stdDeviation",
      () => {
        const feMerge = svgCanvas.addSvgElementFromJson({
          element: "feMerge",
          attr: {},
        });

        feMerge.appendChild(
          svgCanvas.addSvgElementFromJson({
            element: "feMergeNode",
            attr: {
              in: "coloredBlur",
            },
          })
        );

        feMerge.appendChild(
          svgCanvas.addSvgElementFromJson({
            element: "feMergeNode",
            attr: {
              in: "SourceGraphic",
            },
          })
        );

        return [
          svgCanvas.addSvgElementFromJson({
            element: "feGaussianBlur",
            attr: {
              in: "SourceAlpha",
              stdDeviation: val,
              result: "blur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feOffset",
            attr: {
              in: "blur",
              dx: "0",
              dy: "5",
              result: "offsetBlur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feFlood",
            attr: {
              "flood-color": "#090909",
              result: "colorBlur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feComposite",
            attr: {
              in: "colorBlur",
              in2: "offsetBlur",
              operator: "in",
              result: "coloredBlur",
            },
          }),
          feMerge,
        ];
      },
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              () => {
                const feMerge = svgCanvas.addSvgElementFromJson({
                  element: "feMerge",
                  attr: {},
                });

                feMerge.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feMergeNode",
                    attr: {
                      in: "coloredBlur",
                    },
                  })
                );

                feMerge.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feMergeNode",
                    attr: {
                      in: "SourceGraphic",
                    },
                  })
                );

                return [
                  svgCanvas.addSvgElementFromJson({
                    element: "feGaussianBlur",
                    attr: {
                      in: "SourceAlpha",
                      stdDeviation: val,
                      result: "blur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feOffset",
                    attr: {
                      in: "blur",
                      dx: "0",
                      dy: "5",
                      result: "offsetBlur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feFlood",
                    attr: {
                      "flood-color": "#090909",
                      result: "colorBlur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feComposite",
                    attr: {
                      in: "colorBlur",
                      in2: "offsetBlur",
                      operator: "in",
                      result: "coloredBlur",
                    },
                  }),
                  feMerge,
                ];
              },
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  function changeShadowStrength() {
    const val = parseFloat($("#shadow_strength").val());

    svgCanvas.setEffect(
      val,
      true,
      "_shadow",
      "feGaussianBlur",
      "stdDeviation",
      () => {
        const feMerge = svgCanvas.addSvgElementFromJson({
          element: "feMerge",
          attr: {},
        });

        feMerge.appendChild(
          svgCanvas.addSvgElementFromJson({
            element: "feMergeNode",
            attr: {
              in: "coloredBlur",
            },
          })
        );

        feMerge.appendChild(
          svgCanvas.addSvgElementFromJson({
            element: "feMergeNode",
            attr: {
              in: "SourceGraphic",
            },
          })
        );

        return [
          svgCanvas.addSvgElementFromJson({
            element: "feGaussianBlur",
            attr: {
              in: "SourceAlpha",
              stdDeviation: val,
              result: "blur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feOffset",
            attr: {
              in: "blur",
              dx: "0",
              dy: "5",
              result: "offsetBlur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feFlood",
            attr: {
              "flood-color": "#090909",
              result: "colorBlur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feComposite",
            attr: {
              in: "colorBlur",
              in2: "offsetBlur",
              operator: "in",
              result: "coloredBlur",
            },
          }),
          feMerge,
        ];
      },
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              () => {
                const feMerge = svgCanvas.addSvgElementFromJson({
                  element: "feMerge",
                  attr: {},
                });

                feMerge.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feMergeNode",
                    attr: {
                      in: "coloredBlur",
                    },
                  })
                );

                feMerge.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feMergeNode",
                    attr: {
                      in: "SourceGraphic",
                    },
                  })
                );

                return [
                  svgCanvas.addSvgElementFromJson({
                    element: "feGaussianBlur",
                    attr: {
                      in: "SourceAlpha",
                      stdDeviation: val,
                      result: "blur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feOffset",
                    attr: {
                      in: "blur",
                      dx: "0",
                      dy: "5",
                      result: "offsetBlur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feFlood",
                    attr: {
                      "flood-color": "#090909",
                      result: "colorBlur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feComposite",
                    attr: {
                      in: "colorBlur",
                      in2: "offsetBlur",
                      operator: "in",
                      result: "coloredBlur",
                    },
                  }),
                  feMerge,
                ];
              },
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  function changeShadowStrength() {
    const val = parseFloat($("#shadow_strength").val());

    svgCanvas.setEffect(
      val,
      true,
      "_shadow",
      "feGaussianBlur",
      "stdDeviation",
      () => {
        const feMerge = svgCanvas.addSvgElementFromJson({
          element: "feMerge",
          attr: {},
        });

        feMerge.appendChild(
          svgCanvas.addSvgElementFromJson({
            element: "feMergeNode",
            attr: {
              in: "coloredBlur",
            },
          })
        );

        feMerge.appendChild(
          svgCanvas.addSvgElementFromJson({
            element: "feMergeNode",
            attr: {
              in: "SourceGraphic",
            },
          })
        );

        return [
          svgCanvas.addSvgElementFromJson({
            element: "feGaussianBlur",
            attr: {
              in: "SourceAlpha",
              stdDeviation: val,
              result: "blur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feOffset",
            attr: {
              in: "blur",
              dx: "0",
              dy: "5",
              result: "offsetBlur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feFlood",
            attr: {
              "flood-color": "#090909",
              result: "colorBlur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feComposite",
            attr: {
              in: "colorBlur",
              in2: "offsetBlur",
              operator: "in",
              result: "coloredBlur",
            },
          }),
          feMerge,
        ];
      },
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              () => {
                const feMerge = svgCanvas.addSvgElementFromJson({
                  element: "feMerge",
                  attr: {},
                });

                feMerge.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feMergeNode",
                    attr: {
                      in: "coloredBlur",
                    },
                  })
                );

                feMerge.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feMergeNode",
                    attr: {
                      in: "SourceGraphic",
                    },
                  })
                );

                return [
                  svgCanvas.addSvgElementFromJson({
                    element: "feGaussianBlur",
                    attr: {
                      in: "SourceAlpha",
                      stdDeviation: val,
                      result: "blur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feOffset",
                    attr: {
                      in: "blur",
                      dx: "0",
                      dy: "5",
                      result: "offsetBlur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feFlood",
                    attr: {
                      "flood-color": "#090909",
                      result: "colorBlur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feComposite",
                    attr: {
                      in: "colorBlur",
                      in2: "offsetBlur",
                      operator: "in",
                      result: "coloredBlur",
                    },
                  }),
                  feMerge,
                ];
              },
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  function changeShadowStrength() {
    const val = parseFloat($("#shadow_strength").val());

    svgCanvas.setEffect(
      val,
      true,
      "_shadow",
      "feGaussianBlur",
      "stdDeviation",
      () => {
        const feMerge = svgCanvas.addSvgElementFromJson({
          element: "feMerge",
          attr: {},
        });

        feMerge.appendChild(
          svgCanvas.addSvgElementFromJson({
            element: "feMergeNode",
            attr: {
              in: "coloredBlur",
            },
          })
        );

        feMerge.appendChild(
          svgCanvas.addSvgElementFromJson({
            element: "feMergeNode",
            attr: {
              in: "SourceGraphic",
            },
          })
        );

        return [
          svgCanvas.addSvgElementFromJson({
            element: "feGaussianBlur",
            attr: {
              in: "SourceAlpha",
              stdDeviation: val,
              result: "blur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feOffset",
            attr: {
              in: "blur",
              dx: "0",
              dy: "5",
              result: "offsetBlur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feFlood",
            attr: {
              "flood-color": "#090909",
              result: "colorBlur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feComposite",
            attr: {
              in: "colorBlur",
              in2: "offsetBlur",
              operator: "in",
              result: "coloredBlur",
            },
          }),
          feMerge,
        ];
      },
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              () => {
                const feMerge = svgCanvas.addSvgElementFromJson({
                  element: "feMerge",
                  attr: {},
                });

                feMerge.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feMergeNode",
                    attr: {
                      in: "coloredBlur",
                    },
                  })
                );

                feMerge.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feMergeNode",
                    attr: {
                      in: "SourceGraphic",
                    },
                  })
                );

                return [
                  svgCanvas.addSvgElementFromJson({
                    element: "feGaussianBlur",
                    attr: {
                      in: "SourceAlpha",
                      stdDeviation: val,
                      result: "blur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feOffset",
                    attr: {
                      in: "blur",
                      dx: "0",
                      dy: "5",
                      result: "offsetBlur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feFlood",
                    attr: {
                      "flood-color": "#090909",
                      result: "colorBlur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feComposite",
                    attr: {
                      in: "colorBlur",
                      in2: "offsetBlur",
                      operator: "in",
                      result: "coloredBlur",
                    },
                  }),
                  feMerge,
                ];
              },
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  function changeShadowStrength() {
    const val = parseFloat($("#shadow_strength").val());

    svgCanvas.setEffect(
      val,
      true,
      "_shadow",
      "feGaussianBlur",
      "stdDeviation",
      () => {
        const feMerge = svgCanvas.addSvgElementFromJson({
          element: "feMerge",
          attr: {},
        });

        feMerge.appendChild(
          svgCanvas.addSvgElementFromJson({
            element: "feMergeNode",
            attr: {
              in: "coloredBlur",
            },
          })
        );

        feMerge.appendChild(
          svgCanvas.addSvgElementFromJson({
            element: "feMergeNode",
            attr: {
              in: "SourceGraphic",
            },
          })
        );

        return [
          svgCanvas.addSvgElementFromJson({
            element: "feGaussianBlur",
            attr: {
              in: "SourceAlpha",
              stdDeviation: val,
              result: "blur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feOffset",
            attr: {
              in: "blur",
              dx: "0",
              dy: "5",
              result: "offsetBlur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feFlood",
            attr: {
              "flood-color": "#090909",
              result: "colorBlur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feComposite",
            attr: {
              in: "colorBlur",
              in2: "offsetBlur",
              operator: "in",
              result: "coloredBlur",
            },
          }),
          feMerge,
        ];
      },
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              () => {
                const feMerge = svgCanvas.addSvgElementFromJson({
                  element: "feMerge",
                  attr: {},
                });

                feMerge.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feMergeNode",
                    attr: {
                      in: "coloredBlur",
                    },
                  })
                );

                feMerge.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feMergeNode",
                    attr: {
                      in: "SourceGraphic",
                    },
                  })
                );

                return [
                  svgCanvas.addSvgElementFromJson({
                    element: "feGaussianBlur",
                    attr: {
                      in: "SourceAlpha",
                      stdDeviation: val,
                      result: "blur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feOffset",
                    attr: {
                      in: "blur",
                      dx: "0",
                      dy: "5",
                      result: "offsetBlur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feFlood",
                    attr: {
                      "flood-color": "#090909",
                      result: "colorBlur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feComposite",
                    attr: {
                      in: "colorBlur",
                      in2: "offsetBlur",
                      operator: "in",
                      result: "coloredBlur",
                    },
                  }),
                  feMerge,
                ];
              },
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  function changeShadowStrength() {
    const val = parseFloat($("#shadow_strength").val());

    svgCanvas.setEffect(
      val,
      true,
      "_shadow",
      "feGaussianBlur",
      "stdDeviation",
      () => {
        const feMerge = svgCanvas.addSvgElementFromJson({
          element: "feMerge",
          attr: {},
        });

        feMerge.appendChild(
          svgCanvas.addSvgElementFromJson({
            element: "feMergeNode",
            attr: {
              in: "coloredBlur",
            },
          })
        );

        feMerge.appendChild(
          svgCanvas.addSvgElementFromJson({
            element: "feMergeNode",
            attr: {
              in: "SourceGraphic",
            },
          })
        );

        return [
          svgCanvas.addSvgElementFromJson({
            element: "feGaussianBlur",
            attr: {
              in: "SourceAlpha",
              stdDeviation: val,
              result: "blur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feOffset",
            attr: {
              in: "blur",
              dx: "0",
              dy: "5",
              result: "offsetBlur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feFlood",
            attr: {
              "flood-color": "#090909",
              result: "colorBlur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feComposite",
            attr: {
              in: "colorBlur",
              in2: "offsetBlur",
              operator: "in",
              result: "coloredBlur",
            },
          }),
          feMerge,
        ];
      },
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              () => {
                const feMerge = svgCanvas.addSvgElementFromJson({
                  element: "feMerge",
                  attr: {},
                });

                feMerge.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feMergeNode",
                    attr: {
                      in: "coloredBlur",
                    },
                  })
                );

                feMerge.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feMergeNode",
                    attr: {
                      in: "SourceGraphic",
                    },
                  })
                );

                return [
                  svgCanvas.addSvgElementFromJson({
                    element: "feGaussianBlur",
                    attr: {
                      in: "SourceAlpha",
                      stdDeviation: val,
                      result: "blur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feOffset",
                    attr: {
                      in: "blur",
                      dx: "0",
                      dy: "5",
                      result: "offsetBlur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feFlood",
                    attr: {
                      "flood-color": "#090909",
                      result: "colorBlur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feComposite",
                    attr: {
                      in: "colorBlur",
                      in2: "offsetBlur",
                      operator: "in",
                      result: "coloredBlur",
                    },
                  }),
                  feMerge,
                ];
              },
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  function changeShadowStrength() {
    const val = parseFloat($("#shadow_strength").val());

    svgCanvas.setEffect(
      val,
      true,
      "_shadow",
      "feGaussianBlur",
      "stdDeviation",
      () => {
        const feMerge = svgCanvas.addSvgElementFromJson({
          element: "feMerge",
          attr: {},
        });

        feMerge.appendChild(
          svgCanvas.addSvgElementFromJson({
            element: "feMergeNode",
            attr: {
              in: "coloredBlur",
            },
          })
        );

        feMerge.appendChild(
          svgCanvas.addSvgElementFromJson({
            element: "feMergeNode",
            attr: {
              in: "SourceGraphic",
            },
          })
        );

        return [
          svgCanvas.addSvgElementFromJson({
            element: "feGaussianBlur",
            attr: {
              in: "SourceAlpha",
              stdDeviation: val,
              result: "blur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feOffset",
            attr: {
              in: "blur",
              dx: "0",
              dy: "5",
              result: "offsetBlur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feFlood",
            attr: {
              "flood-color": "#090909",
              result: "colorBlur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feComposite",
            attr: {
              in: "colorBlur",
              in2: "offsetBlur",
              operator: "in",
              result: "coloredBlur",
            },
          }),
          feMerge,
        ];
      },
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              () => {
                const feMerge = svgCanvas.addSvgElementFromJson({
                  element: "feMerge",
                  attr: {},
                });

                feMerge.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feMergeNode",
                    attr: {
                      in: "coloredBlur",
                    },
                  })
                );

                feMerge.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feMergeNode",
                    attr: {
                      in: "SourceGraphic",
                    },
                  })
                );

                return [
                  svgCanvas.addSvgElementFromJson({
                    element: "feGaussianBlur",
                    attr: {
                      in: "SourceAlpha",
                      stdDeviation: val,
                      result: "blur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feOffset",
                    attr: {
                      in: "blur",
                      dx: "0",
                      dy: "5",
                      result: "offsetBlur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feFlood",
                    attr: {
                      "flood-color": "#090909",
                      result: "colorBlur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feComposite",
                    attr: {
                      in: "colorBlur",
                      in2: "offsetBlur",
                      operator: "in",
                      result: "coloredBlur",
                    },
                  }),
                  feMerge,
                ];
              },
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  function changeShadowStrength() {
    const val = parseFloat($("#shadow_strength").val());

    svgCanvas.setEffect(
      val,
      true,
      "_shadow",
      "feGaussianBlur",
      "stdDeviation",
      () => {
        const feMerge = svgCanvas.addSvgElementFromJson({
          element: "feMerge",
          attr: {},
        });

        feMerge.appendChild(
          svgCanvas.addSvgElementFromJson({
            element: "feMergeNode",
            attr: {
              in: "coloredBlur",
            },
          })
        );

        feMerge.appendChild(
          svgCanvas.addSvgElementFromJson({
            element: "feMergeNode",
            attr: {
              in: "SourceGraphic",
            },
          })
        );

        return [
          svgCanvas.addSvgElementFromJson({
            element: "feGaussianBlur",
            attr: {
              in: "SourceAlpha",
              stdDeviation: val,
              result: "blur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feOffset",
            attr: {
              in: "blur",
              dx: "0",
              dy: "5",
              result: "offsetBlur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feFlood",
            attr: {
              "flood-color": "#090909",
              result: "colorBlur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feComposite",
            attr: {
              in: "colorBlur",
              in2: "offsetBlur",
              operator: "in",
              result: "coloredBlur",
            },
          }),
          feMerge,
        ];
      },
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              () => {
                const feMerge = svgCanvas.addSvgElementFromJson({
                  element: "feMerge",
                  attr: {},
                });

                feMerge.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feMergeNode",
                    attr: {
                      in: "coloredBlur",
                    },
                  })
                );

                feMerge.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feMergeNode",
                    attr: {
                      in: "SourceGraphic",
                    },
                  })
                );

                return [
                  svgCanvas.addSvgElementFromJson({
                    element: "feGaussianBlur",
                    attr: {
                      in: "SourceAlpha",
                      stdDeviation: val,
                      result: "blur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feOffset",
                    attr: {
                      in: "blur",
                      dx: "0",
                      dy: "5",
                      result: "offsetBlur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feFlood",
                    attr: {
                      "flood-color": "#090909",
                      result: "colorBlur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feComposite",
                    attr: {
                      in: "colorBlur",
                      in2: "offsetBlur",
                      operator: "in",
                      result: "coloredBlur",
                    },
                  }),
                  feMerge,
                ];
              },
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  function changeShadowStrength() {
    const val = parseFloat($("#shadow_strength").val());

    svgCanvas.setEffect(
      val,
      true,
      "_shadow",
      "feGaussianBlur",
      "stdDeviation",
      () => {
        const feMerge = svgCanvas.addSvgElementFromJson({
          element: "feMerge",
          attr: {},
        });

        feMerge.appendChild(
          svgCanvas.addSvgElementFromJson({
            element: "feMergeNode",
            attr: {
              in: "coloredBlur",
            },
          })
        );

        feMerge.appendChild(
          svgCanvas.addSvgElementFromJson({
            element: "feMergeNode",
            attr: {
              in: "SourceGraphic",
            },
          })
        );

        return [
          svgCanvas.addSvgElementFromJson({
            element: "feGaussianBlur",
            attr: {
              in: "SourceAlpha",
              stdDeviation: val,
              result: "blur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feOffset",
            attr: {
              in: "blur",
              dx: "0",
              dy: "5",
              result: "offsetBlur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feFlood",
            attr: {
              "flood-color": "#090909",
              result: "colorBlur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feComposite",
            attr: {
              in: "colorBlur",
              in2: "offsetBlur",
              operator: "in",
              result: "coloredBlur",
            },
          }),
          feMerge,
        ];
      },
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              () => {
                const feMerge = svgCanvas.addSvgElementFromJson({
                  element: "feMerge",
                  attr: {},
                });

                feMerge.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feMergeNode",
                    attr: {
                      in: "coloredBlur",
                    },
                  })
                );

                feMerge.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feMergeNode",
                    attr: {
                      in: "SourceGraphic",
                    },
                  })
                );

                return [
                  svgCanvas.addSvgElementFromJson({
                    element: "feGaussianBlur",
                    attr: {
                      in: "SourceAlpha",
                      stdDeviation: val,
                      result: "blur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feOffset",
                    attr: {
                      in: "blur",
                      dx: "0",
                      dy: "5",
                      result: "offsetBlur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feFlood",
                    attr: {
                      "flood-color": "#090909",
                      result: "colorBlur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feComposite",
                    attr: {
                      in: "colorBlur",
                      in2: "offsetBlur",
                      operator: "in",
                      result: "coloredBlur",
                    },
                  }),
                  feMerge,
                ];
              },
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  function changeShadowStrength() {
    const val = parseFloat($("#shadow_strength").val());

    svgCanvas.setEffect(
      val,
      true,
      "_shadow",
      "feGaussianBlur",
      "stdDeviation",
      () => {
        const feMerge = svgCanvas.addSvgElementFromJson({
          element: "feMerge",
          attr: {},
        });

        feMerge.appendChild(
          svgCanvas.addSvgElementFromJson({
            element: "feMergeNode",
            attr: {
              in: "coloredBlur",
            },
          })
        );

        feMerge.appendChild(
          svgCanvas.addSvgElementFromJson({
            element: "feMergeNode",
            attr: {
              in: "SourceGraphic",
            },
          })
        );

        return [
          svgCanvas.addSvgElementFromJson({
            element: "feGaussianBlur",
            attr: {
              in: "SourceAlpha",
              stdDeviation: val,
              result: "blur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feOffset",
            attr: {
              in: "blur",
              dx: "0",
              dy: "5",
              result: "offsetBlur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feFlood",
            attr: {
              "flood-color": "#090909",
              result: "colorBlur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feComposite",
            attr: {
              in: "colorBlur",
              in2: "offsetBlur",
              operator: "in",
              result: "coloredBlur",
            },
          }),
          feMerge,
        ];
      },
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              () => {
                const feMerge = svgCanvas.addSvgElementFromJson({
                  element: "feMerge",
                  attr: {},
                });

                feMerge.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feMergeNode",
                    attr: {
                      in: "coloredBlur",
                    },
                  })
                );

                feMerge.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feMergeNode",
                    attr: {
                      in: "SourceGraphic",
                    },
                  })
                );

                return [
                  svgCanvas.addSvgElementFromJson({
                    element: "feGaussianBlur",
                    attr: {
                      in: "SourceAlpha",
                      stdDeviation: val,
                      result: "blur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feOffset",
                    attr: {
                      in: "blur",
                      dx: "0",
                      dy: "5",
                      result: "offsetBlur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feFlood",
                    attr: {
                      "flood-color": "#090909",
                      result: "colorBlur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feComposite",
                    attr: {
                      in: "colorBlur",
                      in2: "offsetBlur",
                      operator: "in",
                      result: "coloredBlur",
                    },
                  }),
                  feMerge,
                ];
              },
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  function changeShadowStrength() {
    const val = parseFloat($("#shadow_strength").val());

    svgCanvas.setEffect(
      val,
      true,
      "_shadow",
      "feGaussianBlur",
      "stdDeviation",
      () => {
        const feMerge = svgCanvas.addSvgElementFromJson({
          element: "feMerge",
          attr: {},
        });

        feMerge.appendChild(
          svgCanvas.addSvgElementFromJson({
            element: "feMergeNode",
            attr: {
              in: "coloredBlur",
            },
          })
        );

        feMerge.appendChild(
          svgCanvas.addSvgElementFromJson({
            element: "feMergeNode",
            attr: {
              in: "SourceGraphic",
            },
          })
        );

        return [
          svgCanvas.addSvgElementFromJson({
            element: "feGaussianBlur",
            attr: {
              in: "SourceAlpha",
              stdDeviation: val,
              result: "blur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feOffset",
            attr: {
              in: "blur",
              dx: "0",
              dy: "5",
              result: "offsetBlur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feFlood",
            attr: {
              "flood-color": "#090909",
              result: "colorBlur",
            },
          }),
          svgCanvas.addSvgElementFromJson({
            element: "feComposite",
            attr: {
              in: "colorBlur",
              in2: "offsetBlur",
              operator: "in",
              result: "coloredBlur",
            },
          }),
          feMerge,
        ];
      },
      0,
      svgCanvas.setOffsets,
      (val, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(
          val,
          extension,
          tagName,
          attr,
          deleteValue,
          (val) =>
            svgCanvas.setEffect(
              val,
              false,
              extension,
              tagName,
              attr,
              () => {
                const feMerge = svgCanvas.addSvgElementFromJson({
                  element: "feMerge",
                  attr: {},
                });

                feMerge.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feMergeNode",
                    attr: {
                      in: "coloredBlur",
                    },
                  })
                );

                feMerge.appendChild(
                  svgCanvas.addSvgElementFromJson({
                    element: "feMergeNode",
                    attr: {
                      in: "SourceGraphic",
                    },
                  })
                );

                return [
                  svgCanvas.addSvgElementFromJson({
                    element: "feGaussianBlur",
                    attr: {
                      in: "SourceAlpha",
                      stdDeviation: val,
                      result: "blur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feOffset",
                    attr: {
                      in: "blur",
                      dx: "0",
                      dy: "5",
                      result: "offsetBlur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feFlood",
                    attr: {
                      "flood-color": "#090909",
                      result: "colorBlur",
                    },
                  }),
                  svgCanvas.addSvgElementFromJson({
                    element: "feComposite",
                    attr: {
                      in: "colorBlur",
                      in2: "offsetBlur",
                      operator: "in",
                      result: "coloredBlur",
                    },
                  }),
                  feMerge,
                ];
              },
              deleteValue,
              svgCanvas.setOffsets
            )
        )
    );
  }

  // (extension) =>
  //   svgCanvas.setEffectNoUndo(extension, () =>
  //     svgCanvas.setColorEffect(
  //       false,
  //       extension,
  //       () => {
  //         const feMerge = svgCanvas.addSvgElementFromJson({
  //           element: "feMerge",
  //           attr: {},
  //         });

  //         feMerge.appendChild(
  //           svgCanvas.addSvgElementFromJson({
  //             element: "feMergeNode",
  //             attr: {
  //               in: "coloredBlur",
  //             },
  //           })
  //         );

  //         feMerge.appendChild(
  //           svgCanvas.addSvgElementFromJson({
  //             element: "feMergeNode",
  //             attr: {
  //               in: "SourceGraphic",
  //             },
  //           })
  //         );

  //         return [
  //           svgCanvas.addSvgElementFromJson({
  //             element: "feGaussianBlur",
  //             attr: {
  //               in: "SourceAlpha",
  //               stdDeviation: "0",
  //               result: "blur",
  //             },
  //           }),
  //           svgCanvas.addSvgElementFromJson({
  //             element: "feOffset",
  //             attr: {
  //               in: "blur",
  //               dx: "0",
  //               dy: "5",
  //               result: "offsetBlur",
  //             },
  //           }),
  //           ...getColorEffectElement(paint, "_shadow"),
  //           svgCanvas.addSvgElementFromJson({
  //             element: "feComposite",
  //             attr: {
  //               in: "colorBlur",
  //               in2: "offsetBlur",
  //               operator: "in",
  //               result: "coloredBlur",
  //             },
  //           }),
  //           feMerge,
  //         ];
  //       },
  //       svgCanvas.setOffsets
  //     )
  //   );

  function changeRotationAngle(ctl) {
    const val = document.getElementById("angle").value;
    const indicator = document.getElementById("tool_angle_indicator");
    const reorient = document.getElementById("tool_reorient");
    const preventUndo = true;

    svgCanvas.setRotationAngle(val, preventUndo);
    indicator.style.transform = "rotate(" + val + "deg)";
    reorient.classList.toggle("disabled", val === 0);
  }

  function exportHandler(window, data) {
    var issues = data.issues;

    if (!$("#export_canvas").length) {
      $("<canvas>", { id: "export_canvas" }).hide().appendTo("body");
    }
    var c = $("#export_canvas")[0];

    c.width = svgCanvas.contentW;
    c.height = svgCanvas.contentH;
    canvg(c, data.svg, {
      renderCallback: function () {
        var datauri = c.toDataURL("image/png");
        if (!datauri) return false;
        var filename = "Method Draw Image";
        var type = "image/png";
        var file = svgedit.utilities.dataURItoBlob(datauri, type);
        if (window.navigator.msSaveOrOpenBlob)
          // IE10+
          window.navigator.msSaveOrOpenBlob(file, filename);
        else {
          // Others
          var a = document.createElement("a"),
            url = URL.createObjectURL(file);
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }, 0);
        }
      },
    });
  }

  function saveCanvas() {
    state.set("canvasContent", svgCanvas.getSvgString());
  }

  function toggleWireframe() {
    editor.menu.flash($("#view_menu"));
    $("#tool_wireframe").toggleClass("push_button_pressed");
    $("#method-draw").toggleClass("wireframe");
  }

  function groupSelected() {
    // group
    if (_self.selected.length > 1) {
      editor.menu.flash($("#object_menu"));
      svgCanvas.groupSelectedElements();
      saveCanvas();
    }
  }

  function ungroupSelected() {
    if (_self.selected.length === 1 && _self.selected[0].tagName === "g") {
      editor.menu.flash($("#object_menu"));
      svgCanvas.ungroupSelectedElement();
      saveCanvas();
    }
  }

  function about() {
    editor.modal.about.open();
  }

  function configure() {
    //const props = dao.filter
    editor.modal.configure.open();
  }

  function shortcuts() {
    editor.modal.shortcuts.open();
  }

  function source() {
    const textarea = editor.modal.source.el.querySelector("textarea");
    textarea.value = svgCanvas.getSvgString();
    editor.modal.source.open();
  }

  function loadFromUrl(url, cb) {
    if (!cb)
      cb = function () {
        /*noop*/
      };
    $.ajax({
      url: url,
      dataType: "text",
      cache: false,
      success: function (str) {
        editor.import.loadSvgString(str, cb);
      },
      error: function (xhr, stat, err) {
        if (xhr.status != 404 && xhr.responseText) {
          editor.import.loadSvgString(xhr.responseText, cb);
        } else {
          $.alert("Unable to load from URL" + ": \n" + err + "", cb);
        }
      },
    });
  }

  this.el = el;
  this.selectedChanged = selectedChanged;
  this.elementChanged = elementChanged;
  this.changeAttribute = changeAttribute;
  this.contextChanged = contextChanged;
  this.elementTransition = elementTransition;
  this.switchPaint = switchPaint;
  this.focusPaint = focusPaint;
  this.save = save;
  this.undo = undo;
  this.redo = redo;
  this.clear = clear;
  this.duplicateSelected = duplicateSelected;
  this.deleteSelected = deleteSelected;
  this.cutSelected = cutSelected;
  this.copySelected = copySelected;
  this.pasteSelected = pasteSelected;
  this.moveToTopSelected = moveToTopSelected;
  this.moveUpSelected = moveUpSelected;
  this.moveToBottomSelected = moveToBottomSelected;
  this.moveDownSelected = moveDownSelected;
  this.moveSelected = moveSelected;
  this.convertToPath = convertToPath;
  this.reorientPath = reorientPath;
  this.escapeMode = escapeMode;
  this.extensionAdded = extensionAdded;
  this.changeBlur = changeBlur;
  this.changeGrayscale = changeGrayscale;
  this.changeSaturation = changeSaturation;
  this.changeWaveDistortionStrength = changeWaveDistortionStrength;
  this.changeWaveDistortionFrequency = changeWaveDistortionFrequency;
  this.changeCrackedGlassFrequency = changeCrackedGlassFrequency;
  this.changeCrackedGlassDetail = changeCrackedGlassDetail;
  this.changeCrackedGlassStrength = changeCrackedGlassStrength;
  this.changeShadowX = changeShadowX;
  this.changeShadowY = changeShadowY;
  this.changeShadowStrength = changeShadowStrength;
  this.changeShadowColor = changeShadowColor;
  this.changeOverlayColor = changeOverlayColor;
  this.changeNeonColor = changeNeonColor;
  this.changeRotationAngle = changeRotationAngle;
  this.exportHandler = exportHandler;
  this.toggleWireframe = toggleWireframe;
  this.groupSelected = groupSelected;
  this.ungroupSelected = ungroupSelected;
  this.about = about;
  this.configure = configure;
  this.shortcuts = shortcuts;
  this.source = source;
  this.saveCanvas = saveCanvas;
  this.loadFromUrl = loadFromUrl;

  this.export = function () {
    if (window.canvg) {
      svgCanvas.rasterExport();
    } else {
      $.getScript("js/lib/rgbcolor.js", function () {
        $.getScript("js/lib/canvg.js", function () {
          svgCanvas.rasterExport();
        });
      });
    }
  };
};
