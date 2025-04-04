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
import FgSvg from "../media/fgSvg/FgSvg";

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
  const { userEffectsStyles, userEffects } = useEffectsContext();
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
    userEffects,
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
      {Object.keys(userMedia.current.video.instances).length !== 0 &&
        Object.keys(userMedia.current.video.instances).map(
          (videoInstanceId) => (
            <Suspense key={videoInstanceId} fallback={<div>Loading...</div>}>
              <FgVideo
                videoInstanceId={videoInstanceId}
                bundleRef={sharedBundleRef}
                videoContentMute={videoContentMute}
              />
            </Suspense>
          )
        )}
      {Object.keys(userMedia.current.image.instances).length !== 0 &&
        Object.keys(userMedia.current.image.instances).map(
          (imageInstanceId) => (
            <Suspense key={imageInstanceId} fallback={<div>Loading...</div>}>
              <FgImage
                imageInstanceId={imageInstanceId}
                bundleRef={sharedBundleRef}
                tableRef={tableRef}
              />
            </Suspense>
          )
        )}
      {Object.keys(userMedia.current.svg.instances).length !== 0 &&
        Object.keys(userMedia.current.svg.instances).map((svgInstanceId) => (
          <Suspense key={svgInstanceId} fallback={<div>Loading...</div>}>
            <FgSvg
              svgInstanceId={svgInstanceId}
              bundleRef={sharedBundleRef}
              tableRef={tableRef}
            />
          </Suspense>
        ))}
      {Object.keys(userMedia.current.application.instances).length !== 0 &&
        Object.keys(userMedia.current.application.instances).map(
          (applicationInstanceId) => (
            <Suspense
              key={applicationInstanceId}
              fallback={<div>Loading...</div>}
            >
              <FgApplication
                applicationInstanceId={applicationInstanceId}
                bundleRef={sharedBundleRef}
                tableRef={tableRef}
              />
            </Suspense>
          )
        )}
      {Object.keys(userMedia.current.text.instances).length !== 0 &&
        Object.keys(userMedia.current.text.instances).map((textInstanceId) => (
          <Suspense key={textInstanceId} fallback={<div>Loading...</div>}>
            <FgText
              textInstanceId={textInstanceId}
              bundleRef={sharedBundleRef}
              tableRef={tableRef}
            />
          </Suspense>
        ))}
    </div>
  );
}
