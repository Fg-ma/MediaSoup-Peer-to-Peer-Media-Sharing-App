import React, { useState, useEffect, useRef, Suspense } from "react";
import { Socket } from "socket.io-client";
import { Transition, Variants, motion } from "framer-motion";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../../context/streamsContext/typeConstant";
import TintSection from "./lib/TintSection";
import BlurButtton from "./lib/BlurButton";
import {
  HideBackgroundEffectTypes,
  PostProcessEffects,
} from "../../../context/effectsStylesContext/typeConstant";

const BabylonPostProcessEffectsButton = React.lazy(
  () => import("./lib/BabylonPostProcessEffectsButton")
);
const HideBackgroundButton = React.lazy(
  () => import("./lib/HideBackgroundButton")
);
const GlassesButton = React.lazy(() => import("./lib/GlassesButton"));
const BeardsButton = React.lazy(() => import("./lib/BeardsButton"));
const MustachesButton = React.lazy(() => import("./lib/MustachesButton"));
const MasksButton = React.lazy(() => import("./lib/MasksButton"));
const HatsButton = React.lazy(() => import("./lib/HatsButton"));
const PetsButton = React.lazy(() => import("./lib/PetsButton"));

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
  socket,
  isUser,
  acceptsVisualEffects,
  visualMediaContainerRef,
  handleVisualEffectChange,
  tintColor,
}: {
  username: string;
  instance: string;
  type: "camera" | "screen";
  visualMediaId: string;
  socket: React.MutableRefObject<Socket>;
  isUser: boolean;
  acceptsVisualEffects: boolean;
  visualMediaContainerRef: React.RefObject<HTMLDivElement>;
  handleVisualEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean,
    hideBackgroundStyle?: HideBackgroundEffectTypes,
    hideBackgroundColor?: string,
    postProcessStyle?: PostProcessEffects
  ) => Promise<void>;
  tintColor: React.MutableRefObject<string>;
}) {
  const [_, setRerender] = useState(0);
  const [effectsWidth, setEffectsWidth] = useState(0);
  const [effectsDisabled, setEffectsDisabled] = useState(false);

  const [overflowingXDirection, setOverflowingXDirection] = useState(false);
  const effectsContainerRef = useRef<HTMLDivElement>(null);

  const updateWidth = () => {
    if (visualMediaContainerRef.current) {
      const newEffectsWidth = visualMediaContainerRef.current.clientWidth * 0.9;

      setEffectsWidth(newEffectsWidth);

      if (effectsContainerRef.current) {
        setOverflowingXDirection(
          effectsContainerRef.current.scrollWidth > newEffectsWidth
        );
      }
    }
  };

  useEffect(() => {
    updateWidth();
  }, [visualMediaContainerRef.current?.clientWidth]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.stopPropagation();
      event.preventDefault();

      if (effectsContainerRef.current) {
        effectsContainerRef.current.scrollLeft += event.deltaY;
      }
    };

    socket.current.on("message", handleMessage);

    effectsContainerRef.current?.addEventListener("wheel", handleWheel);

    window.addEventListener("resize", updateWidth);

    return () => {
      socket.current.off("message", handleMessage);
      effectsContainerRef.current?.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  const handleMessage = (
    event:
      | {
          type: "effectChangeRequested";
          requestedProducerId: string;
        }
      | {
          type: "clientEffectChanged";
          username: string;
          instance: string;
          producerId: string;
        }
  ) => {
    switch (event.type) {
      case "effectChangeRequested":
        if (
          visualMediaId === event.requestedProducerId &&
          acceptsVisualEffects
        ) {
          setRerender((prev) => prev + 1);
        }
        break;
      case "clientEffectChanged":
        if (
          !isUser &&
          username === event.username &&
          instance === event.instance &&
          visualMediaId === event.producerId
        ) {
          setRerender((prev) => prev + 1);
        }
        break;
      default:
        break;
    }
  };

  return (
    <motion.div
      ref={effectsContainerRef}
      className={`${
        overflowingXDirection ? "" : "pb-2"
      } tiny-horizontal-scroll-bar left-1/2 h-max overflow-x-auto rounded mb-5 border-2 border-fg-black-45 border-opacity-90 bg-fg-black-10 bg-opacity-90 shadow-xl flex space-x-1 px-2 pt-2 absolute bottom-full items-center`}
      style={{
        width: effectsWidth,
      }}
      variants={EffectSectionVar}
      initial='init'
      animate='animate'
      exit='init'
      transition={EffectSectionTransition}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <BabylonPostProcessEffectsButton
          username={username}
          instance={instance}
          type={type}
          visualMediaId={visualMediaId}
          isUser={isUser}
          handleVisualEffectChange={handleVisualEffectChange}
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
        />
        <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      </Suspense>
      {type === "camera" && (
        <Suspense fallback={<div>Loading...</div>}>
          <HideBackgroundButton
            username={username}
            instance={instance}
            type={type}
            visualMediaId={visualMediaId}
            isUser={isUser}
            handleVisualEffectChange={handleVisualEffectChange}
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
            scrollingContainerRef={effectsContainerRef}
          />
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
        </Suspense>
      )}
      <BlurButtton
        username={username}
        instance={instance}
        type={type}
        visualMediaId={visualMediaId}
        isUser={isUser}
        handleVisualEffectChange={handleVisualEffectChange}
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <TintSection
        username={username}
        instance={instance}
        type={type}
        visualMediaId={visualMediaId}
        isUser={isUser}
        handleVisualEffectChange={handleVisualEffectChange}
        tintColor={tintColor}
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
        scrollingContainerRef={effectsContainerRef}
      />
      {type === "camera" && (
        <Suspense fallback={<div>Loading...</div>}>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <GlassesButton
            username={username}
            instance={instance}
            type={type}
            visualMediaId={visualMediaId}
            isUser={isUser}
            handleVisualEffectChange={handleVisualEffectChange}
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
            scrollingContainerRef={effectsContainerRef}
          />
        </Suspense>
      )}
      {type === "camera" && (
        <Suspense fallback={<div>Loading...</div>}>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <BeardsButton
            username={username}
            instance={instance}
            handleVisualEffectChange={handleVisualEffectChange}
            type={type}
            visualMediaId={visualMediaId}
            isUser={isUser}
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
            scrollingContainerRef={effectsContainerRef}
          />
        </Suspense>
      )}
      {type === "camera" && (
        <Suspense fallback={<div>Loading...</div>}>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <MustachesButton
            username={username}
            instance={instance}
            type={type}
            visualMediaId={visualMediaId}
            isUser={isUser}
            handleVisualEffectChange={handleVisualEffectChange}
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
            scrollingContainerRef={effectsContainerRef}
          />
        </Suspense>
      )}
      {type === "camera" && (
        <Suspense fallback={<div>Loading...</div>}>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <MasksButton
            username={username}
            instance={instance}
            type={type}
            visualMediaId={visualMediaId}
            isUser={isUser}
            handleVisualEffectChange={handleVisualEffectChange}
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
            scrollingContainerRef={effectsContainerRef}
          />
        </Suspense>
      )}
      {type === "camera" && (
        <Suspense fallback={<div>Loading...</div>}>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <HatsButton
            username={username}
            instance={instance}
            type={type}
            visualMediaId={visualMediaId}
            isUser={isUser}
            handleVisualEffectChange={handleVisualEffectChange}
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
            scrollingContainerRef={effectsContainerRef}
          />
        </Suspense>
      )}
      {type === "camera" && (
        <Suspense fallback={<div>Loading...</div>}>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <PetsButton
            username={username}
            instance={instance}
            type={type}
            visualMediaId={visualMediaId}
            isUser={isUser}
            handleVisualEffectChange={handleVisualEffectChange}
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
            scrollingContainerRef={effectsContainerRef}
          />
        </Suspense>
      )}
    </motion.div>
  );
}
