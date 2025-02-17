import React, { Suspense, useEffect, useRef, useState } from "react";
import { useMediaContext } from "../context/mediaContext/MediaContext";
import { useSocketContext } from "../context/socketContext/SocketContext";
import { useUserInfoContext } from "../context/userInfoContext/UserInfoContext";
import { BundleOptions, defaultBundleOptions } from "./lib/typeConstant";
import SharedBundleController from "./lib/SharedBundleController";
import { useEffectsContext } from "../context/effectsContext/EffectsContext";
import UserDevice from "../lib/UserDevice";
import Deadbanding from "../babylon/Deadbanding";
import FgVideo from "../media/fgVideo/FgVideo";
import FgImage from "../media/fgImage/FgImage";
import FgApplication from "../media/fgApplication/FgApplication";
import FgText from "../media/fgText/FgText";

const SnakeGame = React.lazy(() => import("../games/snakeGame/SnakeGame"));

export default function SharedBundle({
  name,
  userDevice,
  deadbanding,
  tableRef,
  options,
}: {
  name?: string;
  userDevice: UserDevice;
  deadbanding: Deadbanding;
  tableRef: React.RefObject<HTMLDivElement>;
  options?: BundleOptions;
}) {
  const bundleOptions = {
    ...defaultBundleOptions,
    ...options,
  };

  const { userMedia } = useMediaContext();
  const { tableStaticContentSocket } = useSocketContext();
  const { userEffectsStyles, userStreamEffects } = useEffectsContext();
  const { username } = useUserInfoContext();

  const sharedBundleRef = useRef<HTMLDivElement>(null);
  const videoContentMute = useRef<{
    [videoId: string]: boolean;
  }>({});

  const [_, setRerender] = useState(false);

  const sharedBundleController = new SharedBundleController(
    setRerender,
    userDevice,
    deadbanding,
    userEffectsStyles,
    userStreamEffects,
    userMedia,
    tableStaticContentSocket
  );

  useEffect(() => {
    userMedia.current.gamesSignaling?.addMessageListener(
      sharedBundleController.gameSignalingListener
    );

    return () => {
      userMedia.current.gamesSignaling?.removeMessageListener(
        sharedBundleController.gameSignalingListener
      );
    };
  }, [userMedia.current.gamesSignaling]);

  useEffect(() => {
    tableStaticContentSocket.current?.addMessageListener(
      sharedBundleController.handleTableStaticContentMessage
    );

    return () =>
      tableStaticContentSocket.current?.removeMessageListener(
        sharedBundleController.handleTableStaticContentMessage
      );
  }, [tableStaticContentSocket.current]);

  return (
    <div
      ref={sharedBundleRef}
      id={`${username.current}_shared_bundle_container`}
      className='w-full h-full absolute top-0 left-0 pointer-events-none'
    >
      {userMedia.current.games.snake &&
        Object.keys(userMedia.current.games.snake).length !== 0 &&
        Object.keys(userMedia.current.games.snake).map((snakeGameId) => (
          <Suspense key={snakeGameId} fallback={<div>Loading...</div>}>
            <SnakeGame
              snakeGameId={snakeGameId}
              sharedBundleRef={sharedBundleRef}
            />
          </Suspense>
        ))}
      {userMedia.current.video &&
        Object.keys(userMedia.current.video).length !== 0 &&
        Object.keys(userMedia.current.video).map((videoId) => (
          <Suspense key={videoId} fallback={<div>Loading...</div>}>
            <FgVideo
              videoId={videoId}
              bundleRef={sharedBundleRef}
              videoContentMute={videoContentMute}
            />
          </Suspense>
        ))}
      {userMedia.current.image &&
        Object.keys(userMedia.current.image).length !== 0 &&
        Object.keys(userMedia.current.image).map((imageId) => (
          <Suspense key={imageId} fallback={<div>Loading...</div>}>
            <FgImage
              imageId={imageId}
              bundleRef={sharedBundleRef}
              tableRef={tableRef}
            />
          </Suspense>
        ))}
      {userMedia.current.application &&
        Object.keys(userMedia.current.application).length !== 0 &&
        Object.keys(userMedia.current.application).map((applicationId) => (
          <Suspense key={applicationId} fallback={<div>Loading...</div>}>
            <FgApplication
              applicationId={applicationId}
              bundleRef={sharedBundleRef}
              tableRef={tableRef}
            />
          </Suspense>
        ))}
      {userMedia.current.text &&
        Object.keys(userMedia.current.text).length !== 0 &&
        Object.keys(userMedia.current.text).map((textId) => (
          <Suspense key={textId} fallback={<div>Loading...</div>}>
            <FgText
              textId={textId}
              bundleRef={sharedBundleRef}
              tableRef={tableRef}
            />
          </Suspense>
        ))}
    </div>
  );
}
