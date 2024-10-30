import React, { useState, useEffect, useRef, Suspense } from "react";
import { Socket } from "socket.io-client";
import { Transition, Variants, motion } from "framer-motion";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../context/streamsContext/StreamsContext";
import TintSection from "./lib/TintSection";
import BlurButtton from "./lib/BlurButton";

const BabylonPostProcessEffectsButton = React.lazy(
  () =>
    import("../babylonPostProcessEffectsButton/BabylonPostProcessEffectsButton")
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
  init: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
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
  videoId,
  socket,
  isUser,
  acceptsVisualEffects,
  videoContainerRef,
  handleVisualEffectChange,
  tintColor,
}: {
  username: string;
  instance: string;
  type: "camera" | "screen";
  videoId: string;
  socket: React.MutableRefObject<Socket>;
  isUser: boolean;
  acceptsVisualEffects: boolean;
  videoContainerRef: React.RefObject<HTMLDivElement>;
  handleVisualEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;
  tintColor: React.MutableRefObject<string>;
}) {
  const [rerender, setRerender] = useState(0);
  const [effectsWidth, setEffectsWidth] = useState(0);
  const [effectsDisabled, setEffectsDisabled] = useState(false);

  const [overflowingXDirection, setOverflowingXDirection] = useState(false);
  const effectsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (videoContainerRef.current) {
        const newEffectsWidth = videoContainerRef.current.clientWidth * 0.9;

        setEffectsWidth(newEffectsWidth);

        if (effectsContainerRef.current) {
          setOverflowingXDirection(
            effectsContainerRef.current.scrollWidth > newEffectsWidth
          );
        }
      }
    };

    // Update width on mount
    updateWidth();

    // Add resize event listener
    window.addEventListener("resize", updateWidth);

    // Cleanup event listener on unmount
    return () => window.removeEventListener("resize", updateWidth);
  }, [videoContainerRef]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (effectsContainerRef.current) {
        effectsContainerRef.current.scrollLeft += event.deltaY;
      }
    };

    socket.current.on("message", handleMessage);

    effectsContainerRef.current?.addEventListener("wheel", handleWheel);

    return () => {
      socket.current.off("message", handleMessage);

      effectsContainerRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const handleMessage = (event: any) => {
    switch (event.type) {
      case "effectChangeRequested":
        if (videoId === event.requestedProducerId && acceptsVisualEffects) {
          setRerender((prev) => prev + 1);
        }
        break;
      case "clientEffectChanged":
        if (
          !isUser &&
          username === event.username &&
          instance === event.instance &&
          videoId === event.producerId
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
      } tiny-horizontal-scroll-bar overflow-x-auto rounded border mb-5 border-white border-opacity-75 bg-black bg-opacity-75 shadow-xl flex space-x-1 px-2 pt-2 absolute bottom-full items-center`}
      style={{
        width: effectsWidth,
        left: videoContainerRef.current
          ? `${
              ((videoContainerRef.current.clientWidth - effectsWidth) /
                2 /
                videoContainerRef.current.clientWidth) *
              100
            }%`
          : undefined,
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
          videoId={videoId}
          isUser={isUser}
          handleVisualEffectChange={handleVisualEffectChange}
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
        />
        <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      </Suspense>
      {type === "camera" && (
        <Suspense fallback={<div>Loading...</div>}>
          <HideBackgroundButton
            username={username}
            instance={instance}
            type={type}
            videoId={videoId}
            isUser={isUser}
            handleVisualEffectChange={handleVisualEffectChange}
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
          />
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
        </Suspense>
      )}
      <BlurButtton
        username={username}
        instance={instance}
        type={type}
        videoId={videoId}
        isUser={isUser}
        handleVisualEffectChange={handleVisualEffectChange}
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <TintSection
        username={username}
        instance={instance}
        type={type}
        videoId={videoId}
        isUser={isUser}
        handleVisualEffectChange={handleVisualEffectChange}
        tintColor={tintColor}
        effectsDisabled={effectsDisabled}
        setEffectsDisabled={setEffectsDisabled}
      />
      {type === "camera" && (
        <Suspense fallback={<div>Loading...</div>}>
          <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
          <GlassesButton
            username={username}
            instance={instance}
            type={type}
            videoId={videoId}
            isUser={isUser}
            handleVisualEffectChange={handleVisualEffectChange}
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
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
            videoId={videoId}
            isUser={isUser}
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
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
            videoId={videoId}
            isUser={isUser}
            handleVisualEffectChange={handleVisualEffectChange}
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
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
            videoId={videoId}
            isUser={isUser}
            handleVisualEffectChange={handleVisualEffectChange}
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
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
            videoId={videoId}
            isUser={isUser}
            handleVisualEffectChange={handleVisualEffectChange}
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
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
            videoId={videoId}
            isUser={isUser}
            handleVisualEffectChange={handleVisualEffectChange}
            effectsDisabled={effectsDisabled}
            setEffectsDisabled={setEffectsDisabled}
          />
        </Suspense>
      )}
    </motion.div>
  );
}
