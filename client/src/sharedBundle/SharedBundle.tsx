import React, { Suspense, useEffect, useRef, useState } from "react";
import { useMediaContext } from "../context/mediaContext/MediaContext";
import { useSocketContext } from "../context/socketContext/SocketContext";
import { useUserInfoContext } from "../context/userInfoContext/UserInfoContext";
import { BundleOptions, defaultBundleOptions } from "./lib/typeConstant";
import SharedBundleController from "./lib/SharedBundleController";
import FgTableVideo from "../media/fgTableVideo/FgTableVideo";
import FgTableImage from "../media/fgTableImage/FgTableImage";
import FgTableApplication from "../media/fgTableApplication/FgTableApplication";
import FgText from "../media/fgTableText/FgTableText";
import FgTableSvg from "../media/fgTableSvg/FgTableSvg";

const SnakeGame = React.lazy(
  () => import("../media/games/snakeGame/SnakeGame"),
);

export default function SharedBundle({
  tableRef,
  tableTopRef,
  options,
}: {
  tableRef: React.RefObject<HTMLDivElement>;
  tableTopRef: React.RefObject<HTMLDivElement>;
  options?: BundleOptions;
}) {
  const bundleOptions = {
    ...defaultBundleOptions,
    ...options,
  };

  const { staticContentMedia } = useMediaContext();
  const { tableStaticContentSocket, liveTextEditingSocket, gamesSocket } =
    useSocketContext();
  const { username } = useUserInfoContext();

  const sharedBundleRef = useRef<HTMLDivElement>(null);
  const videoContentMute = useRef<{
    [videoId: string]: boolean;
  }>({});

  const [_, setRerender] = useState(false);

  const sharedBundleController = useRef(
    new SharedBundleController(setRerender),
  );

  useEffect(() => {
    gamesSocket.current?.addMessageListener(
      sharedBundleController.current.gameSignalingListener,
    );

    return () => {
      gamesSocket.current?.removeMessageListener(
        sharedBundleController.current.gameSignalingListener,
      );
    };
  }, [gamesSocket.current]);

  useEffect(() => {
    tableStaticContentSocket.current?.addMessageListener(
      sharedBundleController.current.handleTableStaticContentMessage,
    );

    return () => {
      tableStaticContentSocket.current?.removeMessageListener(
        sharedBundleController.current.handleTableStaticContentMessage,
      );
    };
  }, [tableStaticContentSocket.current, liveTextEditingSocket.current]);

  return (
    <div
      ref={sharedBundleRef}
      id={`${username.current}_shared_bundle_container`}
      className="pointer-events-none absolute left-0 top-0 h-full w-full"
    >
      {staticContentMedia.current.games.snake &&
        Object.keys(staticContentMedia.current.games.snake).length !== 0 &&
        Object.keys(staticContentMedia.current.games.snake).map(
          (snakeGameId) => (
            <Suspense key={snakeGameId} fallback={<div>Loading...</div>}>
              <SnakeGame
                snakeGameId={snakeGameId}
                sharedBundleRef={sharedBundleRef}
              />
            </Suspense>
          ),
        )}
      {Object.keys(staticContentMedia.current.video.tableInstances).length !==
        0 &&
        Object.keys(staticContentMedia.current.video.tableInstances).map(
          (videoInstanceId) => (
            <Suspense key={videoInstanceId} fallback={<div>Loading...</div>}>
              <FgTableVideo
                videoInstanceId={videoInstanceId}
                bundleRef={sharedBundleRef}
                tableRef={tableRef}
                videoContentMute={videoContentMute}
              />
            </Suspense>
          ),
        )}
      {Object.keys(staticContentMedia.current.image.tableInstances).length !==
        0 &&
        Object.keys(staticContentMedia.current.image.tableInstances).map(
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
      {Object.keys(staticContentMedia.current.svg.tableInstances).length !==
        0 &&
        Object.keys(staticContentMedia.current.svg.tableInstances).map(
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
      {Object.keys(staticContentMedia.current.application.tableInstances)
        .length !== 0 &&
        Object.keys(staticContentMedia.current.application.tableInstances).map(
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
      {Object.keys(staticContentMedia.current.text.tableInstances).length !==
        0 &&
        Object.keys(staticContentMedia.current.text.tableInstances).map(
          (textInstanceId) => (
            <Suspense key={textInstanceId} fallback={<div>Loading...</div>}>
              <FgText
                textInstanceId={textInstanceId}
                bundleRef={sharedBundleRef}
                tableRef={tableRef}
                tableTopRef={tableTopRef}
              />
            </Suspense>
          ),
        )}
    </div>
  );
}
