MD.Panel = function () {
  $("#canvas_height").dragInput({
    min: 1,
    max: 10000,
    step: 10,
    callback: editor.canvas.changeSize,
    cursor: false,
    dragAdjust: 0.1,
  });
  $("#canvas_width").dragInput({
    min: 1,
    max: 10000,
    step: 10,
    callback: editor.canvas.changeSize,
    cursor: false,
    dragAdjust: 0.1,
  });
  $("#rect_width").dragInput({
    min: 1,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#rect_height").dragInput({
    min: 1,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#ellipse_cx").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#ellipse_cy").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#ellipse_rx").dragInput({
    min: 1,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#ellipse_ry").dragInput({
    min: 1,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#image_height").dragInput({
    min: 1,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#circle_cx").dragInput({
    min: 1,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#circle_cy").dragInput({
    min: 1,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#circle_r").dragInput({
    min: 1,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#image_height").dragInput({
    min: 0,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#selected_x").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#selected_y").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#path_node_x").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#path_node_y").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#image_width").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#line_x1").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#line_x2").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#line_y1").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#line_y2").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#path_x").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#path_y").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#rect_x").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#rect_y").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#g_x").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#g_y").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#image_x").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#text_y").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#text_x").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#image_y").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeAttribute,
    cursor: false,
  });
  $("#rect_rx").dragInput({
    min: 0,
    max: 100,
    step: 1,
    callback: editor.changeAttribute,
    cursor: true,
  });
  $("#stroke_width").dragInput({
    min: 0,
    max: 99,
    step: 1,
    callback: editor.changeAttribute,
    cursor: true,
    smallStep: 0.1,
    start: 2,
  });
  $("#angle").dragInput({
    min: -180,
    max: 180,
    step: 1,
    callback: editor.changeRotationAngle,
    cursor: false,
    dragAdjust: 0.5,
  });
  $("#font_size").dragInput({
    min: 1,
    max: 500,
    step: 1,
    callback: editor.text.changeFontSize,
    cursor: true,
    stepfunc: editor.stepFontSize,
    dragAdjust: 0.15,
  });
  $("#group_opacity").dragInput({
    min: 0,
    max: 100,
    step: 5,
    callback: editor.changeAttribute,
    cursor: true,
    start: 100,
  });
  $("#blur").dragInput({
    min: 0,
    max: 20,
    step: 0.1,
    callback: editor.changeBlur,
    cursor: true,
    start: 0,
  });
  $("#grayscale").dragInput({
    min: 0,
    max: 1,
    step: 0.01,
    callback: editor.changeGrayscale,
    cursor: true,
    start: 1,
  });
  $("#saturation").dragInput({
    min: 0,
    max: 5,
    step: 0.1,
    callback: editor.changeSaturation,
    cursor: true,
    start: 1,
  });
  $("#wave_distortion_strength").dragInput({
    min: 0,
    max: 50,
    step: 0.1,
    callback: editor.changeWaveDistortionStrength,
    cursor: true,
    start: 0,
  });
  $("#wave_distortion_frequency").dragInput({
    min: 0,
    max: 1,
    step: 0.01,
    callback: editor.changeWaveDistortionFrequency,
    cursor: true,
    start: 0,
  });
  $("#cracked_glass_frequency").dragInput({
    min: 0,
    max: 1,
    step: 0.01,
    callback: editor.changeCrackedGlassFrequency,
    cursor: true,
    start: 0,
  });
  $("#cracked_glass_detail").dragInput({
    min: 0,
    max: 8,
    step: 1,
    callback: editor.changeCrackedGlassDetail,
    cursor: true,
    start: 0,
  });
  $("#cracked_glass_strength").dragInput({
    min: 0,
    max: 50,
    step: 0.1,
    callback: editor.changeCrackedGlassStrength,
    cursor: true,
    start: 0,
  });
  $("#shadow_x").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeShadowX,
    cursor: false,
    start: 0,
  });
  $("#shadow_y").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeShadowY,
    cursor: false,
    start: 5,
  });
  $("#shadow_strength").dragInput({
    min: 0,
    max: 10,
    step: 0.1,
    callback: editor.changeShadowStrength,
    cursor: true,
    start: 0,
  });
  $("#tool_edge_detection").on("click", function () {
    $(this).toggleClass("active");
    if ($(this).hasClass("active")) {
      svgCanvas.addEffect("_edge_detection", () => [
        svgCanvas.addSvgElementFromJson({
          element: "feConvolveMatrix",
          attr: {
            order: "3",
            kernelMatrix: " -1 -1 -1 -1 8 -1 -1 -1 -1 ",
            result: "edgeDetected",
          },
        }),
      ]);
    } else {
      svgCanvas.removeEffect("_edge_detection");
    }
  });
  $("#tool_invert").on("click", function () {
    $(this).toggleClass("active");
    if ($(this).hasClass("active")) {
      svgCanvas.addEffect("_invert", () => [
        svgCanvas.addSvgElementFromJson({
          element: "feColorMatrix",
          attr: {
            type: "matrix",
            values: "-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0",
          },
        }),
      ]);
    } else {
      svgCanvas.removeEffect("_invert");
    }
  });
  $("#hue_shift").dragInput({
    min: 0,
    max: 360,
    step: 1,
    callback: editor.changeHueShift,
    cursor: true,
    start: 0,
  });
  $("#color_highlight_r").dragInput({
    min: 0,
    max: 1,
    step: 0.01,
    callback: editor.changeColorHighlightR,
    cursor: true,
    start: 0,
  });
  $("#color_highlight_g").dragInput({
    min: 0,
    max: 1,
    step: 0.01,
    callback: editor.changeColorHighlightG,
    cursor: true,
    start: 0,
  });
  $("#color_highlight_b").dragInput({
    min: 0,
    max: 1,
    step: 0.01,
    callback: editor.changeColorHighlightB,
    cursor: true,
    start: 0,
  });
  $("#gooey_strength").dragInput({
    min: 0,
    max: 50,
    step: 0.1,
    callback: editor.changeGooeyStrength,
    cursor: true,
    start: 0,
  });
  $("#cracked_glass_strength").dragInput({
    min: 0,
    max: 50,
    step: 0.1,
    callback: editor.changeCrackedGlassStrength,
    cursor: true,
    start: 0,
  });
  $("#cyberpunk_strength").dragInput({
    min: 0,
    max: 50,
    step: 0.1,
    callback: editor.changeCyberpunkStrength,
    cursor: true,
    start: 0,
  });
  $("#cyberpunk_speed").dragInput({
    min: 0,
    max: 3,
    step: 0.01,
    callback: editor.changeCyberpunkSpeed,
    cursor: true,
    start: 0,
  });
  $("#fire_strength").dragInput({
    min: 0,
    max: 50,
    step: 0.1,
    callback: editor.changeFireStrength,
    cursor: true,
    start: 0,
  });
  $("#fire_speed").dragInput({
    min: 0,
    max: 3,
    step: 0.01,
    callback: editor.changeFireSpeed,
    cursor: true,
    start: 0,
  });
  $("#glitch_strength").dragInput({
    min: 0,
    max: 50,
    step: 0.1,
    callback: editor.changeGlitchStrength,
    cursor: true,
    start: 0,
  });
  $("#glitch_offset").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeGlitchOffset,
    cursor: true,
    start: 0,
  });
  $("#glitch_speed").dragInput({
    min: 0,
    max: 3,
    step: 0.01,
    callback: editor.changeGlitchSpeed,
    cursor: true,
    start: 0,
  });
  $("#electricity_strength").dragInput({
    min: 0,
    max: 50,
    step: 0.1,
    callback: editor.changeElectricityStrength,
    cursor: true,
    start: 0,
  });
  $("#electricity_speed").dragInput({
    min: 0,
    max: 3,
    step: 0.01,
    callback: editor.changeElectricitySpeed,
    cursor: true,
    start: 0,
  });
  $("#wavy_strength").dragInput({
    min: 0,
    max: 50,
    step: 0.1,
    callback: editor.changeWavyStrength,
    cursor: true,
    start: 0,
  });
  $("#wavy_frequency").dragInput({
    min: 0,
    max: 50,
    step: 0.1,
    callback: editor.changeWavyFrequency,
    cursor: true,
    start: 0,
  });
  $("#wavy_detail").dragInput({
    min: 0,
    max: 8,
    step: 1,
    callback: editor.changeWavyDetail,
    cursor: true,
    start: 0,
  });
  $("#wavy_speed").dragInput({
    min: 0,
    max: 3,
    step: 0.01,
    callback: editor.changeWavySpeed,
    cursor: true,
    start: 0,
  });
  $("#signal_corrupt_strength").dragInput({
    min: 0,
    max: 50,
    step: 0.1,
    callback: editor.changeSignalCorruptStrength,
    cursor: true,
    start: 0,
  });
  $("#signal_corrupt_speed").dragInput({
    min: 0,
    max: 3,
    step: 0.01,
    callback: editor.changeSignalCorruptSpeed,
    cursor: true,
    start: 0,
  });
  $("#heart_beat_strength").dragInput({
    min: 0,
    max: 50,
    step: 0.1,
    callback: editor.changeHeartBeatStrength,
    cursor: true,
    start: 0,
  });
  $("#heart_beat_speed").dragInput({
    min: 0,
    max: 3,
    step: 0.01,
    callback: editor.changeHeartBeatSpeed,
    cursor: true,
    start: 0,
  });
  $("#fragment_strength").dragInput({
    min: 0,
    max: 50,
    step: 0.1,
    callback: editor.changeFragmentStrength,
    cursor: true,
    start: 0,
  });
  $("#fragment_speed").dragInput({
    min: 0,
    max: 3,
    step: 0.01,
    callback: editor.changeFragmentSpeed,
    cursor: true,
    start: 0,
  });
  $("#sparks_strength").dragInput({
    min: 0,
    max: 200,
    step: 1,
    callback: editor.changeSparksStrength,
    cursor: true,
    start: 0,
  });
  $("#sparks_speed").dragInput({
    min: 0,
    max: 3,
    step: 0.01,
    callback: editor.changeSparksSpeed,
    cursor: true,
    start: 0,
  });
  $("#duo_pulse_strength").dragInput({
    min: 0,
    max: 50,
    step: 0.1,
    callback: editor.changeDuoPulseStrength,
    cursor: true,
    start: 0,
  });
  $("#duo_pulse_offset").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeDuoPulseOffset,
    cursor: true,
    start: 0,
  });
  $("#duo_pulse_speed").dragInput({
    min: 0,
    max: 3,
    step: 0.01,
    callback: editor.changeDuoPulseSpeed,
    cursor: true,
    start: 0,
  });
  $("#wiggle_strength").dragInput({
    min: 0,
    max: 50,
    step: 0.1,
    callback: editor.changeWiggleStrength,
    cursor: true,
    start: 0,
  });
  $("#wiggle_speed").dragInput({
    min: 0,
    max: 3,
    step: 0.01,
    callback: editor.changeWiggleSpeed,
    cursor: true,
    start: 0,
  });
  $("#chaos_machine_strength").dragInput({
    min: 0,
    max: 50,
    step: 0.1,
    callback: editor.changeChaosMachineStrength,
    cursor: true,
    start: 0,
  });
  $("#chaos_machine_speed").dragInput({
    min: 0,
    max: 3,
    step: 0.01,
    callback: editor.changeChaosMachineSpeed,
    cursor: true,
    start: 0,
  });
  $("#three_dim_offset").dragInput({
    min: null,
    max: null,
    step: 1,
    callback: editor.changeThreeDimOffset,
    cursor: true,
    start: 0,
  });
  $("#three_dim_speed").dragInput({
    min: 0,
    max: 3,
    step: 0.01,
    callback: editor.changeThreeDimSpeed,
    cursor: true,
    start: 0,
  });

  // Align

  $("#position_opts .align_button").on("click", function () {
    $("#align_relative_to").val();
    svgCanvas.alignSelectedElements(this.getAttribute("data-align")[0], "page");
  });

  $(".align_buttons .align_button").on("click", function () {
    svgCanvas.alignSelectedElements(
      this.getAttribute("data-align")[0],
      $("#align_relative_to").val()
    );
  });

  // Paint order

  $(".paint_order_buttons .paint_order_button").on("click", function () {
    let paintOrderValue = this.getAttribute("data-paint-order");
    if (!paintOrderValue) return;
    svgCanvas.setStrokeAttr("paint-order", paintOrderValue);

    $(".paint_order_button").removeClass("active");
    $(this).addClass("active");
  });

  // Stroke dash

  $("#stroke_style").change(function () {
    svgCanvas.setStrokeAttr("stroke-dasharray", $(this).val());
    $("#stroke_style_label").html(this.options[this.selectedIndex].text);
  });

  // Storke join

  $("#stroke_join").change(function () {
    svgCanvas.setStrokeAttr("stroke-linejoin", $(this).val());
    $("#stroke_join_label").html(this.options[this.selectedIndex].text);
  });

  // Storke cap

  $("#stroke_cap").change(function () {
    svgCanvas.setStrokeAttr("stroke-linecap", $(this).val());
    $("#stroke_cap_label").html(this.options[this.selectedIndex].text);
  });

  // Segment type

  $("#seg_type").change(function () {
    svgCanvas.setSegType($(this).val());
    $("#seg_type_label").html(this.options[this.selectedIndex].text);
  });

  $("#tool_node_clone").on("click", function () {
    if (svgCanvas.pathActions.getNodePoint()) {
      const path = svgCanvas.pathActions.clonePathNode();
      svgCanvas.pathActions.toEditMode(svgedit.path.path.elem);
    }
  });

  $("#tool_node_delete").on("click", function () {
    if (svgCanvas.pathActions.getNodePoint()) {
      svgCanvas.pathActions.deletePathNode();
    }
  });

  $("#tool_openclose_path").on("click", function () {
    svgCanvas.pathActions.opencloseSubPath();
  });

  // Use
  $("#tool_unlink_use").on("click", function () {
    svgCanvas.ungroupSelectedElement();
  });

  $("#canvas_title").on("click", function () {
    $(this).focus();
  });

  $("#button_group").on("click", editor.groupSelected);
  $("#button_ungroup").on("click", editor.ungroupSelected);

  function show(elem) {
    $(".context_panel").hide();
    if (elem === "canvas") return $("#canvas_panel").show();
    if (elem === "multiselected") return $("#multiselected_panel").show();

    const tagName = elem.tagName;
    $("#" + tagName + "_panel").show();

    const strokeWidth =
      elem.getAttribute("stroke") && !elem.getAttribute("stroke-width")
        ? 1
        : elem.getAttribute("stroke-width") || 0;
    $("#stroke_width").val(strokeWidth);

    const dash = elem.getAttribute("stroke-dasharray") || "none";
    $("#stroke_style option").removeAttr("selected");
    $('#stroke_style option[value="' + dash + '"]').attr(
      "selected",
      "selected"
    );
    $("#stroke_style").trigger("change");

    const cap = elem.getAttribute("stroke-linecap") || "none";
    $("#stroke_cap option").removeAttr("selected");
    $('#stroke_cap option[value="' + cap + '"]').attr("selected", "selected");
    $("#stroke_cap").trigger("change");

    const join = elem.getAttribute("stroke-linejoin") || "none";
    $("#stroke_join option").removeAttr("selected");
    $('#stroke_join option[value="' + join + '"]').attr("selected", "selected");
    $("#stroke_join").trigger("change");

    const paintOrder = elem.getAttribute("paint-order");
    if (paintOrder) {
      $(".paint_order_button").removeClass("active");
      $(`#tool_${paintOrder.split(" ").join("_")}`).addClass("active");
    }

    $.fn.dragInput.updateCursor($("#stroke_width")[0]);
    $.fn.dragInput.updateCursor($("#blur")[0]);
  }

  function canPutTextOnPath(elems) {
    if (elems.length !== 2) return false;
    const text = elems.find((elem) => elem.tagName === "text");
    const path = elems.find(
      (elem) =>
        [
          "ellipse",
          "circle",
          "line",
          "polyline",
          "polygon",
          "rect",
          "path",
        ].indexOf(elem.tagName) > -1
    );
    return !!text && !!path;
  }

  function updateContextPanel(elems) {
    if (!elems) elems = svgCanvas.getSelectedElems();
    var elem = elems[0] || svgCanvas.getSelectedElems()[0];
    const isNode = svgCanvas.pathActions.getNodePoint();
    // If element has just been deleted, consider it null
    if (!elem || !elem.parentNode) elem = null;

    const multiselected = elems.length > 1;

    var currentLayerName = svgCanvas.getCurrentDrawing().getCurrentLayerName();
    var currentMode = svgCanvas.getMode();

    var el_name = elem?.tagName;

    if (
      (el_name !== "text" || panelActive !== "editing") &&
      !$("#text_input_label").hasClass("hide_text_input")
    ) {
      $("#text_input_label").addClass("hide_text_input");
    }

    $(".context_panel").hide();
    $("#align_tools").toggle(elem && !multiselected);

    if (currentMode === "pathedit") return showPathEdit();

    var menu_items = $("#cmenu_canvas li");

    //hack to show the proper multialign box
    if (multiselected) {
      const multi = elems.filter(Boolean);
      elem = svgCanvas.elementsAreSame(multi) ? multi[0] : null;
      if (elem) $("#panels").addClass("multiselected");
      const canTextPath = canPutTextOnPath(multi);
      $("#tool_text_on_path").toggle(canTextPath);
    } else {
      $("#panels").removeClass("multiselected");
    }

    if (!elem && !multiselected) {
      $("#stroke_panel").hide();
      $("#canvas_panel").show();
      if (el_name === "text") {
        $("#paint_order_tools").css("display", "none");
        $("#stroke_join_tools").css("display", "none");
        $("#stroke_cap_tools").css("display", "none");
      } else {
        $("#paint_order_tools").css("display", "block");
        $("#stroke_join_tools").css("display", "block");
        $("#stroke_cap_tools").css("display", "block");
      }
    }

    if (elem !== null) {
      if (el_name !== "image") {
        $("#stroke_panel").show();
      }
      if (el_name === "text") {
        $("#paint_order_tools").css("display", "none");
        $("#stroke_join_tools").css("display", "none");
        $("#stroke_cap_tools").css("display", "none");
      } else {
        $("#paint_order_tools").css("display", "block");
        $("#stroke_join_tools").css("display", "block");
        $("#stroke_cap_tools").css("display", "block");
      }
      const strokeWidth =
        elem.getAttribute("stroke") && !elem.getAttribute("stroke-width")
          ? 1
          : elem.getAttribute("stroke-width") || 0;
      $("#stroke_width").val(strokeWidth);
      $.fn.dragInput.updateCursor($("#stroke_width")[0]);
      // stroke style
      const strokeStyle = elem.getAttribute("stroke-dasharray") || "none";
      const strokeStyles = {
        none: "—",
        "2,2": "...",
        "5,5": "- -",
        "5,2,2,2": "-·-",
        "5,2,2,2,2,2": "-··-",
      };
      $("#stroke_style_label").html(strokeStyles[strokeStyle] || "—");
      const strokeCap = elem.getAttribute("stroke-linecap") || "butt";
      const strokeCaps = {
        butt: "Butt",
        round: "Round",
        square: "Square",
      };
      $("#stroke_cap_label").html(strokeCaps[strokeCap] || "Butt");
      const strokeJoin = elem.getAttribute("stroke-linejoin") || "miter";
      const strokeJoins = {
        miter: "Miter",
        round: "Round",
        bevel: "Bevel",
      };
      $("#stroke_join_label").html(strokeJoins[strokeJoin] || "Miter");
      const paintOrder = elem.getAttribute("paint-order");
      if (paintOrder) {
        $(".paint_order_button").removeClass("active");
        $(`#tool_${paintOrder.split(" ").join("_")}`).addClass("active");
      }
      var elname = elem.nodeName;
      var angle = svgCanvas.getRotationAngle(elem);
      $("#angle").val(Math.round(angle));
      $("#group_opacity").val(svgCanvas.getOpacity(elem) * 100 || 100);
      $.fn.dragInput.updateCursor(document.getElementById("group_opacity"));
      $("#tool_angle_indicator").css("transform", "rotate(" + angle + "deg)");

      var blurval = svgCanvas.getEffectAttr(
        elem,
        "_blur",
        "feGaussianBlur",
        "stdDeviation",
        0
      );
      $("#blur").val(blurval);
      $.fn.dragInput.updateCursor(document.getElementById("blur"));
      var grayscaleval = svgCanvas.getEffectAttr(
        elem,
        "_grayscale",
        "feColorMatrix",
        "values",
        1
      );
      $("#grayscale").val(grayscaleval);
      $.fn.dragInput.updateCursor(document.getElementById("grayscale"));
      var saturationval = svgCanvas.getEffectAttr(
        elem,
        "_saturation",
        "feColorMatrix",
        "values",
        1
      );
      $("#saturation").val(saturationval);
      $.fn.dragInput.updateCursor(document.getElementById("saturation"));
      var edgeDetectionVal = svgCanvas.getEdgeDetection(elem);
      var edgeDetectionTool = $("#tool_edge_detection");
      if (edgeDetectionVal && !edgeDetectionTool.hasClass("active")) {
        edgeDetectionTool.addClass("active");
      } else if (!edgeDetectionVal && edgeDetectionTool.hasClass("active")) {
        edgeDetectionTool.removeClass("active");
      }
      var waveDistortionStrengthVal = svgCanvas.getEffectAttr(
        elem,
        "_wave_distortion",
        "feDisplacementMap",
        "scale",
        0
      );
      $("#wave_distortion_strength").val(waveDistortionStrengthVal);
      $.fn.dragInput.updateCursor(
        document.getElementById("wave_distortion_strength")
      );
      var waveDistortionFrequencyVal = svgCanvas.getEffectAttr(
        elem,
        "_wave_distortion",
        "feTurbulence",
        "baseFrequency",
        0
      );
      $("#wave_distortion_frequency").val(waveDistortionFrequencyVal);
      $.fn.dragInput.updateCursor(
        document.getElementById("wave_distortion_frequency")
      );
      var crackedGlassFrequencyVal = svgCanvas.getEffectAttr(
        elem,
        "_cracked_glass",
        "feTurbulence",
        "baseFrequency",
        0
      );
      $("#cracked_glass_frequency").val(crackedGlassFrequencyVal);
      $.fn.dragInput.updateCursor(
        document.getElementById("cracked_glass_frequency")
      );
      var crackedGlassDetailVal = svgCanvas.getEffectAttr(
        elem,
        "_cracked_glass",
        "feTurbulence",
        "numOctaves",
        0
      );
      $("#cracked_glass_detail").val(crackedGlassDetailVal);
      $.fn.dragInput.updateCursor(
        document.getElementById("cracked_glass_detail")
      );
      var crackedGlassStrengthVal = svgCanvas.getEffectAttr(
        elem,
        "_cracked_glass",
        "feDisplacementMap",
        "scale",
        0
      );
      $("#cracked_glass_strength").val(crackedGlassStrengthVal);
      $.fn.dragInput.updateCursor(
        document.getElementById("cracked_glass_strength")
      );
      var shadowXVal = svgCanvas.getEffectAttr(
        elem,
        "_shadow",
        "feOffset",
        "dx",
        0
      );
      $("#shadow_x").val(shadowXVal);
      $.fn.dragInput.updateCursor(document.getElementById("shadow_x"));
      var shadowYVal = svgCanvas.getEffectAttr(
        elem,
        "_shadow",
        "feOffset",
        "dy",
        5
      );
      $("#shadow_y").val(shadowYVal);
      $.fn.dragInput.updateCursor(document.getElementById("shadow_y"));
      var shadowStrengthVal = svgCanvas.getEffectAttr(
        elem,
        "_shadow",
        "feGaussianBlur",
        "stdDeviation"
      );
      $("#shadow_strength").val(shadowStrengthVal);
      $.fn.dragInput.updateCursor(document.getElementById("shadow_strength"));
      var hueVal = svgCanvas.getEffectAttr(
        elem,
        "_hue",
        "feColorMatrix",
        "values",
        0
      );
      $("#hue_shift").val(hueVal);
      $.fn.dragInput.updateCursor(document.getElementById("hue_shift"));
      var colorHighlightRVal = svgCanvas.getEffectAttr(
        elem,
        "_color_highlight",
        "feFuncR",
        "tableValues",
        0
      );
      $("#color_highlight_r").val(colorHighlightRVal);
      $.fn.dragInput.updateCursor(document.getElementById("color_highlight_r"));
      var colorHighlightGVal = svgCanvas.getEffectAttr(
        elem,
        "_color_highlight",
        "feFuncG",
        "tableValues",
        0
      );
      $("#color_highlight_g").val(colorHighlightGVal);
      $.fn.dragInput.updateCursor(document.getElementById("color_highlight_g"));
      var colorHighlightBVal = svgCanvas.getEffectAttr(
        elem,
        "_color_highlight",
        "feFuncB",
        "tableValues",
        0
      );
      $("#color_highlight_b").val(colorHighlightBVal);
      $.fn.dragInput.updateCursor(document.getElementById("color_highlight_b"));
      var gooeyStrengthVal = svgCanvas.getEffectAttr(
        elem,
        "_gooey",
        "feGaussianBlur",
        "stdDeviation",
        0
      );
      $("#gooey_strength").val(gooeyStrengthVal);
      $.fn.dragInput.updateCursor(document.getElementById("gooey_strength"));
      var cyberpunkStrengthVal = svgCanvas.getEffectAttr(
        elem,
        "_cyberpunk",
        "feGaussianBlur",
        "stdDeviation",
        0
      );
      $("#cyberpunk_strength").val(cyberpunkStrengthVal);
      $.fn.dragInput.updateCursor(
        document.getElementById("cyberpunk_strength")
      );
      var cyberpunkSpeedVal = svgCanvas
        .getEffectAttr(elem, "_cyberpunk", "animate", "dur", "0s")
        .slice(0, -1);
      $("#cyberpunk_speed").val(cyberpunkSpeedVal);
      $.fn.dragInput.updateCursor(document.getElementById("cyberpunk_speed"));
      var fireStrengthVal = svgCanvas.getEffectAttr(
        elem,
        "_fire",
        "feGaussianBlur",
        "stdDeviation",
        0
      );
      $("#fire_strength").val(fireStrengthVal);
      $.fn.dragInput.updateCursor(document.getElementById("fire_strength"));
      var fireSpeedVal = svgCanvas
        .getEffectAttr(elem, "_fire", "animate", "dur", "0s")
        .slice(0, -1);
      $("#fire_speed").val(fireSpeedVal);
      $.fn.dragInput.updateCursor(document.getElementById("fire_speed"));
      var glitchStrengthVal = svgCanvas.getEffectAttr(
        elem,
        "_glitch",
        "feGaussianBlur",
        "stdDeviation",
        0
      );
      $("#glitch_strength").val(glitchStrengthVal);
      $.fn.dragInput.updateCursor(document.getElementById("glitch_strength"));
      var glitchOffsetVal =
        svgCanvas.getEffectAttr(
          elem,
          "_glitch",
          "feOffset",
          "dy",
          0,
          "blueOffset_glitch"
        ) * 2;
      $("#glitch_offset").val(glitchOffsetVal);
      $.fn.dragInput.updateCursor(document.getElementById("glitch_offset"));
      var glitchSpeedVal = svgCanvas
        .getEffectAttr(elem, "_glitch", "animate", "dur", "0s")
        .slice(0, -1);
      $("#glitch_speed").val(glitchSpeedVal);
      $.fn.dragInput.updateCursor(document.getElementById("glitch_speed"));
      var electricityStrengthVal = svgCanvas.getEffectAttr(
        elem,
        "_electricity",
        "feGaussianBlur",
        "stdDeviation",
        0
      );
      $("#electricity_strength").val(electricityStrengthVal);
      $.fn.dragInput.updateCursor(
        document.getElementById("electricity_strength")
      );
      var electricitySpeedVal = svgCanvas
        .getEffectAttr(elem, "_electricity", "animate", "dur", "0s")
        .slice(0, -1);
      $("#electricity_speed").val(electricitySpeedVal);
      $.fn.dragInput.updateCursor(document.getElementById("electricity_speed"));
      var wavyStrengthVal = svgCanvas.getEffectAttr(
        elem,
        "_wavy",
        "feDisplacementMap",
        "scale",
        0
      );
      $("#wavy_strength").val(wavyStrengthVal);
      $.fn.dragInput.updateCursor(document.getElementById("wavy_strength"));
      var wavyFrequencyVal = svgCanvas.getEffectAttr(
        elem,
        "_wavy",
        "feTurbulence",
        "baseFrequency",
        0
      );
      $("#wavy_frequency").val(wavyFrequencyVal);
      $.fn.dragInput.updateCursor(document.getElementById("wavy_frequency"));
      var wavyDetailVal = svgCanvas.getEffectAttr(
        elem,
        "_wavy",
        "feTurbulence",
        "numOctaves",
        0
      );
      $("#wavy_detail").val(wavyDetailVal);
      $.fn.dragInput.updateCursor(document.getElementById("wavy_detail"));
      var wavySpeedVal = svgCanvas
        .getEffectAttr(elem, "_wavy", "animate", "dur", "0s")
        .slice(0, -1);
      $("#wavy_speed").val(wavySpeedVal);
      $.fn.dragInput.updateCursor(document.getElementById("wavy_speed"));
      var signalCorruptStrengthVal = svgCanvas.getEffectAttr(
        elem,
        "_signal_corrupt",
        "feDisplacementMap",
        "scale",
        0
      );
      $("#signal_corrupt_strength").val(signalCorruptStrengthVal);
      $.fn.dragInput.updateCursor(
        document.getElementById("signal_corrupt_strength")
      );
      var signalCorruptSpeedVal = svgCanvas
        .getEffectAttr(elem, "_signal_corrupt", "animate", "dur", "0s")
        .slice(0, -1);
      $("#signal_corrupt_speed").val(signalCorruptSpeedVal);
      $.fn.dragInput.updateCursor(
        document.getElementById("signal_corrupt_speed")
      );
      var heartBeatStrengthVal = svgCanvas
        .getEffectAttr(elem, "_heart_beat", "animate", "values", "  0  ")
        .slice(2, -2);
      $("#heart_beat_strength").val(heartBeatStrengthVal);
      $.fn.dragInput.updateCursor(
        document.getElementById("heart_beat_strength")
      );
      var heartBeatSpeedVal = svgCanvas
        .getEffectAttr(elem, "_heart_beat", "animate", "dur", "0s")
        .slice(0, -1);
      $("#heart_beat_speed").val(heartBeatSpeedVal);
      $.fn.dragInput.updateCursor(document.getElementById("heart_beat_speed"));
      var fragmentStrengthVal =
        svgCanvas.getEffectAttr(
          elem,
          "_fragment",
          "feDisplacementMap",
          "scale",
          0
        ) / 2;
      $("#fragment_strength").val(fragmentStrengthVal);
      $.fn.dragInput.updateCursor(document.getElementById("fragment_strength"));
      var fragmentSpeedVal = svgCanvas
        .getEffectAttr(elem, "_fragment", "animate", "dur", "0s")
        .slice(0, -1);
      $("#fragment_speed").val(fragmentSpeedVal);
      $.fn.dragInput.updateCursor(document.getElementById("fragment_speed"));
      var sparksStrengthVal =
        svgCanvas.getEffectAttr(
          elem,
          "_sparks",
          "feDisplacementMap",
          "scale",
          0
        ) * 3;
      $("#sparks_strength").val(sparksStrengthVal);
      $.fn.dragInput.updateCursor(document.getElementById("sparks_strength"));
      var sparksSpeedVal = svgCanvas
        .getEffectAttr(elem, "_sparks", "animate", "dur", "0s")
        .slice(0, -1);
      $("#sparks_speed").val(sparksSpeedVal);
      $.fn.dragInput.updateCursor(document.getElementById("sparks_speed"));
      var duoPulseStrengthVal = svgCanvas.getEffectAttr(
        elem,
        "_duo_pulse",
        "feGaussianBlur",
        "stdDeviation",
        0
      );
      $("#duo_pulse_strength").val(duoPulseStrengthVal);
      $.fn.dragInput.updateCursor(
        document.getElementById("duo_pulse_strength")
      );
      var duoPulseOffsetVal =
        svgCanvas.getEffectAttr(
          elem,
          "_duo_pulse",
          "feOffset",
          "dy",
          0,
          "blueOffset_duo_pulse"
        ) / 1.5;
      $("#duo_pulse_offset").val(duoPulseOffsetVal);
      $.fn.dragInput.updateCursor(document.getElementById("duo_pulse_offset"));
      var duoPulseSpeedVal = svgCanvas
        .getEffectAttr(elem, "_duo_pulse", "animate", "dur", "0s")
        .slice(0, -1);
      $("#duo_pulse_speed").val(duoPulseSpeedVal);
      $.fn.dragInput.updateCursor(document.getElementById("duo_pulse_speed"));
      var wiggleStrengthVal =
        (svgCanvas.getEffectAttr(
          elem,
          "_wiggle",
          "feDisplacementMap",
          "scale",
          0
        ) /
          2) *
        3;
      $("#wiggle_strength").val(wiggleStrengthVal);
      $.fn.dragInput.updateCursor(document.getElementById("wiggle_strength"));
      var wiggleSpeedVal = svgCanvas
        .getEffectAttr(elem, "_wiggle", "animate", "dur", "0s")
        .slice(0, -1);
      $("#wiggle_speed").val(wiggleSpeedVal);
      $.fn.dragInput.updateCursor(document.getElementById("wiggle_speed"));
      var chaosMachineStrengthVal =
        svgCanvas.getEffectAttr(
          elem,
          "_chaos_machine",
          "feDisplacementMap",
          "scale",
          0
        ) * 2;
      $("#chaos_machine_strength").val(chaosMachineStrengthVal);
      $.fn.dragInput.updateCursor(
        document.getElementById("chaos_machine_strength")
      );
      var chaosMachineSpeedVal = svgCanvas
        .getEffectAttr(elem, "_chaos_machine", "animate", "dur", "0s")
        .slice(0, -1);
      $("#chaos_machine_speed").val(chaosMachineSpeedVal);
      $.fn.dragInput.updateCursor(
        document.getElementById("chaos_machine_speed")
      );
      var threeDimOffsetVal = svgCanvas
        .getEffectAttr(
          elem,
          "_three_dim",
          "animate",
          "values",
          "  0  ",
          "threeDimOffsetBlueAnimate_three_dim"
        )
        .slice(2, -2);
      $("#three_dim_offset").val(threeDimOffsetVal);
      $.fn.dragInput.updateCursor(document.getElementById("three_dim_offset"));
      var threeDimSpeedVal = svgCanvas
        .getEffectAttr(elem, "_three_dim", "animate", "dur", "0s")
        .slice(0, -1);
      $("#three_dim_speed").val(threeDimSpeedVal);
      $.fn.dragInput.updateCursor(document.getElementById("three_dim_speed"));

      if (!isNode && currentMode !== "pathedit") {
        $("#selected_panel").show();
        $("#effects_panel").show();
        $(".action_selected").removeClass("disabled");
        // Elements in this array already have coord fields
        var x, y;
        if (["g", "polyline", "path"].indexOf(elname) >= 0) {
          var bb = svgCanvas.getStrokedBBox([elem]);
          if (bb) {
            x = bb.x;
            y = bb.y;
          }
        }

        x = svgedit.units.convertUnit(x);
        y = svgedit.units.convertUnit(y);

        $("#" + elname + "_x").val(Math.round(x));
        $("#" + elname + "_y").val(Math.round(y));
        if (elname === "polyline") {
          //we're acting as if polylines were paths
          $("#path_x").val(Math.round(x));
          $("#path_y").val(Math.round(y));
        }

        // Elements in this array cannot be converted to a path
        var no_path =
          ["image", "text", "path", "g", "use"].indexOf(elname) === -1;
        if (no_path) $(".action_path_convert_selected").removeClass("disabled");
        if (elname === "path")
          $(".action_path_selected").removeClass("disabled");
      }

      var link_href = null;
      if (el_name === "a") {
        link_href = svgCanvas.getHref(elem);
        $("#g_panel").show();
      }

      if (elem && elem.parentNode && elem.parentNode.tagName === "a") {
        if (!$(elem).siblings().length) {
          $("#a_panel").show();
          link_href = svgCanvas.getHref(elem.parentNode);
        }
      }

      // Hide/show the make_link buttons
      $("#tool_make_link, #tool_make_link").toggle(!link_href);

      if (link_href) {
        $("#link_url").val(link_href);
      }

      // update contextual tools here
      var panels = {
        g: [],
        a: [],
        rect: ["rx", "width", "height", "x", "y"],
        image: ["width", "height", "x", "y"],
        circle: ["cx", "cy", "r"],
        ellipse: ["cx", "cy", "rx", "ry"],
        line: ["x1", "y1", "x2", "y2"],
        text: ["x", "y"],
        use: [],
        path: [],
        svg: [],
      };

      if ($(elem).data("gsvg")) {
        $("#g_panel").show();
      }

      if (el_name === "path" || el_name === "polyline") {
        $("#path_panel").show();
      }

      if (panels[el_name]) {
        var cur_panel = panels[el_name];
        $("#" + el_name + "_panel").show();

        // corner radius has to live in a different panel
        // because otherwise it changes the position of the
        // of the elements
        if (el_name === "rect") $("#cornerRadiusLabel").show();
        else $("#cornerRadiusLabel").hide();

        cur_panel.forEach((item, i) => {
          var attrVal = elem.getAttribute(item);
          //update the draginput cursors
          var name_item = document.getElementById(el_name + "_" + item);
          // find a textPath to put correct x and y
          if (el_name === "text") {
            const textPath = elem.querySelector("textPath");
            if (textPath) {
              var bb = elem.getBBox();
              if (bb) attrVal = bb[item];
            }
          }
          name_item.value = Math.round(attrVal) || 0;
          if (name_item.getAttribute("data-cursor") === "true") {
            $.fn.dragInput.updateCursor(name_item);
          }
        });

        if (el_name === "text") {
          var font_family = elem.getAttribute("font-family") || "default";
          var cleanFontFamily = font_family.split(",")[0].replace(/'/g, "");
          var select = document.getElementById("font_family_dropdown");

          $(".text_panel").css("display", "inline");
          if (
            panelActive === "editing" &&
            $("#text_input_label").hasClass("hide_text_input")
          ) {
            $("#text_input_label").removeClass("hide_text_input");
          }
          $("#font_family").val(font_family);
          $(select)
            .find(`option[value='${cleanFontFamily}']`)
            .prop("selected", true);
          $("#font_size").val(elem.getAttribute("font-size"));
          $("#text").val(elem.textContent);
          $("#preview_font")
            .text(cleanFontFamily)
            .css(
              "font-family",
              cleanFontFamily === "default" ? "sans-serif" : cleanFontFamily
            );
          const textPath = elem.querySelector("textPath");
          $(".text_panel").toggleClass("text-path", textPath);
          $("#textPath_offset").val(
            textPath ? textPath.getAttribute("startOffset") : 0
          );
        } // text
        else if (el_name === "image") {
          const url = svgCanvas.getHref(elem);
          if (!url) url = default_img_url;
          svgCanvas.setImageURL(url);
          $("#image_url").val(url);
        } // image
        else if (el_name === "g" || el_name === "use") {
          $("#container_panel").show();
          $(".action_group_selected").removeClass("disabled");
          var title = svgCanvas.getTitle();
        }
      }
      menu_items[(el_name === "g" ? "en" : "dis") + "ableContextMenuItems"](
        "#ungroup"
      );
      menu_items[
        (el_name === "g" || !multiselected ? "dis" : "en") +
          "ableContextMenuItems"
      ]("#group");
    }

    if (multiselected) {
      $("#multiselected_panel").show();
      $(".action_multi_selected").removeClass("disabled");
      menu_items
        .enableContextMenuItems("#group")
        .disableContextMenuItems("#ungroup");
    }

    if (!elem && !multiselected) {
      menu_items.disableContextMenuItems(
        "#delete,#cut,#copy,#ungroup,#move_front,#move_up,#move_down,#move_back"
      );
      $(".menu_item", "#edit_menu").addClass("disabled");
    }

    $(".menu_item", "#object_menu").toggleClass(
      "disabled",
      !elem && !multiselected
    );

    // update history buttons
    setTimeout(function () {
      $("#tool_paste").toggleClass("disabled", !svgCanvas.clipBoard.length > 0);
    }, 10);
    $("#tool_undo").toggleClass(
      "disabled",
      !svgCanvas.undoMgr.getUndoStackSize() > 0
    );
    $("#tool_redo").toggleClass(
      "disabled",
      !svgCanvas.undoMgr.getRedoStackSize() > 0
    );

    svgCanvas.addedNew = false;

    if ((elem && !isNode) || multiselected) {
      // update the selected elements' layer
      $("#selLayerNames")
        .removeAttr("disabled")
        .val(svgCanvas.getCurrentDrawing().getCurrentLayerName());

      // Enable regular menu options
      $("#cmenu_canvas").enableContextMenuItems(
        "#delete,#cut,#copy,#move_front,#move_up,#move_down,#move_back"
      );
    }

    populateObjectsPanel(svgCanvas.getSvgString(true));
    folderPadding();
  }

  $("#cur_context_panel").delegate("a", "click", function () {
    var link = $(this);
    if (link.attr("data-root")) {
      svgCanvas.leaveContext();
    } else {
      svgCanvas.setContext(link.text());
    }
    svgCanvas.clearSelection();
    return false;
  });

  function showPathEdit() {
    $("#path_node_panel").show();
    $("#stroke_panel").hide();
    var point = svgCanvas.pathActions.getNodePoint();
    $("#tool_node_delete").toggleClass(
      "disabled",
      !svgCanvas.pathActions.canDeleteNodes
    );
    if (point) {
      var seg_type = $("#seg_type");
      point.x = svgedit.units.convertUnit(point.x);
      point.y = svgedit.units.convertUnit(point.y);
      $("#path_node_x").val(Math.round(point.x));
      $("#path_node_y").val(Math.round(point.y));
      if (point.type) {
        seg_type.val(point.type).removeAttr("disabled");
        const segLabelMap = {
          4: "Straight",
          6: "Curve",
          7: "Smooth",
          8: "Symmetric",
          9: "Auto-smooth",
        };
        $("#seg_type_label").html(segLabelMap[point.type]);
      } else {
        seg_type.val(4).attr("disabled", "disabled");
      }
    }
    $("#panels").removeClass("multiselected");
    $("#stroke_panel").hide();
    $("#canvas_panel").hide();
    return;
  }

  function openObjectsPanels() {
    panelActive = "object";
    populateObjectsPanel(svgCanvas.getSvgString(true));
    $(this).addClass("active");
    $("#objects_panels").addClass("active");
    $("#editing_panel_button").removeClass("active");
    $(".editing_panels").removeClass("active");
    folderPadding();
    if (!$("#text_input_label").hasClass("hide_text_input")) {
      $("#text_input_label").addClass("hide_text_input");
    }
  }

  function openEditingPanels() {
    panelActive = "editing";
    $(this).addClass("active");
    $(".editing_panels").addClass("active");
    $("#objects_panel_button").removeClass("active");
    $("#objects_panels").removeClass("active");
    updateContextPanel();
  }

  function folderPadding() {
    $(".folder-item").each(function () {
      // Count the number of parent divs with the class .object-folder.folder-open
      var parentDivCount = $(this).parents(".object-folder.folder-open").length;

      // Set padding left to be 1.5 * the number of parent divs
      $(this).css("padding-left", 1.5 * parentDivCount + "rem");
    });

    $(".folder-name").each(function () {
      // Count the number of parent divs with the class .object-folder.folder-open
      var parentDivs = $(this).parents(".object-folder");

      if (parentDivs.length === 1)
        $(parentDivs.first()).css("border-radius", "0.25rem");

      $(this).css(
        "padding-left",
        Math.max(
          0.5,
          1.5 *
            ($(this).parents(".object-folder.folder-open").length -
              (parentDivs.first().hasClass("folder-open") ? 1 : 0))
        ) + "rem"
      );
    });
  }

  function populateObjectsPanel(svgString) {
    // Parse the SVG string into a DOM structure
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const svgElement = $(doc.documentElement); // Convert to jQuery object

    // Function to process each element correctly
    function renderSVGToObjects(element, isFirstFolder = false) {
      let $element = $(element);
      let tagName = element.tagName.toLowerCase();
      if (tagName === "defs") return;
      let children = Array.from(element.children).filter(
        (child) =>
          child.tagName.toLowerCase() !== "title" &&
          child.tagName.toLowerCase() !== "filter" &&
          child.tagName.toLowerCase() !== "tspan" &&
          !child.classList.contains("no-render")
      );

      if (tagName === "g") {
        const folderHTML = $("<div>", {
          class: "object-folder folder-open",
          "data-element-id": $element.attr("id") || "",
        }).append(
          $("<div>", {
            class: "folder-name",
            id: !isFirstFolder
              ? `folder-name-${$element.attr("id")}`
              : "folder-name-page",
            "data-element-id": $element.attr("id") || "",
          })
            .append(
              !isFirstFolder
                ? $("<svg>", {
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 100 100",
                    strokeWidth: "0.11875",
                    html: '<path d="M 12,88 Q 8.08125,88 5.290625,85.20937 2.5,82.41875 2.5,78.5 v -57 Q 2.5,17.58125 5.290625,14.79062 8.08125,12 12,12 h 24.58125 q 1.9,0 3.62188,0.7125 1.72187,0.7125 3.02812,2.01875 L 50,21.5 h 38 q 3.91875,0 6.70937,2.79062 Q 97.5,27.08125 97.5,31 v 47.5 q 0,3.91875 -2.79063,6.70937 Q 91.91875,88 88,88 Z m 0,-9.5 H 88 V 31 H 46.08125 l -9.5,-9.5 H 12 Z m 0,0 v -57 z" style="stroke-width:0.11875"/>',
                  })
                : null
            )
            .append(
              $("<div>", {
                class: "folder-name-text",
                text: !isFirstFolder
                  ? $element.attr("id") || "Unnamed"
                  : "Page",
              })
            )
        );

        // Create folder content separately
        const folderContent = $("<div>", { class: "folder-content" });

        // Recursively process only actual children
        children.forEach((child) => {
          folderContent.append(renderSVGToObjects(child)); // Pass along to the recursion
        });

        // Append the folder content to the folderHTML after all children are processed
        folderHTML.append(folderContent);

        return folderHTML;
      } else {
        return $("<div>", {
          class: "folder-item",
          id: `folder-item-${$element.attr("id") || tagName}`,
          "data-element-id": $element.attr("id") || "",
        })
          .append(
            tagName === "path"
              ? $("<svg>", {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 100 100",
                  style: "stroke-width:0.11875",
                }).append(
                  $("<path>", {
                    d: "m 83.25,92.75 q -4.63125,0 -8.3125,-2.67187 Q 71.25625,87.40625 69.83125,83.25 H 45.25 q -7.8375,0 -13.41875,-5.58125 Q 26.25,72.0875 26.25,64.25 26.25,56.4125 31.83125,50.83125 37.4125,45.25 45.25,45.25 h 9.5 q 3.91875,0 6.70937,-2.79063 Q 64.25,39.66875 64.25,35.75 64.25,31.83125 61.45937,29.04062 58.66875,26.25 54.75,26.25 H 30.16875 Q 28.625,30.40625 25.00312,33.07813 21.38125,35.75 16.75,35.75 10.8125,35.75 6.65625,31.59375 2.5,27.4375 2.5,21.5 2.5,15.5625 6.65625,11.40625 10.8125,7.25 16.75,7.25 q 4.63125,0 8.25312,2.67188 3.62188,2.67187 5.16563,6.82812 H 54.75 q 7.8375,0 13.41875,5.58125 Q 73.75,27.9125 73.75,35.75 q 0,7.8375 -5.58125,13.41875 Q 62.5875,54.75 54.75,54.75 h -9.5 q -3.91875,0 -6.70937,2.79062 Q 35.75,60.33125 35.75,64.25 q 0,3.91875 2.79063,6.70938 Q 41.33125,73.75 45.25,73.75 H 69.83125 Q 71.375,69.59375 74.99687,66.92188 78.61875,64.25 83.25,64.25 q 5.9375,0 10.09375,4.15625 Q 97.5,72.5625 97.5,78.5 97.5,84.4375 93.34375,88.59375 89.1875,92.75 83.25,92.75 Z m -66.5,-66.5 q 2.01875,0 3.384375,-1.36563 Q 21.5,23.51875 21.5,21.5 21.5,19.48125 20.134375,18.11562 18.76875,16.75 16.75,16.75 q -2.01875,0 -3.384375,1.36562 Q 12,19.48125 12,21.5 12,23.51875 13.365625,24.88437 14.73125,26.25 16.75,26.25 Z",
                  })
                )
              : tagName === "rect"
              ? $("<svg>", {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 100 100",
                  style: "stroke-width:0.11875",
                }).append(
                  $("<path>", {
                    d: "M 12,88 Q 8.08125,88 5.290625,85.20937 2.5,82.41875 2.5,78.5 v -57 Q 2.5,17.58125 5.290625,14.79062 8.08125,12 12,12 h 76 q 3.91875,0 6.70937,2.79062 Q 97.5,17.58125 97.5,21.5 v 57 q 0,3.91875 -2.79063,6.70937 Q 91.91875,88 88,88 Z m 0,-9.5 h 76 v -57 H 12 Z m 0,0 v -57 z",
                  })
                )
              : tagName === "ellipse"
              ? $("<svg>", {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 100 100",
                  style: "stroke-width:9",
                }).append(
                  $("<ellipse>", {
                    fill: "none",
                    cx: "50",
                    cy: "50",
                    rx: "43.846409",
                    ry: "32.884869",
                  })
                )
              : tagName === "text"
              ? $("<svg>", {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 100 100",
                  style: "stroke-width:2.4384",
                }).append(
                  $("<path>", {
                    d: "M 81.613225,2.51463 V 14.460588 H 55.972979 V 97.5 H 43.444244 V 14.460588 H 18.386775 V 2.5 c 30.798678,0 31.333663,0.02438 63.22645,0.02438 z",
                  })
                )
              : tagName === "line"
              ? $("<svg>", {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 100 100",
                  style: "stroke-width:10.0033;stroke-linecap:round",
                }).append(
                  $("<path>", {
                    d: "M 7.5033155,50 H 92.496684",
                  })
                )
              : tagName === "image"
              ? $("<svg>", {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 100 100",
                  style: "stroke-width:0.131944",
                }).append(
                  $("<path>", {
                    d: "M 13.05556,97.5 Q 8.70139,97.5 5.60069,94.39931 2.5,91.29861 2.5,86.94444 V 60.55556 q 0,-2.24306 1.51736,-3.76042 1.51736,-1.51736 3.76042,-1.51736 2.24305,0 3.76041,1.51736 1.51737,1.51736 1.51737,3.76042 v 26.38888 h 26.38888 q 2.24306,0 3.76042,1.51737 1.51736,1.51736 1.51736,3.76041 0,2.24306 -1.51736,3.76042 Q 41.6875,97.5 39.44444,97.5 Z m 73.88888,0 H 60.55556 q -2.24306,0 -3.76042,-1.51736 -1.51736,-1.51736 -1.51736,-3.76042 0,-2.24305 1.51736,-3.76041 1.51736,-1.51737 3.76042,-1.51737 H 86.94444 V 60.55556 q 0,-2.24306 1.51737,-3.76042 1.51736,-1.51736 3.76041,-1.51736 2.24306,0 3.76042,1.51736 Q 97.5,58.3125 97.5,60.55556 v 26.38888 q 0,4.35417 -3.10069,7.45487 Q 91.29861,97.5 86.94444,97.5 Z M 46.04167,71.11111 59.76389,52.77083 q 0.79167,-1.05555 2.11111,-1.05555 1.31944,0 2.11111,1.05555 L 78.5,72.16667 q 1.05556,1.31944 0.26389,2.77083 -0.79167,1.45139 -2.375,1.45139 H 23.61111 q -1.58333,0 -2.375,-1.45139 Q 20.44444,73.48611 21.5,72.16667 L 32.05556,58.04861 q 0.79166,-1.05555 2.11111,-1.05555 1.31944,0 2.11111,1.05555 z M 2.5,13.05556 Q 2.5,8.70139 5.60069,5.60069 8.70139,2.5 13.05556,2.5 h 26.38888 q 2.24306,0 3.76042,1.51736 1.51736,1.51736 1.51736,3.76042 0,2.24305 -1.51736,3.76041 -1.51736,1.51737 -3.76042,1.51737 H 13.05556 v 26.38888 q 0,2.24306 -1.51737,3.76042 -1.51736,1.51736 -3.76041,1.51736 -2.24306,0 -3.76042,-1.51736 Q 2.5,41.6875 2.5,39.44444 Z m 95,0 v 26.38888 q 0,2.24306 -1.51736,3.76042 -1.51736,1.51736 -3.76042,1.51736 -2.24305,0 -3.76041,-1.51736 -1.51737,-1.51736 -1.51737,-3.76042 V 13.05556 H 60.55556 q -2.24306,0 -3.76042,-1.51737 -1.51736,-1.51736 -1.51736,-3.76041 0,-2.24306 1.51736,-3.76042 Q 58.3125,2.5 60.55556,2.5 h 26.38888 q 4.35417,0 7.45487,3.10069 Q 97.5,8.70139 97.5,13.05556 Z M 68.47222,39.44444 q -3.43055,0 -5.67361,-2.24305 -2.24305,-2.24306 -2.24305,-5.67361 0,-3.43056 2.24305,-5.67361 2.24306,-2.24306 5.67361,-2.24306 3.43056,0 5.67361,2.24306 2.24306,2.24305 2.24306,5.67361 0,3.43055 -2.24306,5.67361 -2.24305,2.24305 -5.67361,2.24305 z",
                  })
                )
              : null
          )
          .append(
            $("<div>", {
              class: "folder-item-text",
              text: $element.attr("id") || tagName,
            })
          );
      }
    }

    // Generate the structured HTML, making sure top-level elements are properly separated
    let objectsPanelHTML = $("#objects_panels");
    objectsPanelHTML.empty();

    // **Important:** Only process direct children of the root <svg>
    let firstFolderAppended = false;
    Array.from(svgElement[0].children).forEach((child) => {
      // For the first group (g), set the flag to true and call with isFirstFolder = true
      if (child.tagName.toLowerCase() === "g" && !firstFolderAppended) {
        objectsPanelHTML.append(renderSVGToObjects(child, true)); // Append the first folder
        firstFolderAppended = true; // Ensure only the first folder is appended
      } else {
        objectsPanelHTML.append(renderSVGToObjects(child)); // Regular processing for other elements
      }
    });

    // Set the inner HTML of #objects_panels
    $("#objects_panels").html(objectsPanelHTML.html());

    let clickTimer;

    $(".folder-item")
      .off("click")
      .on("click", function (e) {
        clearTimeout(clickTimer);
        let self = this;

        clickTimer = setTimeout(function () {
          handleFolderItemClick(e, $(self));
        }, 150);
      });

    $(".folder-item")
      .off("dblclick")
      .on("dblclick", function () {
        clearTimeout(clickTimer);
        handleFolderItemDoubleClick($(this));
      });

    svgCanvas.getSelectedElems().forEach((elem) => {
      if (elem) {
        $(`#folder-item-${elem.id}`)?.addClass("active");
        $(`#folder-name-${elem.id}`)?.addClass("active");
      }
    });
  }

  function handleFolderNameDoubleClick($folderName) {
    let $textDiv = $folderName.find(".folder-name-text");
    // Prevent multiple inputs from being created
    if ($textDiv.find("input").length) return;

    let currentName = $textDiv.text().trim();
    let inputField = $("<input>")
      .val(currentName)
      .addClass("folder-name-edit-input")
      .css({
        width: "100%",
        border: "none",
        outline: "none",
        font: "inherit",
        background: "transparent",
        padding: "0",
      });

    $textDiv.empty().append(inputField);
    inputField.focus();

    inputField.on("blur", function () {
      saveAndExitFolderNameEditMode(currentName, $folderName, inputField);
    });

    // Handle pressing Enter to save changes
    inputField.on("keypress", function (e) {
      if (e.key === "Enter") {
        saveAndExitFolderNameEditMode(currentName, $folderName, inputField);
      }
    });
  }

  function saveAndExitFolderNameEditMode(oldName, $folderName, $inputField) {
    let newName = $inputField.val().trim();
    let $textDiv = $folderName.find(".folder-name-text");

    $textDiv.text(newName);

    let oldElement = document.getElementById(oldName);
    if (oldElement) {
      oldElement.id = newName;
    }
  }

  function handleFolderItemDoubleClick($folderItem) {
    let $textDiv = $folderItem.find(".folder-item-text");

    // Prevent multiple inputs from being created
    if ($textDiv.find("input").length) return;

    let currentName = $textDiv.text().trim();
    let inputField = $("<input>")
      .val(currentName)
      .addClass("folder-edit-input")
      .css({
        width: "100%",
        border: "none",
        outline: "none",
        font: "inherit",
        background: "transparent",
        padding: "0",
      });

    $textDiv.empty().append(inputField);
    inputField.focus();

    inputField.on("blur", function () {
      saveAndExitFolderItemEditMode(currentName, $folderItem, inputField);
    });

    // Handle pressing Enter to save changes
    inputField.on("keypress", function (e) {
      if (e.key === "Enter") {
        saveAndExitFolderItemEditMode(currentName, $folderItem, inputField);
      }
    });
  }

  function saveAndExitFolderItemEditMode(oldName, $folderItem, $inputField) {
    let newName = $inputField.val().trim();
    let $textDiv = $folderItem.find(".folder-item-text");

    $textDiv.text(newName);

    let oldElement = document.getElementById(oldName);
    if (oldElement) {
      oldElement.id = newName;
    }
  }

  function handleShiftSelect(startObject, finalObject) {
    let items = $(".folder-item"); // Get all folder items
    let startIndex = -1;
    let endIndex = -1;

    let originalStartFolder;
    let originalFinalFolder;

    let selectedElements = [];

    let folders = $(".folder-name");
    folders.each(function (index) {
      let folderId = $(this).attr("data-element-id");
      if (folderId === startObject) {
        originalStartFolder = startObject;

        let targetElement = $("#" + startObject)[0];
        if (targetElement) {
          selectedElements.push(targetElement);
          $(this).addClass("active");
        }

        // Find the first folder item that does not start with "g"
        let firstFolderItem = $(this)
          .closest(".object-folder")
          .find(".folder-content")
          .first()
          .find(".folder-item")
          .filter(function () {
            return $(this).attr("data-element-id").split("_")[0] !== "g";
          })
          .first(); // Get the first item that matches the condition

        if (firstFolderItem.length) {
          startObject = firstFolderItem.attr("data-element-id");
        }
      }
      if (folderId === finalObject) {
        originalFinalFolder = finalObject;

        let targetElement = $("#" + finalObject)[0];
        if (targetElement) {
          selectedElements.push(targetElement);
          $(this).addClass("active");
        }

        // Find the first folder item that does not start with "g"
        let firstFolderItem = $(this)
          .closest(".object-folder")
          .find(".folder-content")
          .first()
          .find(".folder-item")
          .filter(function () {
            return $(this).attr("data-element-id").split("_")[0] !== "g";
          })
          .first(); // Get the first item that matches the condition

        if (firstFolderItem.length) {
          finalObject = firstFolderItem.attr("data-element-id");
        }
      }
    });

    // Find the index positions of start and end objects
    items.each(function (index) {
      let itemId = $(this).attr("data-element-id");
      if (itemId === startObject) {
        startIndex = index;
      }
      if (itemId === finalObject) {
        endIndex = index;
      }
    });

    if (startIndex === -1 || endIndex === -1) return; // Ensure both items exist

    // Ensure startIndex is always less than endIndex for proper selection
    if (startIndex > endIndex) {
      [startIndex, endIndex] = [endIndex, startIndex];
    }

    // Loop through items and select everything in between
    items.slice(startIndex, endIndex + 1).each(function () {
      let elementId = $(this).attr("data-element-id");
      if (originalStartFolder || originalFinalFolder) {
        var closestFolder = $(this)
          .closest(".object-folder")
          .attr("data-element-id");
        if (
          closestFolder === originalStartFolder ||
          closestFolder === originalFinalFolder
        )
          return;
      }
      if (elementId) {
        let targetElement = $("#" + elementId)[0];
        if (targetElement) {
          selectedElements.push(targetElement);
          $(this).addClass("active"); // Add visual active state
        }
      }
    });

    // Apply selection in SVG Canvas
    if (selectedElements.length > 0) {
      svgCanvas.addToSelection(selectedElements, false);
    }
  }

  function handleCtrlSelect(item, targetElement, elementId) {
    if (item.hasClass("active")) {
      svgCanvas.removeFromSelection([targetElement], false);
    } else {
      svgCanvas.addToSelection([targetElement], false);
      lastItemPressed = elementId;
    }
  }

  function handleFolderClick(e, folderNameDiv) {
    var parentDiv = folderNameDiv.closest(".object-folder");
    var isShiftPressed = e.shiftKey;
    var isCtrlPressed = e.ctrlKey;

    if (folderNameDiv.attr("id") !== "folder-name-page") {
      var folderOpen = parentDiv.hasClass("folder-open");
      var folderActive = folderNameDiv.hasClass("active");

      if (folderOpen && folderActive) {
        parentDiv.removeClass("folder-open");
        folderNameDiv.removeClass("active");
      } else {
        var closestFolderItems = $(folderNameDiv.closest(".object-folder")[0])
          .find(".folder-content")
          .first()
          .find(".folder-item");

        closestFolderItems.each(function () {
          var elem = $(this);
          if (elem.hasClass("active")) {
            elem.removeClass("active");
            var itemsId = elem.attr("data-element-id");
            if (itemsId) svgCanvas.removeFromSelection([$("#" + itemsId)[0]]);
          }
        });

        if (folderOpen && !folderActive) {
          folderNameDiv.addClass("active");
          let elementId = folderNameDiv.attr("data-element-id");
          if (elementId) {
            let targetElement = document.getElementById(elementId);
            if (targetElement) {
              if (isCtrlPressed) {
                svgCanvas.addToSelection([targetElement], false);
                lastItemPressed = elementId;
              } else if (isShiftPressed) {
                if (!lastItemPressed) {
                  lastItemPressed = elementId;
                } else {
                  svgCanvas.clearSelection();
                  handleShiftSelect(lastItemPressed, elementId);
                }
              } else {
                svgCanvas.clearSelection();
                svgCanvas.addToSelection([targetElement], true);
                lastItemPressed = elementId;
              }
            }
          }
        } else {
          parentDiv.addClass("folder-open");
          folderNameDiv.addClass("active");
          let elementId = folderNameDiv.attr("data-element-id");
          if (elementId) {
            let targetElement = document.getElementById(elementId);
            if (targetElement) {
              if (isCtrlPressed) {
                svgCanvas.addToSelection([targetElement], false);
                lastItemPressed = elementId;
              } else if (isShiftPressed) {
                if (!lastItemPressed) {
                  lastItemPressed = elementId;
                } else {
                  svgCanvas.clearSelection();
                  handleShiftSelect(lastItemPressed, elementId);
                }
              } else {
                svgCanvas.clearSelection();
                svgCanvas.addToSelection([targetElement], true);
                lastItemPressed = elementId;
              }
            }
          }
        }
      }
    } else {
      parentDiv.toggleClass("folder-open");
    }
    folderPadding();
  }

  function handleFolderItemClick(e, folderItem) {
    var isShiftPressed = e.shiftKey;
    var isCtrlPressed = e.ctrlKey;

    var closestFolder = folderItem.closest(".object-folder")[0];

    var closestFolderElementId = $(closestFolder).attr("data-element-id");
    if (closestFolderElementId) {
      var closestFolderElement = $("#" + closestFolderElementId)[0];

      var closestFolderSelected = svgCanvas
        .getSelectedElems()
        .includes(closestFolderElement);

      if (closestFolderSelected) {
        svgCanvas.removeFromSelection([closestFolderElement]);
        $(closestFolderElement).removeClass("active");
      }
    }

    var elementId = folderItem.attr("data-element-id");

    if (elementId) {
      let targetElement = document.getElementById(elementId);
      if (targetElement) {
        if (isCtrlPressed) {
          handleCtrlSelect(folderItem, targetElement, elementId);
        } else if (isShiftPressed) {
          if (!lastItemPressed) {
            lastItemPressed = elementId;
          } else {
            svgCanvas.clearSelection();
            handleShiftSelect(lastItemPressed, elementId);
          }
        } else {
          svgCanvas.clearSelection();
          svgCanvas.addToSelection([targetElement], true);
          lastItemPressed = elementId;
        }
      }
    }
  }

  let clickTimer;

  // Use event delegation instead of direct binding
  $("#objects_panels")
    .off("click", ".folder-name")
    .on("click", ".folder-name", function (e) {
      clearTimeout(clickTimer);
      let self = this;

      clickTimer = setTimeout(function () {
        handleFolderClick(e, $(self));
      }, 150);
    });

  $("#objects_panels")
    .off("dblclick", ".folder-name")
    .on("dblclick", ".folder-name", function () {
      clearTimeout(clickTimer);

      const folderName = $(this);
      if (folderName.id === "folder-name-page") return;

      handleFolderNameDoubleClick(folderName);
    });

  $("#objects_panel_button").on("click", openObjectsPanels);

  $("#editing_panel_button").on("click", openEditingPanels);

  var panelActive = "object";

  var lastItemPressed = null;

  openObjectsPanels();
  this.show = show;
  this.updateContextPanel = updateContextPanel;
};
