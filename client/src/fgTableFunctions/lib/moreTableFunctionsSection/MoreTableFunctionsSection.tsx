import React, { Suspense } from "react";
import GamesSection from "../gamesSection/GamesSection";
import FgBackgroundSelector from "../../../fgElements/fgBackgroundSelector/FgBackgroundSelector";
import TableGridButton from "../tableGridButton/TableGridButton";
import { FgBackground } from "../../../fgElements/fgBackgroundSelector/lib/typeConstant";
import { AudioEffectTypes } from "../../../context/effectsContext/typeConstant";
import { useMediaContext } from "../../../context/mediaContext/MediaContext";
import { usePermissionsContext } from "../../../context/permissionsContext/PermissionsContext";
import { useSocketContext } from "../../../context/socketContext/SocketContext";
import TableGridSizeButton from "../tableGrisSizeButton/TableGridSizeButton";

const AudioEffectsButton = React.lazy(
  () => import("../../../audioEffectsButton/AudioEffectsButton")
);

export default function MoreTableFunctionsSection({
  table_id,
  username,
  instance,
  tableTopRef,
  mutedAudioRef,
  isAudio,
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
  mutedAudioRef: React.MutableRefObject<boolean>;
  isAudio: React.MutableRefObject<boolean>;
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
    <div className='mb-2 grid grid-cols-3 w-[24vw] h-80 bg-white p-3 gap-2'>
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
      />
      <TableGridButton gridActive={gridActive} setGridActive={setGridActive} />
      <TableGridSizeButton gridSize={gridSize} setGridSize={setGridSize} />
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
            options={{ color: "black", placement: "below" }}
          />
        </Suspense>
      )}
    </div>
  );
}
