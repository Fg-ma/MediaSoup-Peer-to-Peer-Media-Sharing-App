import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Transition, Variants, motion } from "framer-motion";
import LowerSvgController from "../lowerSvgControls/LowerSvgController";
import ClearAllButton from "../../../../elements/effectsButtons/ClearAllButton";
import SvgEffectButton from "./lib/SvgEffectButton";
import FgSVGElement from "../../../../elements/fgSVGElement/FgSVGElement";
import { useEffectsContext } from "../../../../context/effectsContext/EffectsContext";
import SvgMedia from "../../SvgMedia";
import ColorPickerButton from "../../../../elements/colorPickerButton/ColorPickerButton";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const blurIcon = nginxAssetServerBaseUrl + "svgs/visualEffects/blurIcon.svg";
const blurOffIcon =
  nginxAssetServerBaseUrl + "svgs/visualEffects/blurOffIcon.svg";
const colorOverlayIcon =
  nginxAssetServerBaseUrl + "svgs/svgEffects/colorOverlayIcon.svg";
const shadowIcon = nginxAssetServerBaseUrl + "svgs/svgEffects/shadowIcon.svg";
const shadowOffIcon =
  nginxAssetServerBaseUrl + "svgs/svgEffects/shadowOffIcon.svg";
const saturateIcon =
  nginxAssetServerBaseUrl + "svgs/svgEffects/saturateIcon.svg";
const neonGlowIcon =
  nginxAssetServerBaseUrl + "svgs/svgEffects/neonGlowIcon.svg";
const waveDistortionIcon =
  nginxAssetServerBaseUrl + "svgs/svgEffects/waveDistortionIcon.svg";
const crackedGlassIcon =
  nginxAssetServerBaseUrl + "svgs/svgEffects/crackedGlassIcon.svg";
const grayscaleIcon =
  nginxAssetServerBaseUrl + "svgs/svgEffects/grayscaleIcon.svg";
const grayscaleOffIcon =
  nginxAssetServerBaseUrl + "svgs/svgEffects/grayscaleOffIcon.svg";
const edgeDetectionIcon =
  nginxAssetServerBaseUrl + "svgs/svgEffects/edgeDetectionIcon.svg";

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

