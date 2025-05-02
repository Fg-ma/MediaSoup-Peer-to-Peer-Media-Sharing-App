import React, { Suspense } from "react";
import { AudioEffectTypes } from "../../../../../universal/effectsTypeConstant";
import { useMediaContext } from "../../../context/mediaContext/MediaContext";
import { usePermissionsContext } from "../../../context/permissionsContext/PermissionsContext";
import { useUserInfoContext } from "../../../context/userInfoContext/UserInfoContext";
import { useSocketContext } from "../../../context/socketContext/SocketContext";
import GamesSection from "../gamesSection/GamesSection";
import FgBackgroundSelector from "../../../elements/fgBackgroundSelector/FgBackgroundSelector";
import TableGridButton from "../tableGridButton/TableGridButton";
import { FgBackground } from "../../../elements/fgBackgroundSelector/lib/typeConstant";
import TableGridSizeButton from "../tableGrisSizeButton/TableGridSizeButton";
import FgPanel from "../../../elements/fgPanel/FgPanel";
import CaptureMediaButton from "../captureMediaButton/CaptureMediaButton";
import TabledSection from "../tabledSection/TabledSection";

const AudioEffectsButton = React.lazy(
  () => import("../../../audioEffectsButton/AudioEffectsButton"),
);

export default function MoreTableFunctionsSection({
  tableTopRef,
  moreTableFunctionsButtonRef,
  moreTableFunctionsPanelRef,
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
  captureMediaActive,
  setCaptureMediaActive,
  gamesSectionRef,
  tableBackgroundSectionRef,
  gridSizeSectionRef,
  tabledActive,
  setTabledActive,
}: {
  tableTopRef: React.RefObject<HTMLDivElement>;
  moreTableFunctionsButtonRef: React.RefObject<HTMLButtonElement>;
  moreTableFunctionsPanelRef: React.RefObject<HTMLDivElement>;
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
  captureMediaActive: boolean;
  setCaptureMediaActive: React.Dispatch<React.SetStateAction<boolean>>;
  gamesSectionRef: React.RefObject<HTMLDivElement>;
  tableBackgroundSectionRef: React.RefObject<HTMLDivElement>;
  gridSizeSectionRef: React.RefObject<HTMLDivElement>;
  tabledActive: boolean;
  setTabledActive: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { userMedia } = useMediaContext();
  const { permissions } = usePermissionsContext();
  const { mediasoupSocket, tableSocket } = useSocketContext();
  const { tableId, username, instance } = useUserInfoContext();

  const handleExternalAudioEffectChange = (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
    effect: AudioEffectTypes,
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
          tableId: tableId.current,
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
      externalRef={moreTableFunctionsPanelRef}
      content={
        <div className="small-vertical-scroll-bar h-full w-full overflow-y-auto">
          <div className="my-2 grid h-max w-full grid-cols-3 gap-3">
            <TabledSection
              tabledActive={tabledActive}
              setTabledActive={setTabledActive}
            />
            <FgBackgroundSelector
              externalPanelRef={tableBackgroundSectionRef}
              backgroundRef={tableTopRef}
              defaultActiveBackground={tableBackground}
              backgroundChangeFunction={(background: FgBackground) => {
                if (externalBackgroundChange.current) {
                  externalBackgroundChange.current = false;
                } else {
                  tableSocket.current?.changeTableBackground(background);
                }
              }}
              hoverType="above"
            />
            <CaptureMediaButton
              captureMediaActive={captureMediaActive}
              setCaptureMediaActive={setCaptureMediaActive}
              setMoreTableFunctionsActive={setMoreTableFunctionsActive}
            />
            <GamesSection gamesSectionRef={gamesSectionRef} />
            <TableGridButton
              gridActive={gridActive}
              setGridActive={setGridActive}
            />
            <TableGridSizeButton
              gridSize={gridSize}
              setGridSize={setGridSize}
              gridSizeSectionRef={gridSizeSectionRef}
            />
            {isAudio.current && (
              <Suspense fallback={<div>Loading...</div>}>
                <AudioEffectsButton
                  tableId={tableId.current}
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
                    color: "#d6d6d6",
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
      closePosition="topRight"
      shadow={{ top: true, bottom: true }}
      backgroundColor={"#161616"}
      secondaryBackgroundColor={"#212121"}
    />
  );
}
