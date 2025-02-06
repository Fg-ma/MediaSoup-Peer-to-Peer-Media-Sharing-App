import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../context/mediaContext/MediaContext";
import { useEffectsContext } from "../context/effectsContext/EffectsContext";
import { useSocketContext } from "../context/socketContext/SocketContext";
import { useUserInfoContext } from "../context/userInfoContext/UserInfoContext";
import ImageController from "./lib/ImageController";
import LowerImageController from "./lib/lowerImageControls/lib/LowerImageController";
import { defaultImageOptions, ImageOptions } from "./lib/typeConstant";
import FgMediaContainer from "../fgMediaContainer/FgMediaContainer";
import "./lib/fgImageStyles.css";

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

  const { userMedia, remoteDataStreams } = useMediaContext();
  const { userStreamEffects } = useEffectsContext();
  const { mediasoupSocket, tableStaticContentSocket } = useSocketContext();
  const { table_id } = useUserInfoContext();

  const imageMedia = userMedia.current.image[imageId];

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const panBtnRef = useRef<HTMLButtonElement>(null);

  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);

  const [_rerender, setRerender] = useState(false);

  const lowerImageController = new LowerImageController(
    tableStaticContentSocket,
    imageId,
    bundleRef,
    imageMedia,
    imageContainerRef,
    panBtnRef,
    shiftPressed,
    controlPressed,
    userStreamEffects
  );

  const imageController = new ImageController(
    table_id,
    imageId,
    imageMedia,
    subContainerRef,
    lowerImageController,
    remoteDataStreams,
    imageContainerRef,
    imageOptions,
    setRerender
  );

  useEffect(() => {
    subContainerRef.current?.appendChild(imageMedia.image);

    imageController.scaleCallback();

    tableStaticContentSocket.current?.requestCatchUpContentData(
      "image",
      imageId
    );

    // Set up initial conditions
    imageController.init();

    // Listen for messages on mediasoupSocket
    mediasoupSocket.current?.addMessageListener(
      imageController.handleMediasoupMessage
    );

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

    document.addEventListener(
      "visibilitychange",
      imageController.handleVisibilityChange
    );

    return () => {
      mediasoupSocket.current?.removeMessageListener(
        imageController.handleMediasoupMessage
      );
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
      document.removeEventListener(
        "visibilitychange",
        imageController.handleVisibilityChange
      );
    };
  }, []);

  return (
    <FgMediaContainer
      mediaId={"1"}
      kind={"image"}
      bundleRef={bundleRef}
      media={<div ref={subContainerRef}></div>}
    />
  );
}
