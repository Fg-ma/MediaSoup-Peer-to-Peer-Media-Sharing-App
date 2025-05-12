import React, { useState, useEffect, useRef, Suspense } from "react";
import {
  CameraEffectTypes,
  HideBackgroundEffectTypes,
  PostProcessEffectTypes,
} from "../../../../../../../../../../universal/effectsTypeConstant";
import { useEffectsContext } from "../../../../../../../../context/effectsContext/EffectsContext";
import { useSocketContext } from "../../../../../../../../context/socketContext/SocketContext";
import { useMediaContext } from "../../../../../../../../context/mediaContext/MediaContext";
import { useUserInfoContext } from "../../../../../../../../context/userInfoContext/UserInfoContext";
import { IncomingMediasoupMessages } from "../../../../../../../../serverControllers/mediasoupServer/lib/typeConstant";
import HideBackgroundButton from "../../../../../../../../elements/effectsButtons/HideBackgroundButton";
import TintSection from "../../../../../../../../elements/effectsButtons/TintSection";
import BlurButtton from "../../../../../../../../elements/effectsButtons/BlurButton";
import ClearAllButton from "../../../../../../../../elements/effectsButtons/ClearAllButton";
import CameraMedia from "../../../../../../../../media/fgVisualMedia/CameraMedia";
import BabylonPostProcessEffectsButton from "../../../../../../../../elements/effectsButtons/BabylonPostProcessEffectsButton";

const GlassesButton = React.lazy(
  () => import("../../../../../../../../elements/effectsButtons/GlassesButton"),
);
const BeardsButton = React.lazy(
  () => import("../../../../../../../../elements/effectsButtons/BeardsButton"),
);
const MustachesButton = React.lazy(
  () =>
    import("../../../../../../../../elements/effectsButtons/MustachesButton"),
);
const MasksButton = React.lazy(
  () => import("../../../../../../../../elements/effectsButtons/MasksButton"),
);
const HatsButton = React.lazy(
  () => import("../../../../../../../../elements/effectsButtons/HatsButton"),
);
const PetsButton = React.lazy(
  () => import("../../../../../../../../elements/effectsButtons/PetsButton"),
);

