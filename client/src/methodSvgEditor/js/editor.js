const MD = {};

MD.Editor = function () {
  const el = document.getElementById("method-draw");
  const serializer = new XMLSerializer();
  const _self = this;
  const workarea = document.getElementById("workarea");
  _self.selected = [];

  function togglePanelActive() {
    var objectsPanelButton = $("#objects_panel_button");
    var editingPanelButton = $("#editing_panel_button");
    var objectsPanels = $("#objects_panels");
    var editingPanels = $(".editing_panels");

    if (objectsPanelButton.hasClass("active")) {
      objectsPanelButton.removeClass("active");
      objectsPanels.removeClass("active");
      editingPanelButton.addClass("active");
      editingPanels.addClass("active");
    } else {
      editingPanelButton.removeClass("active");
      editingPanels.removeClass("active");
      objectsPanelButton.addClass("active");
      objectsPanels.addClass("active");
    }

    editor.panel.updateContextPanel();
  }

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
    console.log(context);
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
      [{ val: val, tagName: "feDisplacementMap", attr: "scale" }],
      true,
      "_wave_distortion",
      0,
      getWaveDistortionStrengthFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getWaveDistortionStrengthFilterItems,
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
      [{ val: val, tagName: "feTurbulence", attr: "baseFrequency" }],
      true,
      "_wave_distortion",
      0,
      getWaveDistortionFrequencyFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getWaveDistortionFrequencyFilterItems,
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
      [{ val: val, tagName: "feTurbulence", attr: "baseFrequency" }],
      true,
      "_cracked_glass",
      0,
      getCrackedGlassFrequencyFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getCrackedGlassFrequencyFilterItems,
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
      [{ val: val, tagName: "feTurbulence", attr: "numOctaves" }],
      true,
      "_cracked_glass",
      0,
      getCrackedGlassDetailFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, tagName, attr, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getCrackedGlassDetailFilterItems,
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
      [{ val: val, tagName: "feDisplacementMap", attr: "scale" }],
      true,
      "_cracked_glass",
      0,
      getCrackedGlassStrengthFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getCrackedGlassStrengthFilterItems,
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
      [{ val: val, tagName: "feOffset", attr: "dx" }],
      true,
      "_shadow",
      undefined,
      getShadowXFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getShadowXFilterItems,
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
      [{ val: val, tagName: "feOffset", attr: "dy" }],
      true,
      "_shadow",
      undefined,
      getShadowYFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getShadowYFilterItems,
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
      [{ val: val, tagName: "feGaussianBlur", attr: "stdDeviation" }],
      true,
      "_shadow",
      0,
      getShadowStrengthFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getShadowStrengthFilterItems,
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
        [{ val: val, tagName: "feFlood", attr: "flood-color" }],
        true,
        "_shadow",
        undefined,
        getShadowColorFilterItems,
        svgCanvas.setOffsets,
        (changes, extension, deleteValue) =>
          svgCanvas.setEffectNoUndo(
            changes,
            extension,
            deleteValue,
            (changes) =>
              svgCanvas.setEffect(
                changes,
                false,
                extension,
                deleteValue,
                getShadowColorFilterItems,
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
        [{ val: val, tagName: "feFlood", attr: "flood-color" }],
        true,
        "_overlay",
        undefined,
        getOverlayColorFilterItems,
        svgCanvas.setOffsets,
        (changes, extension, deleteValue) =>
          svgCanvas.setEffectNoUndo(
            changes,
            extension,
            deleteValue,
            (changes) =>
              svgCanvas.setEffect(
                changes,
                false,
                extension,
                deleteValue,
                getOverlayColorFilterItems,
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
        [{ val: val, tagName: "feFlood", attr: "flood-color" }],
        true,
        "_neon",
        undefined,
        getNeonColorFilterItems,
        svgCanvas.setOffsets,
        (changes, extension, deleteValue) =>
          svgCanvas.setEffectNoUndo(
            changes,
            extension,
            deleteValue,
            (changes) =>
              svgCanvas.setEffect(
                changes,
                false,
                extension,
                deleteValue,
                getNeonColorFilterItems,
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
      [{ val: val, tagName: "feColorMatrix", attr: "values" }],
      true,
      "_hue",
      0,
      getHueShiftFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getHueShiftFilterItems,
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
      [{ val: val, tagName: "feFuncR", attr: "tableValues" }],
      true,
      "_color_highlight",
      0,
      getColorHighlightFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getColorHighlightFilterItems,
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
      [{ val: val, tagName: "feFuncG", attr: "tableValues" }],
      true,
      "_color_highlight",
      0,
      getColorHighlightGFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getColorHighlightGFilterItems,
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
      [{ val: val, tagName: "feFuncB", attr: "tableValues" }],
      true,
      "_color_highlight",
      0,
      getColorHighlightBFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getColorHighlightBFilterItems,
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
      [{ val: val, tagName: "feGaussianBlur", attr: "stdDeviation" }],
      true,
      "_gooey",
      0,
      getGooeyStrengthFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getGooeyStrengthFilterItems,
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
      [{ val: val, tagName: "feGaussianBlur", attr: "stdDeviation" }],
      true,
      "_cyberpunk",
      0,
      getCyberpunkStrengthFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getCyberpunkStrengthFilterItems,
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
          dur: val,
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
          dur: val,
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
      [{ val: val + "s", tagName: "animate", attr: "dur" }],
      true,
      "_cyberpunk",
      0,
      getCyberpunkSpeedFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getCyberpunkSpeedFilterItems,
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
          id: "fireStrengthAnimate_fire",
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
      [
        { val: val, tagName: "feGaussianBlur", attr: "stdDeviation" },
        {
          val: `${val};${val + 3};${val}`,
          tagName: "animate",
          attr: "values",
          id: "fireStrengthAnimate_fire",
        },
      ],
      true,
      "_fire",
      0,
      getFireStrengthFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getFireStrengthFilterItems,
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
        stdDeviation: "0",
        in: "SourceAlpha",
      },
    });

    feGaussianBlur.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "fireStrengthAnimate_fire",
          attributeName: "stdDeviation",
          values: "0;0;0",
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
      [{ val: val + "s", tagName: "animate", attr: "dur" }],
      true,
      "_fire",
      0,
      getFireSpeedFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getFireSpeedFilterItems,
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
        id: "blueOffset_glitch",
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
          id: "blueOffsetAnimateDx_glitch",
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
          id: "blueOffsetAnimateDy_glitch",
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
        id: "redOffset_glitch",
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
          id: "redOffsetAnimateDx_glitch",
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
          id: "redOffsetAnimateDy_glitch",
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
        id: "blueBlur_glitch",
        result: "blurredBlue",
        stdDeviation: val,
        in: "offsetBlue",
      },
    });

    feGaussianBlurBlue.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "blueBlurAnimate_glitch",
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
        id: "redBlur_glitch",
        result: "blurredRed",
        stdDeviation: val,
        in: "offsetRed",
      },
    });

    feGaussianBlurRed.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "redBlurAnimate_glitch",
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
      [
        {
          val: val,
          tagName: "feGaussianBlur",
          attr: "stdDeviation",
          id: "redBlur_glitch",
        },
        {
          val: val,
          tagName: "feGaussianBlur",
          attr: "stdDeviation",
          id: "blueBlur_glitch",
        },
        {
          val: `${val};0;0;0`,
          tagName: "animate",
          attr: "values",
          id: "redBlurAnimate_glitch",
        },
        {
          val: `${val};0;0;0`,
          tagName: "animate",
          attr: "values",
          id: "blueBlurAnimate_glitch",
        },
      ],
      true,
      "_glitch",
      0,
      getGlitchStrengthFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getGlitchStrengthFilterItems,
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
        id: "blueOffset_glitch",
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
          id: "blueOffsetAnimateDx_glitch",
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
          id: "blueOffsetAnimateDy_glitch",
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
        id: "redOffset_glitch",
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
          id: "redOffsetAnimateDx_glitch",
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
          id: "redOffsetAnimateDy_glitch",
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
        id: "blueBlur_glitch",
        result: "blurredBlue",
        stdDeviation: "0",
        in: "offsetBlue",
      },
    });

    feGaussianBlurBlue.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "blueBlurAnimate_glitch",
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
        id: "redBlur_glitch",
        result: "blurredRed",
        stdDeviation: "0",
        in: "offsetRed",
      },
    });

    feGaussianBlurRed.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "redBlurAnimate_glitch",
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
      [
        {
          val: val * 0.5,
          tagName: "feOffset",
          attr: "dy",
          id: "blueOffset_glitch",
        },
        {
          val: val * 5,
          tagName: "feOffset",
          attr: "dx",
          id: "blueOffset_glitch",
        },
        {
          val: `${val * 5}; 0; 0`,
          tagName: "animate",
          attr: "values",
          id: "blueOffsetAnimateDx_glitch",
        },
        {
          val: `${val * 0.5}; 0; 0`,
          tagName: "animate",
          attr: "values",
          id: "blueOffsetAnimateDy_glitch",
        },
        {
          val: val * -3,
          tagName: "feOffset",
          attr: "dy",
          id: "redOffset_glitch",
        },
        {
          val: val * -4,
          tagName: "feOffset",
          attr: "dx",
          id: "redOffset_glitch",
        },
        {
          val: `${val * -4}; 0; 0`,
          tagName: "animate",
          attr: "values",
          id: "redOffsetAnimateDx_glitch",
        },
        {
          val: `${val * -3}; 0; 0`,
          tagName: "animate",
          attr: "values",
          id: "redOffsetAnimateDy_glitch",
        },
      ],
      true,
      "_glitch",
      0,
      getGlitchOffsetFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getGlitchOffsetFilterItems,
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
          dur: val,
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
          dur: val,
          attributeName: "values",
        },
      })
    );

    const feOffsetBlue = svgCanvas.addSvgElementFromJson({
      element: "feOffset",
      attr: {
        id: "blueOffset_glitch",
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
          id: "blueOffsetAnimateDx_glitch",
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0; 0.25; 1",
          values: "5; 0; 0",
          repeatCount: "indefinite",
          dur: val,
          attributeName: "dx",
        },
      })
    );

    feOffsetBlue.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "blueOffsetAnimateDy_glitch",
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0; 0.25; 1",
          values: "0.5; 0; 0",
          repeatCount: "indefinite",
          dur: val,
          attributeName: "dy",
        },
      })
    );

    const feOffsetRed = svgCanvas.addSvgElementFromJson({
      element: "feOffset",
      attr: {
        id: "redOffset_glitch",
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
          id: "redOffsetAnimateDx_glitch",
          begin: "0.03s",
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0; 0.25; 1",
          values: "-4; 0; 0",
          repeatCount: "indefinite",
          dur: val,
          attributeName: "dx",
        },
      })
    );

    feOffsetRed.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "redOffsetAnimateDy_glitch",
          begin: "0.03s",
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0; 0.25; 1",
          values: "-3; 0; 0",
          repeatCount: "indefinite",
          dur: val,
          attributeName: "dy",
        },
      })
    );

    const feGaussianBlurBlue = svgCanvas.addSvgElementFromJson({
      element: "feGaussianBlur",
      attr: {
        id: "blueBlur_glitch",
        result: "blurredBlue",
        stdDeviation: "0",
        in: "offsetBlue",
      },
    });

    feGaussianBlurBlue.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "blueBlurAnimate_glitch",
          keySplines: ".42,0,.58,1; .42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          attributeName: "stdDeviation",
          dur: val,
          repeatCount: "indefinite",
          values: "0; 0; 0; 0",
          keyTimes: "0; 0.25; 0.75; 1",
        },
      })
    );

    const feGaussianBlurRed = svgCanvas.addSvgElementFromJson({
      element: "feGaussianBlur",
      attr: {
        id: "redBlur_glitch",
        result: "blurredRed",
        stdDeviation: "0",
        in: "offsetRed",
      },
    });

    feGaussianBlurRed.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "redBlurAnimate_glitch",
          keySplines: ".42,0,.58,1; .42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          attributeName: "stdDeviation",
          dur: val,
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
      [{ val: val + "s", tagName: "animate", attr: "dur" }],
      true,
      "_glitch",
      0,
      getGlitchSpeedFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getGlitchSpeedFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getElectricityStrengthFilterItems = (val) => {
    const feFlood = svgCanvas.addSvgElementFromJson({
      element: "feFlood",
      attr: {
        result: "neonColor",
        "flood-opacity": "1",
        "flood-color": "#ffcc00",
      },
    });

    feFlood.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          attributeName: "flood-opacity",
          values: "1;0.2;1;0.5;1",
          dur: "0.3s",
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
      svgCanvas.addSvgElementFromJson({
        element: "feGaussianBlur",
        attr: {
          result: "blurred",
          stdDeviation: val,
          in: "SourceAlpha",
        },
      }),
      feFlood,
      svgCanvas.addSvgElementFromJson({
        element: "feComposite",
        attr: {
          result: "glow",
          operator: "in",
          in2: "blurred",
          in: "neonColor",
        },
      }),
      feMerge,
    ];
  };

  function changeElectricityStrength() {
    const val = parseFloat($("#electricity_strength").val());

    svgCanvas.setEffect(
      [{ val: val, tagName: "feGaussianBlur", attr: "stdDeviation" }],
      true,
      "_electricity",
      0,
      getElectricityStrengthFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getElectricityStrengthFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getElectricitySpeedFilterItems = (val) => {
    const feFlood = svgCanvas.addSvgElementFromJson({
      element: "feFlood",
      attr: {
        result: "neonColor",
        "flood-opacity": "1",
        "flood-color": "#ffcc00",
      },
    });

    feFlood.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          attributeName: "flood-opacity",
          values: "1;0.2;1;0.5;1",
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
      svgCanvas.addSvgElementFromJson({
        element: "feGaussianBlur",
        attr: {
          result: "blurred",
          stdDeviation: "0",
          in: "SourceAlpha",
        },
      }),
      feFlood,
      svgCanvas.addSvgElementFromJson({
        element: "feComposite",
        attr: {
          result: "glow",
          operator: "in",
          in2: "blurred",
          in: "neonColor",
        },
      }),
      feMerge,
    ];
  };

  function changeElectricitySpeed() {
    const val = parseFloat($("#electricity_speed").val());

    svgCanvas.setEffect(
      [{ val: val + "s", tagName: "animate", attr: "dur" }],
      true,
      "_electricity",
      0,
      getElectricitySpeedFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getElectricitySpeedFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getWavyStrengthFilterItems = (val) => {
    const feTurbulence = svgCanvas.addSvgElementFromJson({
      element: "feTurbulence",
      attr: {
        type: "fractalNoise",
        baseFrequency: "0",
        numOctaves: "0",
        result: "noise",
      },
    });

    feTurbulence.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "wavyFrequencyAnimate_wavy",
          attributeName: "baseFrequency",
          values: "0;0;0",
          dur: "1s",
          repeatCount: "indefinite",
        },
      })
    );

    feTurbulence.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "wavyDetailAnimate_wavy",
          attributeName: "numOctaves",
          values: "0;0;0",
          dur: "1s",
          repeatCount: "indefinite",
        },
      })
    );

    const feDisplacementMap = svgCanvas.addSvgElementFromJson({
      element: "feDisplacementMap",
      attr: {
        in: "SourceGraphic",
        in2: "noise",
        scale: val,
      },
    });

    feDisplacementMap.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "wavyStrengthAnimate_wavy",
          attributeName: "scale",
          values: `${val};${val + 20};${val}`,
          dur: "1s",
          repeatCount: "indefinite",
        },
      })
    );

    return [feTurbulence, feDisplacementMap];
  };

  function changeWavyStrength() {
    const val = parseFloat($("#wavy_strength").val());

    svgCanvas.setEffect(
      [
        { val: val, tagName: "feDisplacementMap", attr: "scale" },
        {
          val: `${val};${val + 20};${val}`,
          tagName: "animate",
          attr: "values",
          id: "wavyStrengthAnimate_wavy",
        },
      ],
      true,
      "_wavy",
      0,
      getWavyStrengthFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getWavyStrengthFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getWavyFrequencyFilterItems = (val) => {
    const feTurbulence = svgCanvas.addSvgElementFromJson({
      element: "feTurbulence",
      attr: {
        type: "fractalNoise",
        baseFrequency: val,
        numOctaves: "0",
        result: "noise",
      },
    });

    feTurbulence.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "wavyFrequencyAnimate_wavy",
          attributeName: "baseFrequency",
          values: `${val};${val + 0.03};${val}`,
          dur: "1s",
          repeatCount: "indefinite",
        },
      })
    );

    feTurbulence.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "wavyDetailAnimate_wavy",
          attributeName: "numOctaves",
          values: "0;0;0",
          dur: "1s",
          repeatCount: "indefinite",
        },
      })
    );

    const feDisplacementMap = svgCanvas.addSvgElementFromJson({
      element: "feDisplacementMap",
      attr: {
        in: "SourceGraphic",
        in2: "noise",
        scale: "0",
      },
    });

    feDisplacementMap.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "wavyStrengthAnimate_wavy",
          attributeName: "scale",
          values: "0;0;0",
          dur: "1s",
          repeatCount: "indefinite",
        },
      })
    );

    return [feTurbulence, feDisplacementMap];
  };

  function changeWavyFrequency() {
    const val = parseFloat($("#wavy_frequency").val());

    svgCanvas.setEffect(
      [
        { val: val, tagName: "feTurbulence", attr: "baseFrequency" },
        {
          val: `${val};${val + 0.03};${val}`,
          tagName: "animate",
          attr: "values",
          id: "wavyFrequencyAnimate_wavy",
        },
      ],
      true,
      "_wavy",
      0,
      getWavyFrequencyFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getWavyFrequencyFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getWavyDetailFilterItems = (val) => {
    const feTurbulence = svgCanvas.addSvgElementFromJson({
      element: "feTurbulence",
      attr: {
        type: "fractalNoise",
        baseFrequency: "0",
        numOctaves: val,
        result: "noise",
      },
    });

    feTurbulence.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "wavyFrequencyAnimate_wavy",
          attributeName: "baseFrequency",
          values: "0;0;0",
          dur: "1s",
          repeatCount: "indefinite",
        },
      })
    );

    feTurbulence.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "wavyDetailAnimate_wavy",
          attributeName: "numOctaves",
          values: `${val};${val + 1};${val}`,
          dur: "1s",
          repeatCount: "indefinite",
        },
      })
    );

    const feDisplacementMap = svgCanvas.addSvgElementFromJson({
      element: "feDisplacementMap",
      attr: {
        in: "SourceGraphic",
        in2: "noise",
        scale: "0",
      },
    });

    feDisplacementMap.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "wavyStrengthAnimate_wavy",
          attributeName: "scale",
          values: "0;0;0",
          dur: "1s",
          repeatCount: "indefinite",
        },
      })
    );

    return [feTurbulence, feDisplacementMap];
  };

  function changeWavyDetail() {
    const val = parseFloat($("#wavy_detail").val());

    svgCanvas.setEffect(
      [
        { val: val, tagName: "feTurbulence", attr: "numOctaves" },
        {
          val: `${val};${val + 1};${val}`,
          tagName: "animate",
          attr: "values",
          id: "wavyDetailAnimate_wavy",
        },
      ],
      true,
      "_wavy",
      0,
      getWavyDetailFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getWavyDetailFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getWavySpeedFilterItems = (val) => {
    const feTurbulence = svgCanvas.addSvgElementFromJson({
      element: "feTurbulence",
      attr: {
        type: "fractalNoise",
        baseFrequency: "0",
        numOctaves: "0",
        result: "noise",
      },
    });

    feTurbulence.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "wavyFrequencyAnimate_wavy",
          attributeName: "baseFrequency",
          values: "0;0;0",
          dur: val,
          repeatCount: "indefinite",
        },
      })
    );

    feTurbulence.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "wavyDetailAnimate_wavy",
          attributeName: "numOctaves",
          values: "0;0;0",
          dur: val,
          repeatCount: "indefinite",
        },
      })
    );

    const feDisplacementMap = svgCanvas.addSvgElementFromJson({
      element: "feDisplacementMap",
      attr: {
        in: "SourceGraphic",
        in2: "noise",
        scale: "0",
      },
    });

    feDisplacementMap.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "wavyStrengthAnimate_wavy",
          attributeName: "scale",
          values: "0;0;0",
          dur: val,
          repeatCount: "indefinite",
        },
      })
    );

    return [feTurbulence, feDisplacementMap];
  };

  function changeWavySpeed() {
    const val = parseFloat($("#wavy_speed").val());

    svgCanvas.setEffect(
      [
        {
          val: val + "s",
          tagName: "animate",
          attr: "dur",
        },
      ],
      true,
      "_wavy",
      0,
      getWavySpeedFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getWavySpeedFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getSignalCorruptStrengthFilterItems = (val) => {
    const feDisplacementMap = svgCanvas.addSvgElementFromJson({
      element: "feDisplacementMap",
      attr: {
        in: "SourceGraphic",
        in2: "noise",
        scale: val,
        xChannelSelector: "R",
        yChannelSelector: "G",
      },
    });

    feDisplacementMap.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          attributeName: "scale",
          values: `${val / 3};${val};${val / 3}`,
          dur: "0.2s",
          repeatCount: "indefinite",
        },
      })
    );

    return [
      svgCanvas.addSvgElementFromJson({
        element: "feTurbulence",
        attr: {
          type: "fractalNoise",
          baseFrequency: "0.2 0.01",
          numOctaves: "3",
          result: "noise",
        },
      }),
      feDisplacementMap,
    ];
  };

  function changeSignalCorruptStrength() {
    const val = parseFloat($("#signal_corrupt_strength").val());

    svgCanvas.setEffect(
      [
        { val: val, tagName: "feDisplacementMap", attr: "scale" },
        {
          val: `${val / 3};${val};${val / 3}`,
          tagName: "animate",
          attr: "values",
        },
      ],
      true,
      "_signal_corrupt",
      0,
      getSignalCorruptStrengthFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getSignalCorruptStrengthFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getSignalCorruptSpeedFilterItems = (val) => {
    const feDisplacementMap = svgCanvas.addSvgElementFromJson({
      element: "feDisplacementMap",
      attr: {
        in: "SourceGraphic",
        in2: "noise",
        scale: "0",
        xChannelSelector: "R",
        yChannelSelector: "G",
      },
    });

    feDisplacementMap.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          attributeName: "scale",
          values: "0;0;0",
          dur: val,
          repeatCount: "indefinite",
        },
      })
    );

    return [
      svgCanvas.addSvgElementFromJson({
        element: "feTurbulence",
        attr: {
          type: "fractalNoise",
          baseFrequency: "0.2 0.01",
          numOctaves: "3",
          result: "noise",
        },
      }),
      feDisplacementMap,
    ];
  };

  function changeSignalCorruptSpeed() {
    const val = parseFloat($("#signal_corrupt_speed").val());

    svgCanvas.setEffect(
      [{ val: val + "s", tagName: "animate", attr: "dur" }],
      true,
      "_signal_corrupt",
      0,
      getSignalCorruptSpeedFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getSignalCorruptSpeedFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getHeartBeatStrengthFilterItems = (val) => {
    const feMorphology = svgCanvas.addSvgElementFromJson({
      element: "feMorphology",
      attr: {
        result: "expanded",
        in: "SourceGraphic",
        radius: "0",
        operator: "dilate",
      },
    });

    feMorphology.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          repeatCount: "indefinite",
          dur: "0.8s",
          values: `0;${val};0`,
          attributeName: "radius",
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
          in: "expanded",
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

    return [feMorphology, feMerge];
  };

  function changeHeartBeatStrength() {
    const val = parseFloat($("#heart_beat_strength").val());

    svgCanvas.setEffect(
      [{ val: `0;${val};0`, tagName: "animate", attr: "values" }],
      true,
      "_heart_beat",
      0,
      getHeartBeatStrengthFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getHeartBeatStrengthFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getHeartBeatSpeedFilterItems = (val) => {
    const feMorphology = svgCanvas.addSvgElementFromJson({
      element: "feMorphology",
      attr: {
        result: "expanded",
        in: "SourceGraphic",
        radius: "0",
        operator: "dilate",
      },
    });

    feMorphology.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          repeatCount: "indefinite",
          dur: val,
          values: "0;0;0",
          attributeName: "radius",
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
          in: "expanded",
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

    return [feMorphology, feMerge];
  };

  function changeHeartBeatSpeed() {
    const val = parseFloat($("#heart_beat_speed").val());

    svgCanvas.setEffect(
      [{ val: val + "s", tagName: "animate", attr: "dur" }],
      true,
      "_heart_beat",
      0,
      getHeartBeatSpeedFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getHeartBeatSpeedFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getFragmentStrengthFilterItems = (val) => {
    const smallVal = Math.round(val / 3);
    const feMorphology = svgCanvas.addSvgElementFromJson({
      element: "feMorphology",
      attr: {
        operator: "erode",
        radius: smallVal,
        in: "SourceGraphic",
        result: "fragment",
      },
    });

    feMorphology.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "fragmentStrengthAnimate_fragment",
          attributeName: "radius",
          values: `${smallVal};${val};${smallVal}`,
          dur: "0.2s",
          repeatCount: "indefinite",
        },
      })
    );

    const feTurbulence = svgCanvas.addSvgElementFromJson({
      element: "feTurbulence",
      attr: {
        type: "fractalNoise",
        baseFrequency: "0.1 0.5",
        numOctaves: "2",
        result: "turbulence",
      },
    });

    feMorphology.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          attributeName: "baseFrequency",
          values: "0.1 0.5; 0.2 0.7; 0.1 0.5",
          dur: "0.3s",
          repeatCount: "indefinite",
        },
      })
    );

    return [
      feMorphology,
      feTurbulence,
      svgCanvas.addSvgElementFromJson({
        element: "feDisplacementMap",
        attr: {
          in: "fragment",
          in2: "turbulence",
          scale: val * 2,
        },
      }),
    ];
  };

  function changeFragmentStrength() {
    const val = parseFloat($("#fragment_strength").val());
    const smallVal = Math.round(val / 3);

    svgCanvas.setEffect(
      [
        { val: smallVal, tagName: "feMorphology", attr: "radius" },
        { val: val * 2, tagName: "feDisplacementMap", attr: "scale" },
        {
          val: `${smallVal};${val};${smallVal}`,
          tagName: "animate",
          attr: "values",
          id: "fragmentStrengthAnimate_fragment",
        },
      ],
      true,
      "_fragment",
      0,
      getFragmentStrengthFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getFragmentStrengthFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getFragmentSpeedFilterItems = (val) => {
    const feMorphology = svgCanvas.addSvgElementFromJson({
      element: "feMorphology",
      attr: {
        operator: "erode",
        radius: "0",
        in: "SourceGraphic",
        result: "fragment",
      },
    });

    feMorphology.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "fragmentStrengthAnimate_fragment",
          attributeName: "radius",
          values: "0;0;0",
          dur: val,
          repeatCount: "indefinite",
        },
      })
    );

    const feTurbulence = svgCanvas.addSvgElementFromJson({
      element: "feTurbulence",
      attr: {
        type: "fractalNoise",
        baseFrequency: "0.1 0.5",
        numOctaves: "2",
        result: "turbulence",
      },
    });

    feMorphology.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          attributeName: "baseFrequency",
          values: "0.1 0.5; 0.2 0.7; 0.1 0.5",
          dur: val,
          repeatCount: "indefinite",
        },
      })
    );

    return [
      feMorphology,
      feTurbulence,
      svgCanvas.addSvgElementFromJson({
        element: "feDisplacementMap",
        attr: {
          in: "fragment",
          in2: "turbulence",
          scale: "0",
        },
      }),
    ];
  };

  function changeFragmentSpeed() {
    const val = parseFloat($("#fragment_speed").val());

    svgCanvas.setEffect(
      [{ val: val + "s", tagName: "animate", attr: "dur" }],
      true,
      "_fragment",
      0,
      getFragmentSpeedFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getFragmentSpeedFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getSparksStrengthFilterItems = (val) => {
    const smallVal = Math.round(val / 3);

    const feDisplacementMap = svgCanvas.addSvgElementFromJson({
      element: "feDisplacementMap",
      attr: {
        in: "SourceGraphic",
        in2: "static",
        scale: smallVal,
        result: "distorted",
      },
    });

    feDisplacementMap.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "sparksStrengthAnimate_sparks",
          attributeName: "scale",
          values: `${smallVal};${val};${smallVal}`,
          dur: "0s",
          repeatCount: "indefinite",
        },
      })
    );

    const feColorMatrix = svgCanvas.addSvgElementFromJson({
      element: "feColorMatrix",
      attr: {
        type: "matrix",
        in: "distorted",
        result: "colorShift",
        values: "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0",
      },
    });

    feColorMatrix.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          attributeName: "values",
          values:
            "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0; 1 0.2 0 0 0 0 1 0.2 0 0 0.2 0 1 0 0 0 0 0 1 0; 1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0",
          dur: "0.2s",
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
          in: "colorShift",
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
        element: "feTurbulence",
        attr: {
          type: "fractalNoise",
          baseFrequency: "0.1 0.3",
          numOctaves: "2",
          seed: "2",
          result: "static",
        },
      }),
      feDisplacementMap,
      feColorMatrix,
      feMerge,
    ];
  };

  function changeSparksStrength() {
    const val = parseFloat($("#sparks_strength").val());
    const smallVal = Math.round(val / 3);

    svgCanvas.setEffect(
      [
        { val: smallVal, tagName: "feDisplacementMap", attr: "scale" },
        {
          val: `${smallVal};${val};${smallVal}`,
          tagName: "animate",
          attr: "values",
          id: "sparksStrengthAnimate_sparks",
        },
      ],
      true,
      "_sparks",
      0,
      getSparksStrengthFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getSparksStrengthFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getSparksSpeedFilterItems = (val) => {
    const feDisplacementMap = svgCanvas.addSvgElementFromJson({
      element: "feDisplacementMap",
      attr: {
        in: "SourceGraphic",
        in2: "static",
        scale: "0",
        result: "distorted",
      },
    });

    feDisplacementMap.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "sparksStrengthAnimate_sparks",
          attributeName: "scale",
          values: "0;0;0",
          dur: val,
          repeatCount: "indefinite",
        },
      })
    );

    const feColorMatrix = svgCanvas.addSvgElementFromJson({
      element: "feColorMatrix",
      attr: {
        type: "matrix",
        in: "distorted",
        result: "colorShift",
        values: "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0",
      },
    });

    feColorMatrix.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          attributeName: "values",
          values:
            "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0; 1 0.2 0 0 0 0 1 0.2 0 0 0.2 0 1 0 0 0 0 0 1 0; 1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0",
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
          in: "colorShift",
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
        element: "feTurbulence",
        attr: {
          type: "fractalNoise",
          baseFrequency: "0.1 0.3",
          numOctaves: "2",
          seed: "2",
          result: "static",
        },
      }),
      feDisplacementMap,
      feColorMatrix,
      feMerge,
    ];
  };

  function changeSparksSpeed() {
    const val = parseFloat($("#sparks_speed").val());

    svgCanvas.setEffect(
      [{ val: val + "s", tagName: "animate", attr: "dur" }],
      true,
      "_sparks",
      0,
      getSparksSpeedFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getSparksSpeedFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getDuoPulseStrengthFilterItems = (val) => {
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
          keySplines: ".42,0,.58,1;.25,1,.75,0;.42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0;0.25;1",
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
        id: "blueOffset_duo_pulse",
        dy: "0",
        dx: "0",
        result: "offsetBlue",
        in: "glitchMatrixBlue",
      },
    });

    feOffsetBlue.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "blueOffsetAnimateDx_duo_pulse",
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0;0.25;1",
          values: "5;0;0",
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
          id: "blueOffsetAnimateDy_duo_pulse",
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0;0.25;1",
          values: "0.5;0;0",
          repeatCount: "indefinite",
          dur: "1.5s",
          attributeName: "dy",
        },
      })
    );

    const feOffsetRed = svgCanvas.addSvgElementFromJson({
      element: "feOffset",
      attr: {
        id: "redOffset_duo_pulse",
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
          id: "redOffsetAnimateDx_duo_pulse",
          begin: "0.03s",
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0;0.25;1",
          values: "-4;0;0",
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
          id: "redOffsetAnimateDy_duo_pulse",
          begin: "0.03s",
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0;0.25;1",
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
          id: "duoPulseBlueStrengthAnimate_duo_pulse",
          keySplines: ".42,0,.58,1; .42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          attributeName: "stdDeviation",
          dur: "1.5s",
          repeatCount: "indefinite",
          values: `${val};0;0;0`,
          keyTimes: "0;0.25;0.75;1",
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
          id: "duoPulseRedStrengthAnimate_duo_pulse",
          keySplines: ".42,0,.58,1; .42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          attributeName: "stdDeviation",
          dur: "1.5s",
          repeatCount: "indefinite",
          values: `${val};0;0;0`,
          keyTimes: "0;0.25;0.75;1",
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

  function changeDuoPulseStrength() {
    const val = parseFloat($("#duo_pulse_strength").val());

    svgCanvas.setEffect(
      [
        {
          val: val,
          tagName: "feGaussianBlur",
          attr: "stdDeviation",
        },
        {
          val: `${val};0;0;0`,
          tagName: "animate",
          attr: "values",
          id: "duoPulseRedStrengthAnimate_duo_pulse",
        },
        {
          val: `${val};0;0;0`,
          tagName: "animate",
          attr: "values",
          id: "duoPulseBlueStrengthAnimate_duo_pulse",
        },
      ],
      true,
      "_duo_pulse",
      0,
      getDuoPulseStrengthFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getDuoPulseStrengthFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getDuoPulseOffsetFilterItems = (val) => {
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
          keySplines: ".42,0,.58,1;.25,1,.75,0;.42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0;0.25;1",
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
        id: "blueOffset_duo_pulse",
        dy: val * 1.5,
        dx: val * 5,
        result: "offsetBlue",
        in: "glitchMatrixBlue",
      },
    });

    feOffsetBlue.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "blueOffsetAnimateDx_duo_pulse",
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0;0.25;1",
          values: `${val * 5};0;0`,
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
          id: "blueOffsetAnimateDy_duo_pulse",
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0;0.25;1",
          values: `${val * 0.5};0;0`,
          repeatCount: "indefinite",
          dur: "1.5s",
          attributeName: "dy",
        },
      })
    );

    const feOffsetRed = svgCanvas.addSvgElementFromJson({
      element: "feOffset",
      attr: {
        id: "redOffset_duo_pulse",
        dy: val * -1.5,
        dx: val * -4,
        result: "offsetRed",
        in: "glitchMatrixRed",
      },
    });

    feOffsetRed.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "redOffsetAnimateDx_duo_pulse",
          begin: "0.03s",
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0;0.25;1",
          values: `${val * -4};0;0`,
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
          id: "redOffsetAnimateDy_duo_pulse",
          begin: "0.03s",
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0;0.25;1",
          values: `${val * -1.5}; 0; 0`,
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
          id: "duoPulseBlueStrengthAnimate_duo_pulse",
          keySplines: ".42,0,.58,1; .42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          attributeName: "stdDeviation",
          dur: "1.5s",
          repeatCount: "indefinite",
          values: "0;0;0;0",
          keyTimes: "0;0.25;0.75;1",
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
          id: "duoPulseRedStrengthAnimate_duo_pulse",
          keySplines: ".42,0,.58,1; .42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          attributeName: "stdDeviation",
          dur: "1.5s",
          repeatCount: "indefinite",
          values: "0;0;0;0",
          keyTimes: "0;0.25;0.75;1",
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

  function changeDuoPulseOffset() {
    const val = parseFloat($("#duo_pulse_offset").val());

    svgCanvas.setEffect(
      [
        {
          val: val * 1.5,
          tagName: "feOffset",
          attr: "dy",
          id: "blueOffset_duo_pulse",
        },
        {
          val: val * 5,
          tagName: "feOffset",
          attr: "dx",
          id: "blueOffset_duo_pulse",
        },
        {
          val: `${val * 5};0;0`,
          tagName: "animate",
          attr: "values",
          id: "blueOffsetAnimateDx_duo_pulse",
        },
        {
          val: `${val * 1.5};0;0`,
          tagName: "animate",
          attr: "values",
          id: "blueOffsetAnimateDy_duo_pulse",
        },
        {
          val: val * -1.5,
          tagName: "feOffset",
          attr: "dy",
          id: "redOffset_duo_pulse",
        },
        {
          val: val * -4,
          tagName: "feOffset",
          attr: "dx",
          id: "redOffset_duo_pulse",
        },
        {
          val: `${val * -4};0;0`,
          tagName: "animate",
          attr: "values",
          id: "redOffsetAnimateDx_duo_pulse",
        },
        {
          val: `${val * -1.5};0;0`,
          tagName: "animate",
          attr: "values",
          id: "redOffsetAnimateDy_duo_pulse",
        },
      ],
      true,
      "_duo_pulse",
      0,
      getDuoPulseOffsetFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getDuoPulseOffsetFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getDuoPulseSpeedFilterItems = (val) => {
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
          dur: val,
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
          keySplines: ".42,0,.58,1;.25,1,.75,0;.42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0;0.25;1",
          values:
            "1.5 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0; 3 0 0 0 -0.5 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0; 1.5 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0",
          repeatCount: "indefinite",
          dur: val,
          attributeName: "values",
        },
      })
    );

    const feOffsetBlue = svgCanvas.addSvgElementFromJson({
      element: "feOffset",
      attr: {
        id: "blueOffset_duo_pulse",
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
          id: "blueOffsetAnimateDx_duo_pulse",
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0;0.25;1",
          values: "5;0;0",
          repeatCount: "indefinite",
          dur: val,
          attributeName: "dx",
        },
      })
    );

    feOffsetBlue.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "blueOffsetAnimateDy_duo_pulse",
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0;0.25;1",
          values: "0.5;0;0",
          repeatCount: "indefinite",
          dur: val,
          attributeName: "dy",
        },
      })
    );

    const feOffsetRed = svgCanvas.addSvgElementFromJson({
      element: "feOffset",
      attr: {
        id: "redOffset_duo_pulse",
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
          id: "redOffsetAnimateDx_duo_pulse",
          begin: "0.03s",
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0;0.25;1",
          values: "-4;0;0",
          repeatCount: "indefinite",
          dur: val,
          attributeName: "dx",
        },
      })
    );

    feOffsetRed.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "redOffsetAnimateDx_duo_pulse",
          begin: "0.03s",
          keySplines: ".42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          keyTimes: "0;0.25;1",
          values: "-3; 0; 0",
          repeatCount: "indefinite",
          dur: val,
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
          id: "duoPulseBlueStrengthAnimate_duo_pulse",
          keySplines: ".42,0,.58,1; .42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          attributeName: "stdDeviation",
          dur: val,
          repeatCount: "indefinite",
          values: "0;0;0;0",
          keyTimes: "0;0.25;0.75;1",
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
          id: "duoPulseRedStrengthAnimate_duo_pulse",
          keySplines: ".42,0,.58,1; .42,0,.58,1; .42,0,.58,1",
          calcMode: "spline",
          attributeName: "stdDeviation",
          dur: val,
          repeatCount: "indefinite",
          values: "0;0;0;0",
          keyTimes: "0;0.25;0.75;1",
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

  function changeDuoPulseSpeed() {
    const val = parseFloat($("#duo_pulse_speed").val());

    svgCanvas.setEffect(
      [
        {
          val: val + "s",
          tagName: "animate",
          attr: "dur",
        },
      ],
      true,
      "_duo_pulse",
      0,
      getDuoPulseSpeedFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getDuoPulseSpeedFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getWiggleStrengthFilterItems = (val) => {
    const smallVal = Math.round((val * 2) / 3);
    const feTurbulence = svgCanvas.addSvgElementFromJson({
      element: "feTurbulence",
      attr: {
        type: "fractalNoise",
        baseFrequency: "0.05 0.1",
        numOctaves: "5",
        result: "warp",
      },
    });

    feTurbulence.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          attributeName: "baseFrequency",
          values: "0.05 0.1; 0.08 0.15; 0.05 0.1",
          dur: "2s",
          repeatCount: "indefinite",
        },
      })
    );

    const feDisplacementMap = svgCanvas.addSvgElementFromJson({
      element: "feDisplacementMap",
      attr: {
        in: "SourceGraphic",
        in2: "warp",
        scale: smallVal,
      },
    });

    feDisplacementMap.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "wiggleStrengthAnimate_wiggle",
          attributeName: "scale",
          values: `${smallVal};${val};${smallVal}`,
          dur: "2s",
          repeatCount: "indefinite",
        },
      })
    );

    const feColorMatrix = svgCanvas.addSvgElementFromJson({
      element: "feColorMatrix",
      attr: {
        type: "matrix",
        result: "colorShift",
        values: "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0",
      },
    });

    feColorMatrix.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          attributeName: "values",
          values:
            "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0; 1 0.2 0 0 0 0.2 1 0 0 0 0 0.2 1 0 0 0 0 0 1 0; 1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0",
          dur: "1.5s",
          repeatCount: "indefinite",
        },
      })
    );

    return [feTurbulence, feDisplacementMap, feColorMatrix];
  };

  function changeWiggleStrength() {
    const val = parseFloat($("#wiggle_strength").val());
    const smallVal = Math.round((val * 2) / 3);

    svgCanvas.setEffect(
      [
        { val: smallVal, tagName: "feDisplacementMap", attr: "scale" },
        {
          val: `${smallVal};${val};${smallVal}`,
          tagName: "animate",
          attr: "values",
          id: "wiggleStrengthAnimate_wiggle",
        },
      ],
      true,
      "_wiggle",
      0,
      getWiggleStrengthFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getWiggleStrengthFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getWiggleSpeedFilterItems = (val) => {
    const feTurbulence = svgCanvas.addSvgElementFromJson({
      element: "feTurbulence",
      attr: {
        type: "fractalNoise",
        baseFrequency: "0.05 0.1",
        numOctaves: "5",
        result: "warp",
      },
    });

    feTurbulence.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          attributeName: "baseFrequency",
          values: "0.05 0.1; 0.08 0.15; 0.05 0.1",
          dur: val,
          repeatCount: "indefinite",
        },
      })
    );

    const feDisplacementMap = svgCanvas.addSvgElementFromJson({
      element: "feDisplacementMap",
      attr: {
        in: "SourceGraphic",
        in2: "warp",
        scale: "0",
      },
    });

    feDisplacementMap.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "wiggleStrengthAnimate_wiggle",
          attributeName: "scale",
          values: "0;0;0",
          dur: val,
          repeatCount: "indefinite",
        },
      })
    );

    const feColorMatrix = svgCanvas.addSvgElementFromJson({
      element: "feColorMatrix",
      attr: {
        type: "matrix",
        result: "colorShift",
        values: "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0",
      },
    });

    feColorMatrix.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          attributeName: "values",
          values:
            "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0; 1 0.2 0 0 0 0.2 1 0 0 0 0 0.2 1 0 0 0 0 0 1 0; 1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0",
          dur: val,
          repeatCount: "indefinite",
        },
      })
    );

    return [feTurbulence, feDisplacementMap, feColorMatrix];
  };

  function changeWiggleSpeed() {
    const val = parseFloat($("#wiggle_speed").val());

    svgCanvas.setEffect(
      [
        {
          val: val,
          tagName: "animate",
          attr: "dur",
        },
      ],
      true,
      "_wiggle",
      0,
      getWiggleSpeedFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getWiggleSpeedFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getChaosMachineStrengthFilterItems = (val) => {
    const smallVal = Math.round(val / 2);

    const feTurbulence = svgCanvas.addSvgElementFromJson({
      element: "feTurbulence",
      attr: {
        result: "noise",
        numOctaves: "4",
        baseFrequency: "0.03 0.07",
        type: "turbulence",
      },
    });

    feTurbulence.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          repeatCount: "indefinite",
          dur: "1s",
          values: "0.03 0.07; 0.08 0.15; 0.03 0.07",
          attributeName: "baseFrequency",
        },
      })
    );

    const feDisplacementMap = svgCanvas.addSvgElementFromJson({
      element: "feDisplacementMap",
      attr: {
        scale: smallVal,
        in2: "noise",
        in: "SourceGraphic",
      },
    });

    feDisplacementMap.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          repeatCount: "indefinite",
          dur: "1s",
          values: `${smallVal};${val};${smallVal}`,
          attributeName: "scale",
        },
      })
    );

    const feMorphology = svgCanvas.addSvgElementFromJson({
      element: "feMorphology",
      attr: { radius: "1", operator: "dilate" },
    });

    feMorphology.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          repeatCount: "indefinite",
          dur: "1s",
          values: "1; 4; 1",
          attributeName: "radius",
        },
      })
    );

    return [feTurbulence, feDisplacementMap, feMorphology];
  };

  function changeChaosMachineStrength() {
    const val = parseFloat($("#chaos_machine_strength").val());
    const smallVal = Math.round(val / 2);

    svgCanvas.setEffect(
      [
        { val: smallVal, tagName: "feDisplacementMap", attr: "scale" },
        {
          val: `${smallVal};${val};${smallVal}`,
          tagName: "animate",
          attr: "values",
        },
      ],
      true,
      "_chaos_machine",
      0,
      getChaosMachineStrengthFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getChaosMachineStrengthFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getChaosMachineSpeedFilterItems = (val) => {
    const feTurbulence = svgCanvas.addSvgElementFromJson({
      element: "feTurbulence",
      attr: {
        result: "noise",
        numOctaves: "4",
        baseFrequency: "0.03 0.07",
        type: "turbulence",
      },
    });

    feTurbulence.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          repeatCount: "indefinite",
          dur: val,
          values: "0.03 0.07; 0.08 0.15; 0.03 0.07",
          attributeName: "baseFrequency",
        },
      })
    );

    const feDisplacementMap = svgCanvas.addSvgElementFromJson({
      element: "feDisplacementMap",
      attr: {
        scale: "0",
        in2: "noise",
        in: "SourceGraphic",
      },
    });

    feDisplacementMap.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          repeatCount: "indefinite",
          dur: val,
          values: "0;0;0",
          attributeName: "scale",
        },
      })
    );

    const feMorphology = svgCanvas.addSvgElementFromJson({
      element: "feMorphology",
      attr: { radius: "1", operator: "dilate" },
    });

    feMorphology.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          repeatCount: "indefinite",
          dur: val,
          values: "1; 4; 1",
          attributeName: "radius",
        },
      })
    );

    return [feTurbulence, feDisplacementMap, feMorphology];
  };

  function changeChaosMachineSpeed() {
    const val = parseFloat($("#chaos_machine_speed").val());

    svgCanvas.setEffect(
      [
        {
          val: val,
          tagName: "animate",
          attr: "dur",
        },
      ],
      true,
      "_chaos_machine",
      0,
      getChaosMachineSpeedFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getChaosMachineSpeedFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getThreeDimOffsetFilterItems = (val) => {
    const feOffsetRed = svgCanvas.addSvgElementFromJson({
      element: "feOffset",
      attr: {
        id: "threeDimOffsetRed_three_dim",
        result: "redShift",
        dy: "0",
        dx: "0",
        in: "SourceGraphic",
      },
    });

    feOffsetRed.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "threeDimOffsetRedAnimate_three_dim",
          repeatCount: "indefinite",
          dur: "0s",
          values: `0;${val * -1};0`,
          attributeName: "dx",
        },
      })
    );

    const feOffsetBlue = svgCanvas.addSvgElementFromJson({
      element: "feOffset",
      attr: {
        id: "threeDimOffsetBlue_three_dim",
        result: "blueShift",
        dy: "0",
        dx: "0",
        in: "SourceGraphic",
      },
    });

    feOffsetBlue.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "threeDimOffsetBlueAnimate_three_dim",
          repeatCount: "indefinite",
          dur: "0s",
          values: `0;${val};0`,
          attributeName: "dx",
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
          in: "redTint",
        },
      })
    );

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "blueTint",
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
      feOffsetRed,
      svgCanvas.addSvgElementFromJson({
        element: "feColorMatrix",
        attr: {
          values: "1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0",
          result: "redTint",
          type: "matrix",
          in: "redShift",
        },
      }),
      feOffsetBlue,
      svgCanvas.addSvgElementFromJson({
        element: "feColorMatrix",
        attr: {
          values: "0 0 0 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0.5 0",
          result: "blueTint",
          type: "matrix",
          in: "blueShift",
        },
      }),
      feMerge,
    ];
  };

  function changeThreeDimOffset() {
    const val = parseFloat($("#three_dim_offset").val());

    svgCanvas.setEffect(
      [
        {
          val: "0",
          tagName: "feOffset",
          attr: "dx",
          id: "threeDimOffsetRed_three_dim",
        },
        {
          val: `0;${val * -1};0`,
          tagName: "animate",
          attr: "values",
          id: "threeDimOffsetRedAnimate_three_dim",
        },
        {
          val: "0",
          tagName: "feOffset",
          attr: "dx",
          id: "threeDimOffsetBlue_three_dim",
        },
        {
          val: `0;${val};0`,
          tagName: "animate",
          attr: "values",
          id: "threeDimOffsetBlueAnimate_three_dim",
        },
      ],
      true,
      "_three_dim",
      0,
      getThreeDimOffsetFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getThreeDimOffsetFilterItems,
            svgCanvas.setOffsets
          )
        )
    );
  }

  const getThreeDimSpeedFilterItems = (val) => {
    const feOffsetRed = svgCanvas.addSvgElementFromJson({
      element: "feOffset",
      attr: {
        id: "threeDimOffsetRed_three_dim",
        result: "redShift",
        dy: "0",
        dx: "0",
        in: "SourceGraphic",
      },
    });

    feOffsetRed.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "threeDimOffsetRedAnimate_three_dim",
          repeatCount: "indefinite",
          dur: val,
          values: "0;0;0",
          attributeName: "dx",
        },
      })
    );

    const feOffsetBlue = svgCanvas.addSvgElementFromJson({
      element: "feOffset",
      attr: {
        id: "threeDimOffsetBlue_three_dim",
        result: "blueShift",
        dy: "0",
        dx: "0",
        in: "SourceGraphic",
      },
    });

    feOffsetBlue.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "animate",
        attr: {
          id: "threeDimOffsetBlueAnimate_three_dim",
          repeatCount: "indefinite",
          dur: val,
          values: "0;0;0",
          attributeName: "dx",
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
          in: "redTint",
        },
      })
    );

    feMerge.appendChild(
      svgCanvas.addSvgElementFromJson({
        element: "feMergeNode",
        attr: {
          in: "blueTint",
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
      feOffsetRed,
      svgCanvas.addSvgElementFromJson({
        element: "feColorMatrix",
        attr: {
          values: "1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0",
          result: "redTint",
          type: "matrix",
          in: "redShift",
        },
      }),
      feOffsetBlue,
      svgCanvas.addSvgElementFromJson({
        element: "feColorMatrix",
        attr: {
          values: "0 0 0 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0.5 0",
          result: "blueTint",
          type: "matrix",
          in: "blueShift",
        },
      }),
      feMerge,
    ];
  };

  function changeThreeDimSpeed() {
    const val = parseFloat($("#three_dim_speed").val());

    svgCanvas.setEffect(
      [
        {
          val: val,
          tagName: "animate",
          attr: "dur",
        },
      ],
      true,
      "_three_dim",
      0,
      getThreeDimSpeedFilterItems,
      svgCanvas.setOffsets,
      (changes, extension, deleteValue) =>
        svgCanvas.setEffectNoUndo(changes, extension, deleteValue, (changes) =>
          svgCanvas.setEffect(
            changes,
            false,
            extension,
            deleteValue,
            getThreeDimSpeedFilterItems,
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
  this.togglePanelActive = togglePanelActive;
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
  this.changeHueShift = changeHueShift;
  this.changeColorHighlightR = changeColorHighlightR;
  this.changeColorHighlightG = changeColorHighlightG;
  this.changeColorHighlightB = changeColorHighlightB;
  this.changeGooeyStrength = changeGooeyStrength;
  this.changeCyberpunkStrength = changeCyberpunkStrength;
  this.changeCyberpunkSpeed = changeCyberpunkSpeed;
  this.changeFireStrength = changeFireStrength;
  this.changeFireSpeed = changeFireSpeed;
  this.changeGlitchStrength = changeGlitchStrength;
  this.changeGlitchOffset = changeGlitchOffset;
  this.changeGlitchSpeed = changeGlitchSpeed;
  this.changeElectricityStrength = changeElectricityStrength;
  this.changeElectricitySpeed = changeElectricitySpeed;
  this.changeWavyStrength = changeWavyStrength;
  this.changeWavyFrequency = changeWavyFrequency;
  this.changeWavyDetail = changeWavyDetail;
  this.changeWavySpeed = changeWavySpeed;
  this.changeSignalCorruptStrength = changeSignalCorruptStrength;
  this.changeSignalCorruptSpeed = changeSignalCorruptSpeed;
  this.changeHeartBeatStrength = changeHeartBeatStrength;
  this.changeHeartBeatSpeed = changeHeartBeatSpeed;
  this.changeFragmentStrength = changeFragmentStrength;
  this.changeFragmentSpeed = changeFragmentSpeed;
  this.changeSparksStrength = changeSparksStrength;
  this.changeSparksSpeed = changeSparksSpeed;
  this.changeDuoPulseStrength = changeDuoPulseStrength;
  this.changeDuoPulseOffset = changeDuoPulseOffset;
  this.changeDuoPulseSpeed = changeDuoPulseSpeed;
  this.changeWiggleStrength = changeWiggleStrength;
  this.changeWiggleSpeed = changeWiggleSpeed;
  this.changeChaosMachineStrength = changeChaosMachineStrength;
  this.changeChaosMachineSpeed = changeChaosMachineSpeed;
  this.changeThreeDimOffset = changeThreeDimOffset;
  this.changeThreeDimSpeed = changeThreeDimSpeed;
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
