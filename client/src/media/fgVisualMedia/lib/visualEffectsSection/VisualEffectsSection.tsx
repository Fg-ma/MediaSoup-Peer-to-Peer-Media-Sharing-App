import React, {
  useState,
  useEffect,
  useRef,
  Suspense,
  useLayoutEffect,
} from "react";
import { Transition, Variants, motion } from "framer-motion";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
  HideBackgroundEffectTypes,
  PostProcessEffectTypes,
} from "../../../../context/effectsContext/typeConstant";
import { useEffectsContext } from "../../../../context/effectsContext/EffectsContext";
import { useSocketContext } from "../../../../context/socketContext/SocketContext";
import { useMediaContext } from "../../../../context/mediaContext/MediaContext";
import { IncomingMediasoupMessages } from "../../../../serverControllers/mediasoupServer/MediasoupSocketController";
import HideBackgroundButton from "../../../../elements/effectsButtons/HideBackgroundButton";
import TintSection from "../../../../elements/effectsButtons/TintSection";
import BlurButtton from "../../../../elements/effectsButtons/BlurButton";

const BabylonPostProcessEffectsButton = React.lazy(
  () =>
    import(
      "../../../../elements/effectsButtons/BabylonPostProcessEffectsButton"
    )
);
const GlassesButton = React.lazy(
  () => import("../../../../elements/effectsButtons/GlassesButton")
);
const BeardsButton = React.lazy(
  () => import("../../../../elements/effectsButtons/BeardsButton")
);
const MustachesButton = React.lazy(
  () => import("../../../../elements/effectsButtons/MustachesButton")
);
const MasksButton = React.lazy(
  () => import("../../../../elements/effectsButtons/MasksButton")
);
const HatsButton = React.lazy(
  () => import("../../../../elements/effectsButtons/HatsButton")
);
const PetsButton = React.lazy(
  () => import("../../../../elements/effectsButtons/PetsButton")
);

const EffectSectionVar: Variants = {
  init: { opacity: 0, scale: 0.8, translate: "-50%" },
  animate: {
    opacity: 1,
    scale: 1,
    translate: "-50%",
    transition: {
      scale: { type: "spring", stiffness: 80 },
    },
  },
};

const EffectSectionTransition: Transition = {
  transition: {
    opacity: { duration: 0.2, delay: 0.0 },
  },
};

