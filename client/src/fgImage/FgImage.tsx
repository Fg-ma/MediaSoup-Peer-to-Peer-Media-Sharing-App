import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../context/mediaContext/MediaContext";
import { useEffectsContext } from "../context/effectsContext/EffectsContext";
import { useSocketContext } from "../context/socketContext/SocketContext";
import ImageController from "./lib/ImageController";
import LowerImageController from "./lib/lowerImageControls/LowerImageController";
import { defaultImageOptions, ImageOptions } from "./lib/typeConstant";
import FgMediaContainer from "../fgMediaContainer/FgMediaContainer";
import "./lib/fgImageStyles.css";
import FullScreenButton from "./lib/lowerImageControls/fullScreenButton/FullScreenButton";
import ImageEffectsButton from "./lib/lowerImageControls/imageEffectsButton/ImageEffectsButton";
import ImageEffectsSection from "./lib/imageEffectsSection/ImageEffectsSection";

export default function FgImage({
  imageId,
  bundleRef,
  options,
}: {
  imageId: string;
  bundleRef: React.RefObject<HTMLDivElement>;
  options?: ImageOptions;
}) {
  const imageOptions = {
    ...defaultImageOptions,
    ...options,
  };

  const { userMedia } = useMediaContext();
  const { userStreamEffects } = useEffectsContext();
  const { tableStaticContentSocket } = useSocketContext();

  const imageMedia = userMedia.current.image[imageId];

  const [imageEffectsActive, setImageEffectsActive] = useState(false);

  const positioning = useRef<{
    position: { left: number; top: number };
    scale: { x: number; y: number };
    rotation: number;
  }>({
    position: { left: 32.5, top: 32.5 },
    scale: { x: 35, y: 35 },
    rotation: 0,
  });

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const rightLowerImageControlsRef = useRef<HTMLDivElement>(null);

  const tintColor = useRef("#F56114");

  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);

  const [_rerender, setRerender] = useState(false);

  const lowerImageController = new LowerImageController(
    imageId,
    imageContainerRef,
    shiftPressed,
    controlPressed,
    setImageEffectsActive,
    tintColor,
    userStreamEffects,
    userMedia
  );

  const imageController = new ImageController(
    tableStaticContentSocket,
    imageId,
    imageMedia,
    positioning,
    imageContainerRef,
    subContainerRef,
    imageOptions,
    setRerender
  );

  useEffect(() => {
    subContainerRef.current?.appendChild(imageMedia.canvas);

    tableStaticContentSocket.current?.requestCatchUpContentData(
      "image",
      imageId
    );

    // Set up initial conditions
    imageController.init();

    // Listen for messages on tableStaticContentSocket
    tableStaticContentSocket.current?.addMessageListener(
      imageController.handleTableStaticContentMessage
    );

    // Add eventlisteners
    document.addEventListener(
      "fullscreenchange",
      lowerImageController.handleFullScreenChange
    );

    document.addEventListener("keydown", lowerImageController.handleKeyDown);

    document.addEventListener("keyup", lowerImageController.handleKeyUp);

    return () => {
      tableStaticContentSocket.current?.removeMessageListener(
        imageController.handleTableStaticContentMessage
      );
      document.removeEventListener(
        "fullscreenchange",
        lowerImageController.handleFullScreenChange
      );
      document.removeEventListener(
        "keydown",
        lowerImageController.handleKeyDown
      );
      document.removeEventListener("keyup", lowerImageController.handleKeyUp);
    };
  }, []);

  return (
    <FgMediaContainer
      mediaId={imageId}
      filename={imageMedia.filename}
      kind='image'
      rootMedia={imageMedia.image}
      bundleRef={bundleRef}
      lowerPopupElements={[
        imageEffectsActive ? (
          <ImageEffectsSection
            imageId={imageId}
            imageContainerRef={imageContainerRef}
            lowerImageController={lowerImageController}
            tintColor={tintColor}
            imageMedia={imageMedia}
          />
        ) : null,
      ]}
      leftLowerControls={[]}
      rightLowerControls={[
        <FullScreenButton
          lowerImageController={lowerImageController}
          imageEffectsActive={imageEffectsActive}
          scrollingContainerRef={rightLowerImageControlsRef}
        />,
        <ImageEffectsButton
          lowerImageController={lowerImageController}
          imageEffectsActive={imageEffectsActive}
          scrollingContainerRef={rightLowerImageControlsRef}
        />,
      ]}
      inMediaVariables={[imageEffectsActive]}
      externalPositioning={positioning}
      externalMediaContainerRef={imageContainerRef}
      externalSubContainerRef={subContainerRef}
      externalRightLowerControlsRef={rightLowerImageControlsRef}
    />
  );
}
