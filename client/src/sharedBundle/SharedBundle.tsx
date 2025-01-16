import React, { Suspense, useEffect, useRef, useState } from "react";
import { useMediaContext } from "../context/mediaContext/MediaContext";
import { useSocketContext } from "../context/socketContext/SocketContext";
import { useUserInfoContext } from "../context/userInfoContext/UserInfoContext";
import { BundleOptions, defaultBundleOptions } from "./lib/typeConstant";
import SharedBundleController from "./lib/SharedBundleController";
import { IncomingTableStaticContentMessages } from "../lib/TableStaticContentSocketController";
import VideoMedia from "../lib/VideoMedia";
import { useEffectsContext } from "../context/effectsContext/EffectsContext";
import UserDevice from "../lib/UserDevice";
import Deadbanding from "../babylon/Deadbanding";
import FgVideo from "../fgElements/fgVideo/FgVideo";

const SnakeGame = React.lazy(() => import("../games/snakeGame/SnakeGame"));

export default function SharedBundle({
  name,
  userDevice,
  deadbanding,
  options,
}: {
  name?: string;
  userDevice: UserDevice;
  deadbanding: Deadbanding;
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

  const [_, setRerender] = useState(false);

  const sharedBundleController = new SharedBundleController(setRerender);

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
      handleTableStaticContentMessage
    );

    return () =>
      tableStaticContentSocket.current?.removeMessageListener(
        handleTableStaticContentMessage
      );
  }, [tableStaticContentSocket.current]);

  const handleTableStaticContentMessage = (
    message: IncomingTableStaticContentMessages
  ) => {
    switch (message.type) {
      case "originalVideoReady":
        {
          const { videoId } = message.header;
          const { filename, url } = message.data;
          userMedia.current.video[videoId] = new VideoMedia(
            videoId,
            filename,
            url,
            userDevice,
            deadbanding,
            userEffectsStyles,
            userStreamEffects,
            userMedia
          );
          setRerender((prev) => !prev);
        }
        break;
      case "dashVideoReady":
        {
          const { videoId } = message.header;
          const { url } = message.data;
          userMedia.current.video[videoId]?.preloadDashStream(url);
        }
        break;
      case "contentDeleted":
        setRerender((prev) => !prev);
        break;
      // case "truncatedVideoReady":
      //   shakaPlayer.current?.load(message.url).then(() => {
      //     console.log("Original video loaded successfully");
      //   });
      //   break;
      default:
        break;
    }
  };

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
            <FgVideo videoId={videoId} sharedBundleRef={sharedBundleRef} />
          </Suspense>
        ))}
    </div>
  );
}
