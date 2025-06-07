import React, { useEffect, useRef } from "react";
import ImageEditor from "tui-image-editor";
import "tui-image-editor/dist/tui-image-editor.css";
import "./lib/tui.scss";

export default function TUI({
  initialUrl,
  initialFilename,
  confirmCallback,
  closeCallback,
}: {
  initialUrl: string;
  initialFilename: string;
  confirmCallback?: (file: File) => void;
  closeCallback?: () => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageEditorInstance = useRef<ImageEditor | null>(null);

  useEffect(() => {
    if (editorRef.current && !imageEditorInstance.current) {
      imageEditorInstance.current = new ImageEditor(editorRef.current, {
        includeUI: {
          loadImage: {
            path: initialUrl,
            name: initialFilename,
          },
          theme: {}, // Can customize UI theme here
          menu: ["crop", "flip", "rotate", "draw", "shape", "text", "filter"],
          initMenu: "",
          uiSize: {
            width: "100%",
            height: "100%",
          },
        },
        selectionStyle: {
          cornerSize: 20,
          rotatingPointOffset: 70,
        },
      });
    }

    const onBottomImageEditorControlsWheel = (e: Event) => {
      const wheelEvent = e as WheelEvent;
      if (!bottomImageEditorControls || wheelEvent.deltaY === 0) return;
      wheelEvent.preventDefault();
      bottomImageEditorControls.scrollLeft += wheelEvent.deltaY;
    };

    const onTopImageEditorControlsWheel = (e: Event) => {
      const wheelEvent = e as WheelEvent;
      if (!topImageEditorControls || wheelEvent.deltaY === 0) return;
      wheelEvent.preventDefault();
      topImageEditorControls.scrollLeft += wheelEvent.deltaY;
    };

    const onGeneralWheel = (e: Event, elem: HTMLElement) => {
      const wheelEvent = e as WheelEvent;
      if (wheelEvent.deltaY === 0) return;
      wheelEvent.preventDefault();
      elem.scrollLeft += wheelEvent.deltaY;
    };

    const onWrapWheel = (e: Event) => {
      const wheelEvent = e as WheelEvent;
      if (!imageEditorWrap || wheelEvent.deltaY === 0) return;
      const isWrapOverflowingY =
        imageEditorWrap.scrollHeight > imageEditorWrap.clientHeight;
      if (isWrapOverflowingY) return;
      wheelEvent.preventDefault();
      imageEditorWrap.scrollLeft += wheelEvent.deltaY;
    };

    const generalResize = (elem: HTMLElement) => {
      const isElemOverflowingX = elem.scrollWidth > elem.clientWidth;
      elem.style.setProperty(
        "justify-content",
        isElemOverflowingX ? "start" : "center",
        "important",
      );
    };

    const handleResize = () => {
      if (
        !topImageEditorControls ||
        !bottomImageEditorControls ||
        !imageEditorMain
      )
        return;

      imageEditorWrap.style.setProperty(
        "height",
        `calc(100% - ${imageEditorSubmenu.clientHeight}px)`,
        "important",
      );

      const isTopOverflowing =
        topImageEditorControls.scrollWidth > topImageEditorControls.clientWidth;
      topImageEditorControls.style.height = isTopOverflowing ? "70px" : "40px";

      const isBottomOverflowing =
        bottomImageEditorControls.scrollWidth >
        bottomImageEditorControls.clientWidth;
      bottomImageEditorControls.style.height = isBottomOverflowing
        ? "84px"
        : "64px";
      imageEditorMain.style.bottom = isBottomOverflowing ? "20px" : "0px";

      const isWrapOverflowingX =
        imageEditorWrap.scrollWidth > imageEditorWrap.clientWidth;
      const isWrapOverflowingY =
        imageEditorWrap.scrollHeight > imageEditorWrap.clientHeight;
      imageEditorWrap.style.justifyContent = isWrapOverflowingX
        ? "start"
        : "center";
      imageEditorWrap.style.alignItems = isWrapOverflowingY
        ? "start"
        : "center";

      generalResize(editorMenuCrop);
      generalResize(editorMenuFlip);
      generalResize(editorMenuRotate);
      generalResize(editorMenuDraw);
      generalResize(editorMenuShape);
      generalResize(editorMenuText);
      generalResize(editorMenuFilter);
    };

    const handleClose = () => {
      if (closeCallback) closeCallback();
    };

    const handleConfirm = async () => {
      if (!imageEditorInstance.current) return;

      const dataUrl = imageEditorInstance.current.toDataURL(); // exports as PNG by default

      // Convert dataURL to File
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], initialFilename || "edited-image.png", {
        type: blob.type,
      });

      if (confirmCallback) confirmCallback(file);
    };

    const handlePageChange = () => {
      setTimeout(() => {
        handleResize();
      }, 0);
    };

    const imageEditorSubmenu = editorRef.current?.querySelector(
      ".tui-image-editor-submenu",
    ) as HTMLElement;
    const bottomImageEditorControls = editorRef.current?.querySelector(
      ".tui-image-editor-controls",
    ) as HTMLElement;
    const topImageEditorControls = editorRef.current?.querySelector(
      ".tui-image-editor-help-menu.top",
    ) as HTMLElement;
    const imageEditorMain = editorRef.current?.querySelector(
      ".tui-image-editor-main",
    ) as HTMLElement;
    const imageEditorWrap = editorRef.current?.querySelector(
      ".tui-image-editor-wrap",
    ) as HTMLElement;
    const editorMenuCrop = editorRef.current?.querySelector(
      ".tui-image-editor-menu-crop",
    ) as HTMLElement;
    const editorMenuFlip = editorRef.current?.querySelector(
      ".tui-image-editor-menu-flip",
    ) as HTMLElement;
    const editorMenuRotate = editorRef.current?.querySelector(
      ".tui-image-editor-menu-rotate",
    ) as HTMLElement;
    const editorMenuDraw = editorRef.current?.querySelector(
      ".tui-image-editor-menu-draw",
    ) as HTMLElement;
    const editorMenuShape = editorRef.current?.querySelector(
      ".tui-image-editor-menu-shape",
    ) as HTMLElement;
    const editorMenuText = editorRef.current?.querySelector(
      ".tui-image-editor-menu-text",
    ) as HTMLElement;
    const editorMenuFilter = editorRef.current?.querySelector(
      ".tui-image-editor-menu-filter",
    ) as HTMLElement;
    const cropBtn = editorRef.current?.querySelector(
      ".tie-btn-crop",
    ) as HTMLElement;
    const flipBtn = editorRef.current?.querySelector(
      ".tie-btn-flip",
    ) as HTMLElement;
    const rotateBtn = editorRef.current?.querySelector(
      ".tie-btn-rotate",
    ) as HTMLElement;
    const drawBtn = editorRef.current?.querySelector(
      ".tie-btn-draw",
    ) as HTMLElement;
    const shapeBtn = editorRef.current?.querySelector(
      ".tie-btn-shape",
    ) as HTMLElement;
    const textBtn = editorRef.current?.querySelector(
      ".tie-btn-text",
    ) as HTMLElement;
    const filterBtn = editorRef.current?.querySelector(
      ".tie-btn-filter",
    ) as HTMLElement;

    if (imageEditorWrap) {
      imageEditorWrap.addEventListener("wheel", onWrapWheel, false);
    }
    if (bottomImageEditorControls) {
      bottomImageEditorControls.addEventListener(
        "wheel",
        onBottomImageEditorControlsWheel,
        false,
      );
    }
    if (topImageEditorControls) {
      topImageEditorControls.addEventListener(
        "wheel",
        onTopImageEditorControlsWheel,
        false,
      );
    }
    if (editorMenuCrop) {
      editorMenuCrop.addEventListener(
        "wheel",
        (e) => onGeneralWheel(e, editorMenuCrop),
        false,
      );
    }
    if (editorMenuFlip) {
      editorMenuFlip.addEventListener(
        "wheel",
        (e) => onGeneralWheel(e, editorMenuFlip),
        false,
      );
    }
    if (editorMenuRotate) {
      editorMenuRotate.addEventListener(
        "wheel",
        (e) => onGeneralWheel(e, editorMenuRotate),
        false,
      );
    }
    if (editorMenuDraw) {
      editorMenuDraw.addEventListener(
        "wheel",
        (e) => onGeneralWheel(e, editorMenuDraw),
        false,
      );
    }
    if (editorMenuShape) {
      editorMenuShape.addEventListener(
        "wheel",
        (e) => onGeneralWheel(e, editorMenuShape),
        false,
      );
    }
    if (editorMenuText) {
      editorMenuText.addEventListener(
        "wheel",
        (e) => onGeneralWheel(e, editorMenuText),
        false,
      );
    }
    if (editorMenuFilter) {
      editorMenuFilter.addEventListener(
        "wheel",
        (e) => onGeneralWheel(e, editorMenuFilter),
        false,
      );
    }
    if (cropBtn) {
      cropBtn.addEventListener("click", handlePageChange);
    }
    if (flipBtn) {
      flipBtn.addEventListener("click", handlePageChange);
    }
    if (rotateBtn) {
      rotateBtn.addEventListener("click", handlePageChange);
    }
    if (drawBtn) {
      drawBtn.addEventListener("click", handlePageChange);
    }
    if (shapeBtn) {
      shapeBtn.addEventListener("click", handlePageChange);
    }
    if (textBtn) {
      textBtn.addEventListener("click", handlePageChange);
    }
    if (filterBtn) {
      filterBtn.addEventListener("click", handlePageChange);
    }

    // Divider
    const li = document.createElement("li");
    li.className = "tui-image-editor-item";
    const div = document.createElement("div");
    div.className = "tui-image-editor-icpartition";
    li.appendChild(div);
    topImageEditorControls.insertBefore(li, topImageEditorControls.firstChild);

    // Close button
    const closeSvg = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        height="18"
        width="18"
      >
        <path
          d="M 50,60.114071 14.600729,95.513284 Q 12.614071,97.5 9.5436914,97.5 6.473375,97.5 4.4866571,95.513284 2.5,93.526625 2.5,90.45631 2.5,87.38593 4.4866571,85.39927 L 39.885929,50 4.4866571,14.600729 Q 2.5,12.614071 2.5,9.5436914 2.5,6.473375 4.4866571,4.4866571 6.473375,2.5 9.5436914,2.5 12.614071,2.5 14.600729,4.4866571 L 50,39.885929 85.39927,4.4866571 Q 87.38593,2.5 90.45631,2.5 93.526625,2.5 95.513284,4.4866571 97.5,6.473375 97.5,9.5436914 q 0,3.0703796 -1.986716,5.0570376 L 60.114071,50 95.513284,85.39927 Q 97.5,87.38593 97.5,90.45631 q 0,3.070315 -1.986716,5.056974 Q 93.526625,97.5 90.45631,97.5 q -3.07038,0 -5.05704,-1.986716 z"
          style="stroke-width:0.95"
        />
      </svg>
    `;
    const closeLi = document.createElement("li");
    closeLi.addEventListener("click", handleClose);
    closeLi.className = "tui-close-button tui-image-editor-item help enabled";
    closeLi.innerHTML = closeSvg;
    topImageEditorControls.insertBefore(
      closeLi,
      topImageEditorControls.firstChild,
    );

    // Finished button
    const finishedSvg = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        height="22"
        width="22"
      >
        <path
          d="m 34.987871,69.429445 52.06784,-52.06784 q 1.84311,-1.84311 4.30059,-1.84311 2.45748,0 4.30059,1.84311 1.84311,1.84311 1.84311,4.37738 0,2.53428 -1.84311,4.37739 l -56.36843,56.52202 q -1.84311,1.84311 -4.30059,1.84311 -2.45747,0 -4.30058,-1.84311 L 4.2693807,56.220495 q -1.8431,-1.84311 -1.76631,-4.37739 0.0768,-2.53427 1.91991,-4.37738 1.84311,-1.84311 4.37738,-1.84311 2.5342803,0 4.3773903,1.84311 z"
          style="stroke-width:0.153592" 
      	/>
      </svg>
    `;
    const finishedLi = document.createElement("li");
    finishedLi.addEventListener("click", handleConfirm);
    finishedLi.className =
      "tui-finished-button tui-image-editor-item help enabled";
    finishedLi.innerHTML = finishedSvg;
    topImageEditorControls.insertBefore(
      finishedLi,
      topImageEditorControls.firstChild,
    );

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      imageEditorInstance.current?.destroy();
      imageEditorInstance.current = null;
      if (imageEditorWrap) {
        imageEditorWrap.removeEventListener("wheel", onWrapWheel, false);
      }
      if (bottomImageEditorControls) {
        bottomImageEditorControls.removeEventListener(
          "wheel",
          onBottomImageEditorControlsWheel,
          false,
        );
      }
      if (topImageEditorControls) {
        topImageEditorControls.removeEventListener(
          "wheel",
          onTopImageEditorControlsWheel,
          false,
        );
      }
      if (editorMenuCrop) {
        editorMenuCrop.removeEventListener(
          "wheel",
          (e) => onGeneralWheel(e, editorMenuCrop),
          false,
        );
      }
      if (editorMenuFlip) {
        editorMenuFlip.removeEventListener(
          "wheel",
          (e) => onGeneralWheel(e, editorMenuFlip),
          false,
        );
      }
      if (editorMenuRotate) {
        editorMenuRotate.removeEventListener(
          "wheel",
          (e) => onGeneralWheel(e, editorMenuRotate),
          false,
        );
      }
      if (editorMenuDraw) {
        editorMenuDraw.removeEventListener(
          "wheel",
          (e) => onGeneralWheel(e, editorMenuDraw),
          false,
        );
      }
      if (editorMenuShape) {
        editorMenuShape.removeEventListener(
          "wheel",
          (e) => onGeneralWheel(e, editorMenuShape),
          false,
        );
      }
      if (editorMenuText) {
        editorMenuText.removeEventListener(
          "wheel",
          (e) => onGeneralWheel(e, editorMenuText),
          false,
        );
      }
      if (editorMenuFilter) {
        editorMenuFilter.removeEventListener(
          "wheel",
          (e) => onGeneralWheel(e, editorMenuFilter),
          false,
        );
      }
      if (cropBtn) {
        cropBtn.removeEventListener("click", handlePageChange);
      }
      if (flipBtn) {
        flipBtn.removeEventListener("click", handlePageChange);
      }
      if (rotateBtn) {
        rotateBtn.removeEventListener("click", handlePageChange);
      }
      if (drawBtn) {
        drawBtn.removeEventListener("click", handlePageChange);
      }
      if (shapeBtn) {
        shapeBtn.removeEventListener("click", handlePageChange);
      }
      if (textBtn) {
        textBtn.removeEventListener("click", handlePageChange);
      }
      if (filterBtn) {
        filterBtn.removeEventListener("click", handlePageChange);
      }
      closeLi.removeEventListener("click", handleClose);
      finishedLi.removeEventListener("click", handleConfirm);
      window.removeEventListener("resize", handleResize);
    };
  }, [initialUrl, initialFilename, editorRef.current]);

  return (
    <div className="absolute inset-0 z-modals bg-fg-tone-black-1">
      <div ref={editorRef} />
    </div>
  );
}