export default function VisualEffectsSection({
  username,
  instance,
  type,
  visualMediaId,
  isUser,
  acceptsVisualEffects,
  handleVisualEffectChange,
  tintColor,
  visualMediaContainerRef,
}: {
  username: string;
  instance: string;
  type: "camera" | "screen";
  visualMediaId: string;
  isUser: boolean;
  acceptsVisualEffects: boolean;
  handleVisualEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean,
    hideBackgroundStyle?: HideBackgroundEffectTypes,
    hideBackgroundColor?: string,
    postProcessStyle?: PostProcessEffectTypes
  ) => Promise<void>;
  tintColor: React.MutableRefObject<string>;
  visualMediaContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const { mediasoupSocket } = useSocketContext();
  const { userMedia } = useMediaContext();
  const {
    userEffectsStyles,
    remoteEffectsStyles,
    userStreamEffects,
    remoteStreamEffects,
  } = useEffectsContext();

  const [effectsDisabled, setEffectsDisabled] = useState(false);

  const effectsContainerRef = useRef<HTMLDivElement>(null);
  const subEffectsContainerRef = useRef<HTMLDivElement>(null);

  const overflow = useRef(false);

  const [_, setRerender] = useState(false);

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
          !isUser &&
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

  useLayoutEffect(() => {
    if (!visualMediaContainerRef.current) {
      return;
    }

    const observer = new ResizeObserver(() => {
      if (effectsContainerRef.current && subEffectsContainerRef.current) {
        overflow.current =
          effectsContainerRef.current.clientWidth <
          subEffectsContainerRef.current.clientWidth;
        setRerender((prev) => !prev);
      }
    });

    observer.observe(visualMediaContainerRef.current);

    if (effectsContainerRef.current && subEffectsContainerRef.current) {
      overflow.current =
        effectsContainerRef.current.clientWidth <
        subEffectsContainerRef.current.clientWidth;
      setRerender((prev) => !prev);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={effectsContainerRef}
      className='flex small-horizontal-scroll-bar z-30 w-full max-w-full left-1/2 rounded absolute items-center pointer-events-auto'
      style={{
        bottom: overflow.current
          ? "calc(max(1.5rem, min(13% + 1rem, 3rem)))"
          : "calc(max(2rem, min(13% + 0.5rem, 3.5rem)))",
        height: overflow.current ? "calc(1.75rem + 10%)" : "10%",
        maxHeight: overflow.current ? "6.75rem" : "5rem",
        minHeight: overflow.current ? "4.75rem" : "3rem",
        overflowX: overflow.current ? "auto" : "hidden",
        justifyContent: overflow.current ? "flex-start" : "center",
      }}
      variants={EffectSectionVar}
      initial='init'
      animate='animate'
      exit='init'
      transition={EffectSectionTransition}
    >
      <div
        ref={subEffectsContainerRef}
        className='flex h-full w-max items-center justify-center px-4 space-x-2'
      >
        <BabylonPostProcessEffectsButton
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
          streamEffects={
            isUser
              ? userStreamEffects.current[type][visualMediaId].postProcess
              : remoteStreamEffects.current[username][instance][type][
                  visualMediaId
                ].postProcess
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
              ].babylonScene.babylonShaderController.swapPostProcessEffects(
                effectsStyles.style
              );
            }

            await handleVisualEffectChange(
              "postProcess",
              false,
              undefined,
              undefined,
              effectsStyles.style
            );
          }}
          holdFunctionCallback={async (effectType) => {
            const streamEffects = isUser
              ? userStreamEffects.current[type][visualMediaId].postProcess
              : remoteStreamEffects.current[username][instance][type][
                  visualMediaId
                ].postProcess;
            const effectsStyles = isUser
              ? userEffectsStyles.current[type][visualMediaId].postProcess
              : remoteEffectsStyles.current[username][instance][type][
                  visualMediaId
                ].postProcess;

            effectsStyles.style = effectType;

            if (isUser) {
              userMedia.current[type][
                visualMediaId
              ].babylonScene.babylonShaderController.swapPostProcessEffects(
                effectType
              );
            }

            await handleVisualEffectChange(
              "postProcess",
              streamEffects,
              undefined,
              undefined,
              effectType
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
                  ? userStreamEffects.current[type][visualMediaId]
                      .hideBackground
                  : remoteStreamEffects.current[username][instance][type][
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
                  ].babylonScene.babylonRenderLoop.swapHideBackgroundEffectImage(
                    effectsStyles.style
                  );
                }

                await handleVisualEffectChange(
                  "hideBackground",
                  false,
                  effectsStyles.style
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
                  ? userStreamEffects.current[type][visualMediaId]
                      .hideBackground
                  : remoteStreamEffects.current[username][instance][type][
                      visualMediaId
                    ].hideBackground;

                effectsStyles.style = effectType;
                if (isUser) {
                  userMedia.current[type][
                    visualMediaId
                  ].babylonScene.babylonRenderLoop.swapHideBackgroundEffectImage(
                    effectType
                  );
                }

                await handleVisualEffectChange(
                  "hideBackground",
                  streamEffects,
                  effectType,
                  undefined
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
                  ? userStreamEffects.current[type][visualMediaId]
                      .hideBackground
                  : remoteStreamEffects.current[username][instance][type][
                      visualMediaId
                    ].hideBackground;

                if (isUser) {
                  userMedia.current[type][
                    visualMediaId
                  ].babylonScene.babylonRenderLoop.swapHideBackgroundContextFillColor(
                    color
                  );
                }

                if (effectsStyles.style !== "color" || !streamEffects) {
                  effectsStyles.style = "color";
                  effectsStyles.color = color;

                  await handleVisualEffectChange(
                    "hideBackground",
                    streamEffects,
                    undefined,
                    color
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
              ? userStreamEffects.current[type][visualMediaId].blur
              : remoteStreamEffects.current[username][instance][type][
                  visualMediaId
                ].blur
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
              ? userStreamEffects.current[type][visualMediaId].tint
              : remoteStreamEffects.current[username][instance][type][
                  visualMediaId
                ].tint
          }
          clickFunctionCallback={async () => {
            await handleVisualEffectChange("tint");
          }}
          acceptColorCallback={async () => {
            await handleVisualEffectChange(
              "tint",
              isUser
                ? userStreamEffects.current[type][visualMediaId].tint
                : remoteStreamEffects.current[username][instance][type][
                    visualMediaId
                  ].tint
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
                  ? userStreamEffects.current[type][visualMediaId].glasses
                  : remoteStreamEffects.current[username][instance][type][
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
                    ? userStreamEffects.current[type][visualMediaId].glasses
                    : remoteStreamEffects.current[username][instance][type][
                        visualMediaId
                      ].glasses
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
                  ? userStreamEffects.current[type][visualMediaId].beards
                  : remoteStreamEffects.current[username][instance][type][
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
                    ? userStreamEffects.current[type][visualMediaId].beards
                    : remoteStreamEffects.current[username][instance][type][
                        visualMediaId
                      ].beards
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
                  ? userStreamEffects.current[type][visualMediaId].mustaches
                  : remoteStreamEffects.current[username][instance][type][
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
                    ? userStreamEffects.current[type][visualMediaId].mustaches
                    : remoteStreamEffects.current[username][instance][type][
                        visualMediaId
                      ].mustaches
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
                  ? userStreamEffects.current[type][visualMediaId].masks
                  : remoteStreamEffects.current[username][instance][type][
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
                    ? userStreamEffects.current[type][visualMediaId].masks
                    : remoteStreamEffects.current[username][instance][type][
                        visualMediaId
                      ].masks
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
                  ? userStreamEffects.current[type][visualMediaId].hats
                  : remoteStreamEffects.current[username][instance][type][
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
                    ? userStreamEffects.current[type][visualMediaId].hats
                    : remoteStreamEffects.current[username][instance][type][
                        visualMediaId
                      ].hats
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
                  ? userStreamEffects.current[type][visualMediaId].pets
                  : remoteStreamEffects.current[username][instance][type][
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
                    ? userStreamEffects.current[type][visualMediaId].pets
                    : remoteStreamEffects.current[username][instance][type][
                        visualMediaId
                      ].pets
                );
              }}
            />
          </Suspense>
        )}
      </div>
    </motion.div>
  );
}