export default function CameraEffectsSection({
  username,
  instance,
  type,
  visualMediaId,
  isUser,
  acceptsVisualEffects,
  cameraMedia,
}: {
  username: string;
  instance: string;
  type: "camera" | "screen";
  visualMediaId: string;
  isUser: boolean;
  acceptsVisualEffects: boolean;
  cameraMedia: CameraMedia | MediaStreamTrack;
}) {
  const { mediasoupSocket } = useSocketContext();
  const { userMedia } = useMediaContext();
  const { userEffectsStyles, remoteEffectsStyles, userEffects, remoteEffects } =
    useEffectsContext();
  const { tableId } = useUserInfoContext();

  const [effectsDisabled, setEffectsDisabled] = useState(false);

  const effectsContainerRef = useRef<HTMLDivElement>(null);
  const subEffectsContainerRef = useRef<HTMLDivElement>(null);

  const [_, setRerender] = useState(false);

  const tintColor = useRef(
    isUser
      ? userEffectsStyles.current.camera[visualMediaId].tint.color
      : remoteEffectsStyles.current[username][instance].camera[visualMediaId]
          .tint.color,
  );

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.stopPropagation();
      event.preventDefault();

      if (effectsContainerRef.current) {
        effectsContainerRef.current.scrollLeft += event.deltaY;
      }
    };

    mediasoupSocket.current?.addMessageListener(handleMessage);

    effectsContainerRef.current?.addEventListener("wheel", handleWheel);

    return () => {
      mediasoupSocket.current?.removeMessageListener(handleMessage);
      effectsContainerRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const handleMessage = (event: IncomingMediasoupMessages) => {
    switch (event.type) {
      case "effectChangeRequested":
        if (
          visualMediaId === event.header.requestedProducerId &&
          acceptsVisualEffects
        ) {
          setRerender((prev) => !prev);
        }
        break;
      case "clientEffectChanged":
        if (
          username === event.header.username &&
          instance === event.header.instance &&
          visualMediaId === event.header.producerId
        ) {
          setRerender((prev) => !prev);
        }
        break;
      default:
        break;
    }
  };

  const handleVisualEffect = async (
    effect: CameraEffectTypes,
    blockStateChange: boolean,
  ) => {
    if (cameraMedia instanceof CameraMedia) {
      if (!blockStateChange) {
        // Fill stream effects if state change isn't blocked
        userEffects.current.camera[visualMediaId][effect as CameraEffectTypes] =
          !userEffects.current.camera[visualMediaId][
            effect as CameraEffectTypes
          ];
      }

      cameraMedia.changeEffects(
        effect as CameraEffectTypes,
        tintColor.current,
        blockStateChange,
      );
    }
  };

  const handleVisualEffectChange = async (
    effect: CameraEffectTypes | "clearAll",
    blockStateChange: boolean = false,
    hideBackgroundStyle?: HideBackgroundEffectTypes,
    hideBackgroundColor?: string,
    postProcessStyle?: PostProcessEffectTypes,
  ) => {
    if (isUser) {
      await handleUserVisualEffectChange(effect, blockStateChange);
    } else {
      await handleRemoteVisualEffectChange(
        effect,
        blockStateChange,
        hideBackgroundStyle,
        hideBackgroundColor,
        postProcessStyle,
      );
    }
  };

  const handleUserVisualEffectChange = async (
    effect: CameraEffectTypes | "clearAll",
    blockStateChange: boolean = false,
  ) => {
    if (effect !== "clearAll") {
      handleVisualEffect(effect, blockStateChange);

      if (acceptsVisualEffects) {
        mediasoupSocket?.current?.sendMessage({
          type: "clientEffectChange",
          header: {
            tableId: tableId.current,
            username,
            instance,
            producerType: "camera",
            producerId: visualMediaId,
          },
          data: {
            effect: effect,
            effectStyle:
              // @ts-expect-error: ts can't infer type, visualMediaId, and effect are strictly enforces and exist
              userEffectsStyles.current.camera[visualMediaId][effect],
            blockStateChange: blockStateChange,
          },
        });
      }
    } else {
      if (cameraMedia instanceof CameraMedia) {
        cameraMedia.clearAllEffects();

        mediasoupSocket?.current?.sendMessage({
          type: "clientClearEffects",
          header: {
            tableId: tableId.current,
            username,
            instance,
            producerType: type,
            producerId: visualMediaId,
          },
        });
      }
    }
  };

  const handleRemoteVisualEffectChange = async (
    effect: CameraEffectTypes | "clearAll",
    blockStateChange: boolean = false,
    hideBackgroundStyle?: HideBackgroundEffectTypes,
    hideBackgroundColor?: string,
    postProcessStyle?: PostProcessEffectTypes,
  ) => {
    if (acceptsVisualEffects) {
      if (effect !== "clearAll") {
        mediasoupSocket?.current?.sendMessage({
          type: "requestEffectChange",
          header: {
            tableId: tableId.current,
            requestedUsername: username,
            requestedInstance: instance,
            requestedProducerType: type,
            requestedProducerId: visualMediaId,
          },
          data: {
            effect: effect,
            blockStateChange: blockStateChange,
            style:
              // @ts-expect-error: ts can't verify username, instance, type, visualMediaId, and effect correlate
              remoteEffectsStyles.current[username][instance][type][
                visualMediaId
              ][effect],
            hideBackgroundStyle: hideBackgroundStyle,
            hideBackgroundColor: hideBackgroundColor,
            postProcessStyle: postProcessStyle,
          },
        });
      } else {
        mediasoupSocket?.current?.sendMessage({
          type: "requestClearEffects",
          header: {
            tableId: tableId.current,
            requestedUsername: username,
            requestedInstance: instance,
            requestedProducerType: type,
            requestedProducerId: visualMediaId,
          },
        });
      }
    }
  };

  return (
    <div
      ref={effectsContainerRef}
      className="hide-scroll-bar flex h-12 w-full max-w-full items-center overflow-x-auto rounded"
    >
      <div
        ref={subEffectsContainerRef}
        className="flex h-full w-max items-center justify-center space-x-2 px-4"
      >
        <ClearAllButton
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={async () => {
            await handleVisualEffectChange("clearAll");
          }}
        />
        <BabylonPostProcessEffectsButton
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
          streamEffects={
            isUser
              ? userEffects.current[type][visualMediaId].postProcess
              : remoteEffects.current[username][instance][type][visualMediaId]
                  .postProcess
          }
          effectsStyles={
            isUser
              ? userEffectsStyles.current[type][visualMediaId].postProcess
              : remoteEffectsStyles.current[username][instance][type][
                  visualMediaId
                ].postProcess
          }
          clickFunctionCallback={async () => {
            const effectsStyles = isUser
              ? userEffectsStyles.current[type][visualMediaId].postProcess
              : remoteEffectsStyles.current[username][instance][type][
                  visualMediaId
                ].postProcess;

            if (isUser) {
              userMedia.current[type][
                visualMediaId
              ].babylonScene?.babylonShaderController.swapPostProcessEffects(
                effectsStyles.style,
              );
            }

            await handleVisualEffectChange(
              "postProcess",
              false,
              undefined,
              undefined,
              effectsStyles.style,
            );
          }}
          holdFunctionCallback={async (effectType) => {
            const streamEffects = isUser
              ? userEffects.current[type][visualMediaId].postProcess
              : remoteEffects.current[username][instance][type][visualMediaId]
                  .postProcess;
            const effectsStyles = isUser
              ? userEffectsStyles.current[type][visualMediaId].postProcess
              : remoteEffectsStyles.current[username][instance][type][
                  visualMediaId
                ].postProcess;

            effectsStyles.style = effectType;

            if (isUser) {
              userMedia.current[type][
                visualMediaId
              ].babylonScene?.babylonShaderController.swapPostProcessEffects(
                effectType,
              );
            }

            await handleVisualEffectChange(
              "postProcess",
              streamEffects,
              undefined,
              undefined,
              effectType,
            );
          }}
        />
        {type === "camera" && (
          <Suspense fallback={<div>Loading...</div>}>
            <HideBackgroundButton
              effectsDisabled={effectsDisabled}
              setEffectsDisabled={setEffectsDisabled}
              scrollingContainerRef={effectsContainerRef}
              streamEffects={
                isUser
                  ? userEffects.current[type][visualMediaId].hideBackground
                  : remoteEffects.current[username][instance][type][
                      visualMediaId
                    ].hideBackground
              }
              effectsStyles={
                isUser
                  ? userEffectsStyles.current[type][visualMediaId]
                      .hideBackground
                  : remoteEffectsStyles.current[username][instance][type][
                      visualMediaId
                    ].hideBackground
              }
              clickFunctionCallback={async () => {
                const effectsStyles = isUser
                  ? userEffectsStyles.current[type][visualMediaId]
                      .hideBackground
                  : remoteEffectsStyles.current[username][instance][type][
                      visualMediaId
                    ].hideBackground;

                if (isUser) {
                  userMedia.current[type][
                    visualMediaId
                  ].babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
                    effectsStyles.style,
                  );
                }

                await handleVisualEffectChange(
                  "hideBackground",
                  false,
                  effectsStyles.style,
                );
              }}
              holdFunctionCallback={async (effectType) => {
                const effectsStyles = isUser
                  ? userEffectsStyles.current[type][visualMediaId]
                      .hideBackground
                  : remoteEffectsStyles.current[username][instance][type][
                      visualMediaId
                    ].hideBackground;
                const streamEffects = isUser
                  ? userEffects.current[type][visualMediaId].hideBackground
                  : remoteEffects.current[username][instance][type][
                      visualMediaId
                    ].hideBackground;

                effectsStyles.style = effectType;
                if (isUser) {
                  userMedia.current[type][
                    visualMediaId
                  ].babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
                    effectType,
                  );
                }

                await handleVisualEffectChange(
                  "hideBackground",
                  streamEffects,
                  effectType,
                  undefined,
                );
              }}
              acceptColorCallback={async (color) => {
                const effectsStyles = isUser
                  ? userEffectsStyles.current[type][visualMediaId]
                      .hideBackground
                  : remoteEffectsStyles.current[username][instance][type][
                      visualMediaId
                    ].hideBackground;
                const streamEffects = isUser
                  ? userEffects.current[type][visualMediaId].hideBackground
                  : remoteEffects.current[username][instance][type][
                      visualMediaId
                    ].hideBackground;

                if (isUser) {
                  userMedia.current[type][
                    visualMediaId
                  ].babylonScene?.babylonRenderLoop.swapHideBackgroundContextFillColor(
                    color,
                  );
                }

                if (effectsStyles.style !== "color" || !streamEffects) {
                  effectsStyles.style = "color";
                  effectsStyles.color = color;

                  await handleVisualEffectChange(
                    "hideBackground",
                    streamEffects,
                    undefined,
                    color,
                  );
                }
              }}
            />
          </Suspense>
        )}
        <BlurButtton
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
          streamEffects={
            isUser
              ? userEffects.current[type][visualMediaId].blur
              : remoteEffects.current[username][instance][type][visualMediaId]
                  .blur
          }
          clickFunctionCallback={async () => {
            await handleVisualEffectChange("blur");
          }}
        />
        <TintSection
          tintColor={tintColor}
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
          streamEffects={
            isUser
              ? userEffects.current[type][visualMediaId].tint
              : remoteEffects.current[username][instance][type][visualMediaId]
                  .tint
          }
          clickFunctionCallback={async () => {
            await handleVisualEffectChange("tint");
          }}
          acceptColorCallback={async () => {
            await handleVisualEffectChange(
              "tint",
              isUser
                ? userEffects.current[type][visualMediaId].tint
                : remoteEffects.current[username][instance][type][visualMediaId]
                    .tint,
            );
          }}
        />
        {type === "camera" && (
          <Suspense fallback={<div>Loading...</div>}>
            <GlassesButton
              effectsDisabled={effectsDisabled}
              setEffectsDisabled={setEffectsDisabled}
              scrollingContainerRef={effectsContainerRef}
              streamEffects={
                isUser
                  ? userEffects.current[type][visualMediaId].glasses
                  : remoteEffects.current[username][instance][type][
                      visualMediaId
                    ].glasses
              }
              effectsStyles={
                isUser
                  ? userEffectsStyles.current[type][visualMediaId].glasses
                  : remoteEffectsStyles.current[username][instance][type][
                      visualMediaId
                    ].glasses
              }
              clickFunctionCallback={async () => {
                await handleVisualEffectChange("glasses");
              }}
              holdFunctionCallback={async (effectType) => {
                if (isUser) {
                  if (userEffectsStyles.current[type][visualMediaId].glasses) {
                    userEffectsStyles.current[type][
                      visualMediaId
                    ].glasses.style = effectType;
                  }
                } else {
                  if (
                    remoteEffectsStyles.current[username][instance][type][
                      visualMediaId
                    ].glasses
                  ) {
                    remoteEffectsStyles.current[username][instance][type][
                      visualMediaId
                    ].glasses.style = effectType;
                  }
                }

                await handleVisualEffectChange(
                  "glasses",
                  isUser
                    ? userEffects.current[type][visualMediaId].glasses
                    : remoteEffects.current[username][instance][type][
                        visualMediaId
                      ].glasses,
                );
              }}
            />
          </Suspense>
        )}
        {type === "camera" && (
          <Suspense fallback={<div>Loading...</div>}>
            <BeardsButton
              effectsDisabled={effectsDisabled}
              setEffectsDisabled={setEffectsDisabled}
              scrollingContainerRef={effectsContainerRef}
              streamEffects={
                isUser
                  ? userEffects.current[type][visualMediaId].beards
                  : remoteEffects.current[username][instance][type][
                      visualMediaId
                    ].beards
              }
              effectsStyles={
                isUser
                  ? userEffectsStyles.current[type][visualMediaId].beards
                  : remoteEffectsStyles.current[username][instance][type][
                      visualMediaId
                    ].beards
              }
              clickFunctionCallback={async () => {
                await handleVisualEffectChange("beards");
              }}
              holdFunctionCallback={async (effectType) => {
                if (isUser) {
                  if (userEffectsStyles.current[type][visualMediaId].beards) {
                    userEffectsStyles.current[type][
                      visualMediaId
                    ].beards.style = effectType;
                  }
                } else {
                  if (
                    remoteEffectsStyles.current[username][instance][type][
                      visualMediaId
                    ].beards
                  ) {
                    remoteEffectsStyles.current[username][instance][type][
                      visualMediaId
                    ].beards.style = effectType;
                  }
                }

                await handleVisualEffectChange(
                  "beards",
                  isUser
                    ? userEffects.current[type][visualMediaId].beards
                    : remoteEffects.current[username][instance][type][
                        visualMediaId
                      ].beards,
                );
              }}
            />
          </Suspense>
        )}
        {type === "camera" && (
          <Suspense fallback={<div>Loading...</div>}>
            <MustachesButton
              effectsDisabled={effectsDisabled}
              setEffectsDisabled={setEffectsDisabled}
              scrollingContainerRef={effectsContainerRef}
              streamEffects={
                isUser
                  ? userEffects.current[type][visualMediaId].mustaches
                  : remoteEffects.current[username][instance][type][
                      visualMediaId
                    ].mustaches
              }
              effectsStyles={
                isUser
                  ? userEffectsStyles.current[type][visualMediaId].mustaches
                  : remoteEffectsStyles.current[username][instance][type][
                      visualMediaId
                    ].mustaches
              }
              clickFunctionCallback={async () => {
                await handleVisualEffectChange("mustaches");
              }}
              holdFunctionCallback={async (effectType) => {
                if (isUser) {
                  if (
                    userEffectsStyles.current[type][visualMediaId].mustaches
                  ) {
                    userEffectsStyles.current[type][
                      visualMediaId
                    ].mustaches.style = effectType;
                  }
                } else {
                  if (
                    remoteEffectsStyles.current[username][instance][type][
                      visualMediaId
                    ].mustaches
                  ) {
                    remoteEffectsStyles.current[username][instance][type][
                      visualMediaId
                    ].mustaches.style = effectType;
                  }
                }

                await handleVisualEffectChange(
                  "mustaches",
                  isUser
                    ? userEffects.current[type][visualMediaId].mustaches
                    : remoteEffects.current[username][instance][type][
                        visualMediaId
                      ].mustaches,
                );
              }}
            />
          </Suspense>
        )}
        {type === "camera" && (
          <Suspense fallback={<div>Loading...</div>}>
            <MasksButton
              effectsDisabled={effectsDisabled}
              setEffectsDisabled={setEffectsDisabled}
              scrollingContainerRef={effectsContainerRef}
              streamEffects={
                isUser
                  ? userEffects.current[type][visualMediaId].masks
                  : remoteEffects.current[username][instance][type][
                      visualMediaId
                    ].masks
              }
              effectsStyles={
                isUser
                  ? userEffectsStyles.current[type][visualMediaId].masks
                  : remoteEffectsStyles.current[username][instance][type][
                      visualMediaId
                    ].masks
              }
              clickFunctionCallback={async () => {
                await handleVisualEffectChange("masks");
              }}
              holdFunctionCallback={async (effectType) => {
                if (isUser) {
                  if (userEffectsStyles.current[type][visualMediaId].masks) {
                    userEffectsStyles.current[type][visualMediaId].masks.style =
                      effectType;
                  }
                } else {
                  if (
                    remoteEffectsStyles.current[username][instance][type][
                      visualMediaId
                    ].masks
                  ) {
                    remoteEffectsStyles.current[username][instance][type][
                      visualMediaId
                    ].masks.style = effectType;
                  }
                }

                await handleVisualEffectChange(
                  "masks",
                  isUser
                    ? userEffects.current[type][visualMediaId].masks
                    : remoteEffects.current[username][instance][type][
                        visualMediaId
                      ].masks,
                );
              }}
            />
          </Suspense>
        )}
        {type === "camera" && (
          <Suspense fallback={<div>Loading...</div>}>
            <HatsButton
              effectsDisabled={effectsDisabled}
              setEffectsDisabled={setEffectsDisabled}
              scrollingContainerRef={effectsContainerRef}
              streamEffects={
                isUser
                  ? userEffects.current[type][visualMediaId].hats
                  : remoteEffects.current[username][instance][type][
                      visualMediaId
                    ].hats
              }
              effectsStyles={
                isUser
                  ? userEffectsStyles.current[type][visualMediaId].hats
                  : remoteEffectsStyles.current[username][instance][type][
                      visualMediaId
                    ].hats
              }
              clickFunctionCallback={async () => {
                await handleVisualEffectChange("hats");
              }}
              holdFunctionCallback={async (effectType) => {
                if (isUser) {
                  if (userEffectsStyles.current[type][visualMediaId].hats) {
                    userEffectsStyles.current[type][visualMediaId].hats.style =
                      effectType;
                  }
                } else {
                  if (
                    remoteEffectsStyles.current[username][instance][type][
                      visualMediaId
                    ].hats
                  ) {
                    remoteEffectsStyles.current[username][instance][type][
                      visualMediaId
                    ].hats.style = effectType;
                  }
                }

                await handleVisualEffectChange(
                  "hats",
                  isUser
                    ? userEffects.current[type][visualMediaId].hats
                    : remoteEffects.current[username][instance][type][
                        visualMediaId
                      ].hats,
                );
              }}
            />
          </Suspense>
        )}
        {type === "camera" && (
          <Suspense fallback={<div>Loading...</div>}>
            <PetsButton
              effectsDisabled={effectsDisabled}
              setEffectsDisabled={setEffectsDisabled}
              scrollingContainerRef={effectsContainerRef}
              streamEffects={
                isUser
                  ? userEffects.current[type][visualMediaId].pets
                  : remoteEffects.current[username][instance][type][
                      visualMediaId
                    ].pets
              }
              effectsStyles={
                isUser
                  ? userEffectsStyles.current[type][visualMediaId].pets
                  : remoteEffectsStyles.current[username][instance][type][
                      visualMediaId
                    ].pets
              }
              clickFunctionCallback={async () => {
                await handleVisualEffectChange("pets");
              }}
              holdFunctionCallback={async (effectType) => {
                if (isUser) {
                  if (userEffectsStyles.current[type][visualMediaId].pets) {
                    userEffectsStyles.current[type][visualMediaId].pets.style =
                      effectType;
                  }
                } else {
                  if (
                    remoteEffectsStyles.current[username][instance][type][
                      visualMediaId
                    ].pets
                  ) {
                    remoteEffectsStyles.current[username][instance][type][
                      visualMediaId
                    ].pets.style = effectType;
                  }
                }

                await handleVisualEffectChange(
                  "pets",
                  isUser
                    ? userEffects.current[type][visualMediaId].pets
                    : remoteEffects.current[username][instance][type][
                        visualMediaId
                      ].pets,
                );
              }}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
