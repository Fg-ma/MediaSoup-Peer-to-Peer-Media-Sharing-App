import React, { Suspense, useEffect, useRef, useState } from "react";
import { useMediaContext } from "../context/mediaContext/MediaContext";
import { useSocketContext } from "../context/socketContext/SocketContext";
import { useUserInfoContext } from "../context/userInfoContext/UserInfoContext";
import { useToolsContext } from "../context/toolsContext/ToolsContext";
import { BundleOptions, defaultBundleOptions } from "./lib/typeConstant";
import SharedBundleController from "./lib/SharedBundleController";
import { useEffectsContext } from "../context/effectsContext/EffectsContext";
import Deadbanding from "../babylon/Deadbanding";
import FgTableVideo from "../media/fgTableVideo/FgTableVideo";
import FgTableImage from "../media/fgTableImage/FgTableImage";
import FgTableApplication from "../media/fgTableApplication/FgTableApplication";
import FgText from "../media/fgTableText/FgTableText";
import FgTableSvg from "../media/fgTableSvg/FgTableSvg";

const SnakeGame = React.lazy(() => import("../games/snakeGame/SnakeGame"));

export default function SharedBundle({
  name,
  deadbanding,
  tableRef,
  options,
}: {
  name?: string;
  deadbanding: React.MutableRefObject<Deadbanding>;
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
  const { userDevice } = useToolsContext();

  const sharedBundleRef = useRef<HTMLDivElement>(null);
  const videoContentMute = useRef<{
    [videoId: string]: boolean;
  }>({});

  const [_, setRerender] = useState(false);

  const sharedBundleController = useRef(
    new SharedBundleController(
      setRerender,
      userDevice,
      deadbanding,
      userEffectsStyles,
      userEffects,
      userMedia,
      tableStaticContentSocket,
    ),
  );

  useEffect(() => {
    userMedia.current.gamesSignaling?.addMessageListener(
      sharedBundleController.current.gameSignalingListener,
    );

    return () => {
      userMedia.current.gamesSignaling?.removeMessageListener(
        sharedBundleController.current.gameSignalingListener,
      );
    };
  }, [userMedia.current.gamesSignaling]);

  useEffect(() => {
    tableStaticContentSocket.current?.addMessageListener(
      sharedBundleController.current.handleTableStaticContentMessage,
    );

    return () =>
      tableStaticContentSocket.current?.removeMessageListener(
        sharedBundleController.current.handleTableStaticContentMessage,
      );
  }, [tableStaticContentSocket.current]);

  return (
    <div
      ref={sharedBundleRef}
      id={`${username.current}_shared_bundle_container`}
      className="pointer-events-none absolute left-0 top-0 h-full w-full"
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
      {Object.keys(userMedia.current.video.tableInstances).length !== 0 &&
        Object.keys(userMedia.current.video.tableInstances).map(
          (videoInstanceId) => (
            <Suspense key={videoInstanceId} fallback={<div>Loading...</div>}>
              <FgTableVideo
                videoInstanceId={videoInstanceId}
                bundleRef={sharedBundleRef}
                videoContentMute={videoContentMute}
              />
            </Suspense>
          ),
        )}
      {Object.keys(userMedia.current.image.tableInstances).length !== 0 &&
        Object.keys(userMedia.current.image.tableInstances).map(
          (imageInstanceId) => (
            <Suspense key={imageInstanceId} fallback={<div>Loading...</div>}>
              <FgTableImage
                imageInstanceId={imageInstanceId}
                bundleRef={sharedBundleRef}
                tableRef={tableRef}
              />
            </Suspense>
          ),
        )}
      {Object.keys(userMedia.current.svg.tableInstances).length !== 0 &&
        Object.keys(userMedia.current.svg.tableInstances).map(
          (svgInstanceId) => (
            <Suspense key={svgInstanceId} fallback={<div>Loading...</div>}>
              <FgTableSvg
                svgInstanceId={svgInstanceId}
                bundleRef={sharedBundleRef}
                tableRef={tableRef}
              />
            </Suspense>
          ),
        )}
      {Object.keys(userMedia.current.application.tableInstances).length !== 0 &&
        Object.keys(userMedia.current.application.tableInstances).map(
          (applicationInstanceId) => (
            <Suspense
              key={applicationInstanceId}
              fallback={<div>Loading...</div>}
            >
              <FgTableApplication
                applicationInstanceId={applicationInstanceId}
                bundleRef={sharedBundleRef}
                tableRef={tableRef}
              />
            </Suspense>
          ),
        )}
      {Object.keys(userMedia.current.text.tableInstances).length !== 0 &&
        Object.keys(userMedia.current.text.tableInstances).map(
          (textInstanceId) => (
            <Suspense key={textInstanceId} fallback={<div>Loading...</div>}>
              <FgText
                textInstanceId={textInstanceId}
                bundleRef={sharedBundleRef}
                tableRef={tableRef}
              />
            </Suspense>
          ),
        )}
    </div>
  );
}