export default function SvgEffectsSection({
  svgId,
  svgMedia,
  lowerSvgController,
  svgContainerRef,
}: {
  svgId: string;
  svgMedia: SvgMedia;
  lowerSvgController: LowerSvgController;
  svgContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const { userStreamEffects, userEffectsStyles } = useEffectsContext();

  const [effectsDisabled, setEffectsDisabled] = useState(true);

  const effectsContainerRef = useRef<HTMLDivElement>(null);
  const subEffectsContainerRef = useRef<HTMLDivElement>(null);

  const shadowColorPickerRef = useRef<HTMLDivElement>(null);
  const overlayColorPickerRef = useRef<HTMLDivElement>(null);
  const neonColorPickerRef = useRef<HTMLDivElement>(null);

  const overflow = useRef(false);

  const [_, setRerender] = useState(false);

  const handleWheel = (event: WheelEvent) => {
    event.stopPropagation();
    event.preventDefault();

    if (effectsContainerRef.current) {
      effectsContainerRef.current.scrollLeft += event.deltaY;
    }
  };

  useEffect(() => {
    effectsContainerRef.current?.addEventListener("wheel", handleWheel);

    return () => {
      effectsContainerRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useLayoutEffect(() => {
    if (!svgContainerRef.current) {
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

    observer.observe(svgContainerRef.current);

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
        bottom: "calc(max(2rem, min(12% + 0.5rem, 3.5rem)))",
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
        <ClearAllButton
          effectsDisabled={effectsDisabled}
          setEffectsDisabled={setEffectsDisabled}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={async () => {
            await lowerSvgController.handleSvgEffect("clearAll", false);
          }}
        />
        <ColorPickerButton
          className='h-full aspect-square'
          defaultColor={
            svgMedia.getBackgroundColor() === "transparent" ||
            svgMedia.getBackgroundColor() === "none" ||
            svgMedia.getBackgroundColor() === undefined ||
            svgMedia.getBackgroundColor() === ""
              ? "#ffffff00"
              : svgMedia.getBackgroundColor()
          }
          handleAcceptColorCallback={(_hex, hexa) => {
            svgMedia.setBackgroundColor(hexa);
          }}
          isAlpha={true}
        />
        <ColorPickerButton
          className='h-full aspect-square'
          defaultColor={
            svgMedia.getPathColor() === undefined
              ? "#000000ff"
              : svgMedia.getPathColor()
          }
          handleAcceptColorCallback={(_hex, hexa) => {
            svgMedia.setPathColor(hexa);
          }}
          isAlpha={true}
        />
        <SvgEffectButton
          svgId={svgId}
          filter='shadow'
          active={userStreamEffects.current.svg[svgId].shadow}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userStreamEffects.current.svg[svgId].shadow =
              !userStreamEffects.current.svg[svgId].shadow;
            const style = userEffectsStyles.current.svg[svgId].shadow;

            if (userStreamEffects.current.svg[svgId].shadow) {
              svgMedia.applyShadowEffect(
                `${style.shadowColor}`,
                `${style.strength}`,
                `${style.offsetX}`,
                `${style.offsetY}`
              );
            } else {
              svgMedia.removeEffect("#fgSvgShadowFilter");
            }

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={
                userStreamEffects.current.svg[svgId].shadow
                  ? shadowOffIcon
                  : shadowIcon
              }
              className='flex h-full w-full items-center justify-center'
              attributes={[
                { key: "width", value: "70%" },
                { key: "height", value: "70%" },
                { key: "fill", value: "#f2f2f2" },
                { key: "stroke", value: "#f2f2f2" },
              ]}
            />
          }
          hoverLabel='Shadow'
          colorPickerRefs={{ shadowColor: shadowColorPickerRef }}
          handleValueChange={(key, value) => {
            // @ts-expect-error key isn't typed
            userEffectsStyles.current.svg[svgId].shadow[key] = value;

            if (!userStreamEffects.current.svg[svgId].shadow) {
              userStreamEffects.current.svg[svgId].shadow = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgId].shadow;

            svgMedia.applyShadowEffect(
              `${style.shadowColor}`,
              `${style.strength}`,
              `${style.offsetX}`,
              `${style.offsetY}`
            );
          }}
          handleAcceptColor={(_key, hexa) => {
            userEffectsStyles.current.svg[svgId].shadow.shadowColor = hexa;

            if (!userStreamEffects.current.svg[svgId].shadow)
              userStreamEffects.current.svg[svgId].shadow = true;

            const style = userEffectsStyles.current.svg[svgId].shadow;

            svgMedia.applyShadowEffect(
              `${style.shadowColor}`,
              `${style.strength}`,
              `${style.offsetX}`,
              `${style.offsetY}`
            );
          }}
        />
        <SvgEffectButton
          svgId={svgId}
          filter='blur'
          active={userStreamEffects.current.svg[svgId].blur}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userStreamEffects.current.svg[svgId].blur =
              !userStreamEffects.current.svg[svgId].blur;
            const style = userEffectsStyles.current.svg[svgId].blur;

            if (userStreamEffects.current.svg[svgId].blur) {
              svgMedia.applyBlurEffect(`${style.strength}`);
            } else {
              svgMedia.removeEffect("#fgSvgBlurFilter");
            }

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={
                userStreamEffects.current.svg[svgId].blur
                  ? blurOffIcon
                  : blurIcon
              }
              className='flex h-full w-full items-center justify-center'
              attributes={[
                { key: "width", value: "80%" },
                { key: "height", value: "80%" },
                { key: "fill", value: "#f2f2f2" },
                { key: "stroke", value: "#f2f2f2" },
              ]}
            />
          }
          hoverLabel='Blur'
          handleValueChange={(key, value) => {
            // @ts-expect-error key isn't typed
            userEffectsStyles.current.svg[svgId].blur[key] = value;

            if (!userStreamEffects.current.svg[svgId].blur) {
              userStreamEffects.current.svg[svgId].blur = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgId].blur;

            svgMedia.applyBlurEffect(`${style.strength}`);
          }}
        />
        <SvgEffectButton
          svgId={svgId}
          filter='colorOverlay'
          active={userStreamEffects.current.svg[svgId].colorOverlay}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userStreamEffects.current.svg[svgId].colorOverlay =
              !userStreamEffects.current.svg[svgId].colorOverlay;
            const style = userEffectsStyles.current.svg[svgId].colorOverlay;

            if (userStreamEffects.current.svg[svgId].colorOverlay) {
              svgMedia.applyColorOverlayEffect(`${style.overlayColor}`);
            } else {
              svgMedia.removeEffect("#fgSvgColorOverlayFilter");
            }

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={colorOverlayIcon}
              className='flex h-full w-full items-center justify-center'
              attributes={[
                { key: "width", value: "75%" },
                { key: "height", value: "75%" },
                { key: "fill", value: "#f2f2f2" },
                { key: "stroke", value: "#f2f2f2" },
              ]}
            />
          }
          hoverLabel='Color overlay'
          colorPickerRefs={{ overlayColor: overlayColorPickerRef }}
          handleAcceptColor={(_key, hexa) => {
            userEffectsStyles.current.svg[svgId].colorOverlay.overlayColor =
              hexa;

            if (!userStreamEffects.current.svg[svgId].colorOverlay) {
              userStreamEffects.current.svg[svgId].colorOverlay = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgId].colorOverlay;

            svgMedia.applyColorOverlayEffect(`${style.overlayColor}`);
          }}
        />
        <SvgEffectButton
          svgId={svgId}
          filter='saturate'
          active={userStreamEffects.current.svg[svgId].saturate}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userStreamEffects.current.svg[svgId].saturate =
              !userStreamEffects.current.svg[svgId].saturate;
            const style = userEffectsStyles.current.svg[svgId].saturate;

            if (userStreamEffects.current.svg[svgId].saturate) {
              svgMedia.applySaturateEffect(`${style.saturation}`);
            } else {
              svgMedia.removeEffect("#fgSvgSaturateFilter");
            }

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={saturateIcon}
              className='flex h-full w-full items-center justify-center'
              attributes={[
                { key: "width", value: "70%" },
                { key: "height", value: "70%" },
                { key: "fill", value: "#f2f2f2" },
                { key: "stroke", value: "#f2f2f2" },
              ]}
            />
          }
          hoverLabel='Saturate'
          handleValueChange={(key, value) => {
            // @ts-expect-error key isn't typed
            userEffectsStyles.current.svg[svgId].saturate[key] = value;

            if (!userStreamEffects.current.svg[svgId].saturate) {
              userStreamEffects.current.svg[svgId].saturate = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgId].saturate;

            svgMedia.applySaturateEffect(`${style.saturation}`);
          }}
        />
        <SvgEffectButton
          svgId={svgId}
          filter='grayscale'
          active={userStreamEffects.current.svg[svgId].grayscale}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userStreamEffects.current.svg[svgId].grayscale =
              !userStreamEffects.current.svg[svgId].grayscale;
            const style = userEffectsStyles.current.svg[svgId].grayscale;

            if (userStreamEffects.current.svg[svgId].grayscale) {
              svgMedia.applyGrayscaleEffect(`${style.scale}`);
            } else {
              svgMedia.removeEffect("#fgSvgGrayscaleFilter");
            }

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={
                userStreamEffects.current.svg[svgId].grayscale
                  ? grayscaleOffIcon
                  : grayscaleIcon
              }
              className='flex h-full w-full items-center justify-center'
              attributes={[
                { key: "width", value: "70%" },
                { key: "height", value: "70%" },
                { key: "fill", value: "#f2f2f2" },
                { key: "stroke", value: "#f2f2f2" },
              ]}
            />
          }
          hoverLabel='Grayscale'
          handleValueChange={(key, value) => {
            // @ts-expect-error key isn't typed
            userEffectsStyles.current.svg[svgId].grayscale[key] = value;

            if (!userStreamEffects.current.svg[svgId].grayscale) {
              userStreamEffects.current.svg[svgId].grayscale = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgId].grayscale;

            svgMedia.applyGrayscaleEffect(`${style.scale}`);
          }}
        />
        <SvgEffectButton
          svgId={svgId}
          filter='edgeDetection'
          active={userStreamEffects.current.svg[svgId].edgeDetection}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userStreamEffects.current.svg[svgId].edgeDetection =
              !userStreamEffects.current.svg[svgId].edgeDetection;

            if (userStreamEffects.current.svg[svgId].edgeDetection) {
              svgMedia.applyEdgeDetectionEffect();
            } else {
              svgMedia.removeEffect("#fgSvgEdgeDetectionFilter");
            }

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={edgeDetectionIcon}
              className='flex h-full w-full items-center justify-center'
              attributes={[
                { key: "width", value: "65%" },
                { key: "height", value: "65%" },
                { key: "fill", value: "#f2f2f2" },
                { key: "stroke", value: "#f2f2f2" },
              ]}
            />
          }
          hoverLabel='Edge dectection'
        />
        <SvgEffectButton
          svgId={svgId}
          filter='neonGlow'
          active={userStreamEffects.current.svg[svgId].neonGlow}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userStreamEffects.current.svg[svgId].neonGlow =
              !userStreamEffects.current.svg[svgId].neonGlow;
            const style = userEffectsStyles.current.svg[svgId].neonGlow;

            if (userStreamEffects.current.svg[svgId].neonGlow) {
              svgMedia.applyNeonGlowEffect(`${style.neonColor}`);
            } else {
              svgMedia.removeEffect("#fgSvgNeonGlowFilter");
            }

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={neonGlowIcon}
              className='flex h-full w-full items-center justify-center'
              attributes={[
                { key: "width", value: "80%" },
                { key: "height", value: "80%" },
                { key: "fill", value: "#f2f2f2" },
                { key: "stroke", value: "#f2f2f2" },
              ]}
            />
          }
          hoverLabel='Neon glow'
          colorPickerRefs={{ neonColor: neonColorPickerRef }}
          handleAcceptColor={(_key, hexa) => {
            userEffectsStyles.current.svg[svgId].neonGlow.neonColor = hexa;

            if (!userStreamEffects.current.svg[svgId].neonGlow) {
              userStreamEffects.current.svg[svgId].neonGlow = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgId].neonGlow;

            svgMedia.applyNeonGlowEffect(`${style.neonColor}`);
          }}
        />
        <SvgEffectButton
          svgId={svgId}
          filter='waveDistortion'
          active={userStreamEffects.current.svg[svgId].waveDistortion}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userStreamEffects.current.svg[svgId].waveDistortion =
              !userStreamEffects.current.svg[svgId].waveDistortion;
            const style = userEffectsStyles.current.svg[svgId].waveDistortion;

            if (userStreamEffects.current.svg[svgId].waveDistortion) {
              svgMedia.applyWaveDistortionEffect(
                `${style.frequency}`,
                `${style.strength}`
              );
            } else {
              svgMedia.removeEffect("#fgSvgWaveDistortionFilter");
            }

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={waveDistortionIcon}
              className='flex h-full w-full items-center justify-center'
              attributes={[
                { key: "width", value: "70%" },
                { key: "height", value: "70%" },
                { key: "fill", value: "#f2f2f2" },
                { key: "stroke", value: "#f2f2f2" },
              ]}
            />
          }
          hoverLabel='Wave distortion'
          handleValueChange={(key, value) => {
            // @ts-expect-error key isn't typed
            userEffectsStyles.current.svg[svgId].waveDistortion[key] = value;

            if (!userStreamEffects.current.svg[svgId].waveDistortion) {
              userStreamEffects.current.svg[svgId].waveDistortion = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgId].waveDistortion;

            svgMedia.applyWaveDistortionEffect(
              `${style.frequency}`,
              `${style.strength}`
            );
          }}
        />
        <SvgEffectButton
          svgId={svgId}
          filter='crackedGlass'
          active={userStreamEffects.current.svg[svgId].crackedGlass}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userStreamEffects.current.svg[svgId].crackedGlass =
              !userStreamEffects.current.svg[svgId].crackedGlass;
            const style = userEffectsStyles.current.svg[svgId].crackedGlass;

            if (userStreamEffects.current.svg[svgId].crackedGlass) {
              svgMedia.applyCrackedGlassEffect(
                `${style.density}`,
                `${style.detail}`,
                `${style.strength}`
              );
            } else {
              svgMedia.removeEffect("#fgSvgCrackedGlassFilter");
            }

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={crackedGlassIcon}
              className='flex h-full w-full items-center justify-center'
              attributes={[
                { key: "width", value: "70%" },
                { key: "height", value: "70%" },
                { key: "fill", value: "#f2f2f2" },
                { key: "stroke", value: "#f2f2f2" },
              ]}
            />
          }
          hoverLabel='Cracked glass'
          handleValueChange={(key, value) => {
            // @ts-expect-error key isn't typed
            userEffectsStyles.current.svg[svgId].crackedGlass[key] = value;

            if (!userStreamEffects.current.svg[svgId].crackedGlass) {
              userStreamEffects.current.svg[svgId].crackedGlass = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgId].crackedGlass;

            svgMedia.applyCrackedGlassEffect(
              `${style.density}`,
              `${style.detail}`,
              `${style.strength}`
            );
          }}
        />
      </div>
    </motion.div>
  );
}
