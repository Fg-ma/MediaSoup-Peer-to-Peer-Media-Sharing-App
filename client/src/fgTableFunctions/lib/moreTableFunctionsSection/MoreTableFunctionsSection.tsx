import React, { Suspense } from "react";
import { AudioEffectTypes } from "../../../context/effectsContext/typeConstant";
import { useMediaContext } from "../../../context/mediaContext/MediaContext";
import { usePermissionsContext } from "../../../context/permissionsContext/PermissionsContext";
import { useSocketContext } from "../../../context/socketContext/SocketContext";
import GamesSection from "../gamesSection/GamesSection";
import FgBackgroundSelector from "../../../fgElements/fgBackgroundSelector/FgBackgroundSelector";
import TableGridButton from "../tableGridButton/TableGridButton";
import { FgBackground } from "../../../fgElements/fgBackgroundSelector/lib/typeConstant";
import TableGridSizeButton from "../tableGrisSizeButton/TableGridSizeButton";
import FgPanel from "../../../fgElements/fgPanel/FgPanel";

const AudioEffectsButton = React.lazy(
  () => import("../../../audioEffectsButton/AudioEffectsButton")
);

export default function MoreTableFunctionsSection({
  table_id,
  username,
  instance,
  tableTopRef,
  moreTableFunctionsButtonRef,
  mutedAudioRef,
  isAudio,
  setMoreTableFunctionsActive,
  gridActive,
  setGridActive,
  gridSize,
  setGridSize,
  audioEffectsActive,
  setAudioEffectsActive,
  tableBackground,
  externalBackgroundChange,
  handleExternalMute,
}: {
  table_id: React.MutableRefObject<string>;
  username: React.MutableRefObject<string>;
  instance: React.MutableRefObject<string>;
  tableTopRef: React.RefObject<HTMLDivElement>;
  moreTableFunctionsButtonRef: React.RefObject<HTMLButtonElement>;
  mutedAudioRef: React.MutableRefObject<boolean>;
  isAudio: React.MutableRefObject<boolean>;
  setMoreTableFunctionsActive: React.Dispatch<React.SetStateAction<boolean>>;
  gridActive: boolean;
  setGridActive: React.Dispatch<React.SetStateAction<boolean>>;
  gridSize: {
    rows: number;
    cols: number;
  };
  setGridSize: React.Dispatch<
    React.SetStateAction<{
      rows: number;
      cols: number;
    }>
  >;
  audioEffectsActive: boolean;
  setAudioEffectsActive: React.Dispatch<React.SetStateAction<boolean>>;
  tableBackground: FgBackground | undefined;
  externalBackgroundChange: React.MutableRefObject<boolean>;
  handleExternalMute: () => void;
}) {
  const { userMedia } = useMediaContext();
  const { permissions } = usePermissionsContext();
  const { mediasoupSocket, tableSocket } = useSocketContext();

  const handleExternalAudioEffectChange = (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
    effect: AudioEffectTypes
  ) => {
    if (producerType === "audio") {
      userMedia.current.audio?.changeEffects(effect, false);
    } else if (producerType === "screenAudio" && producerId) {
      userMedia.current.screenAudio[producerId].changeEffects(effect, false);
    }

    if (permissions.current.acceptsAudioEffects) {
      mediasoupSocket.current?.sendMessage({
        type: "clientEffectChange",
        header: {
          table_id: table_id.current,
          username: username.current,
          instance: instance.current,
          producerType,
          producerId,
        },
        data: {
          effect: effect,
          blockStateChange: false,
        },
      });
    }
  };

  return (
    <FgPanel
      content={
        <div className='w-full h-full overflow-y-auto small-vertical-scroll-bar'>
          <div className='grid grid-cols-3 w-full my-2 h-max gap-3'>
            <GamesSection
              table_id={table_id.current}
              username={username.current}
              instance={instance.current}
            />
            <FgBackgroundSelector
              backgroundRef={tableTopRef}
              defaultActiveBackground={tableBackground}
              backgroundChangeFunction={(background: FgBackground) => {
                if (externalBackgroundChange.current) {
                  externalBackgroundChange.current = false;
                } else {
                  tableSocket.current?.changeTableBackground(background);
                }
              }}
              hoverType='above'
            />
            <TableGridButton
              gridActive={gridActive}
              setGridActive={setGridActive}
            />
            <TableGridSizeButton
              gridSize={gridSize}
              setGridSize={setGridSize}
            />
            {isAudio.current && (
              <Suspense fallback={<div>Loading...</div>}>
                <AudioEffectsButton
                  table_id={table_id.current}
                  username={username.current}
                  instance={instance.current}
                  isUser={true}
                  permissions={permissions.current}
                  producerType={"audio"}
                  producerId={undefined}
                  audioEffectsActive={audioEffectsActive}
                  setAudioEffectsActive={setAudioEffectsActive}
                  handleAudioEffectChange={handleExternalAudioEffectChange}
                  handleMute={handleExternalMute}
                  muteStateRef={mutedAudioRef}
                  options={{
                    color: "black",
                    placement: "below",
                    hoverTimeoutDuration: 750,
                  }}
                />
              </Suspense>
            )}
            {
              // Clock
              // Weather
              // compass
            }
          </div>
        </div>
      }
      initPosition={{
        referenceElement: moreTableFunctionsButtonRef.current ?? undefined,
        placement: "above",
        padding: 8,
      }}
      initWidth={"300px"}
      initHeight={"230px"}
      minWidth={200}
      minHeight={80}
      closeCallback={() => setMoreTableFunctionsActive(false)}
      closePosition='topRight'
      shadow={{ top: true, bottom: true }}
    />
  );
}
