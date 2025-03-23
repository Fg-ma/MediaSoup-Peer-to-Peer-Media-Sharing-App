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
    start: 1.5,
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
      $("#stroke_panel").show();
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
      var blurval = svgCanvas.getBlur(elem);
      $("#blur").val(blurval);
      $.fn.dragInput.updateCursor(document.getElementById("blur"));
      if (!isNode && currentMode !== "pathedit") {
        $("#selected_panel").show();
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

    populateObjectsPanel(svgCanvas.getSvgString());
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
    populateObjectsPanel(svgCanvas.getSvgString());
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
      let children = Array.from(element.children).filter(
        (child) => child.tagName.toLowerCase() !== "title"
      ); // Ignore <title> elements

      if (tagName === "g") {
        // If this is the first folder, add extra handling
        const folderHTML = $("<div>", {
          class: "object-folder folder-open",
          "data-element-id": $element.attr("id") || "",
        }).append(
          $("<div>", {
            class: "folder-name",
            text: !isFirstFolder ? $element.attr("id") || "Unnamed" : "Page",
            id: !isFirstFolder
              ? `folder-name-${$element.attr("id")}`
              : "folder-name-page",
            "data-element-id": $element.attr("id") || "",
          })
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
        // Create an item for non-group elements
        return $("<div>", {
          class: "folder-item",
          id: `folder-item-${$element.attr("id") || tagName}`,
          text: $element.attr("id") || tagName,
          "data-element-id": $element.attr("id") || "",
        });
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

    $(".folder-item")
      .off("click")
      .on("click", function (e) {
        var isShiftPressed = e.shiftKey;
        var isCtrlPressed = e.ctrlKey;
        var folderItem = $(this);
        var closestFolder = folderItem.closest(".object-folder")[0];

        var closestFolderElementId = $(closestFolder).attr("data-element-id");
        if (closestFolderElementId) {
          var closestFolderElement = $("#" + closestFolderElementId)[0];

          var closestFolderSelected = svgCanvas
            .getSelectedElems()
            .includes(closestFolderElement);

          if (closestFolderSelected) return;
        }

        var elementId = $(this).attr("data-element-id");

        if (elementId) {
          let targetElement = document.getElementById(elementId);
          if (targetElement) {
            if (isCtrlPressed) {
              svgCanvas.addToSelection([targetElement], false);
            } else {
              svgCanvas.clearSelection();
              svgCanvas.addToSelection([targetElement], true);
            }
          }
        }
      });

    svgCanvas.getSelectedElems().forEach((elem) => {
      if (elem) {
        $(`#folder-item-${elem.id}`)?.addClass("active");
        $(`#folder-name-${elem.id}`)?.addClass("active");
      }
    });
  }

  $("#objects_panels")
    .off("click", ".folder-name")
    .on("click", ".folder-name", function (e) {
      var folderNameDiv = $(this);
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
            let elementId = $(this).attr("data-element-id");
            if (elementId) {
              let targetElement = document.getElementById(elementId);
              if (targetElement) {
                if (isCtrlPressed) {
                  svgCanvas.addToSelection([targetElement], false);
                } else {
                  svgCanvas.clearSelection();
                  svgCanvas.addToSelection([targetElement], true);
                }
              }
            }
          } else {
            parentDiv.addClass("folder-open");
            folderNameDiv.addClass("active");
            let elementId = $(this).attr("data-element-id");
            if (elementId) {
              let targetElement = document.getElementById(elementId);
              if (targetElement) {
                if (isCtrlPressed) {
                  svgCanvas.addToSelection([targetElement], false);
                } else {
                  svgCanvas.clearSelection();
                  svgCanvas.addToSelection([targetElement], true);
                }
              }
            }
          }
        }
      } else {
        parentDiv.toggleClass("folder-open");
      }
      folderPadding();
    });

  $("#objects_panel_button").on("click", openObjectsPanels);

  $("#editing_panel_button").on("click", openEditingPanels);

  var panelActive = "object";

  openObjectsPanels();
  this.show = show;
  this.updateContextPanel = updateContextPanel;
};
