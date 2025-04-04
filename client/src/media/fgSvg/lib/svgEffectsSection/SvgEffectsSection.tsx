import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Transition, Variants, motion } from "framer-motion";
import LowerSvgController from "../lowerSvgControls/LowerSvgController";
import ClearAllButton from "../../../../elements/effectsButtons/ClearAllButton";
import SvgEffectButton from "./lib/SvgEffectButton";
import FgSVGElement from "../../../../elements/fgSVGElement/FgSVGElement";
import { useEffectsContext } from "../../../../context/effectsContext/EffectsContext";
import ColorPickerButton from "../../../../elements/colorPickerButton/ColorPickerButton";
import SvgMediaInstance from "../../SvgMediaInstance";

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
  svgInstanceId,
  svgMedia,
  lowerSvgController,
  svgContainerRef,
}: {
  svgInstanceId: string;
  svgMedia: SvgMediaInstance;
  lowerSvgController: LowerSvgController;
  svgContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const { userEffects, userEffectsStyles } = useEffectsContext();

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
            svgMedia.clearAllEffects();

            lowerSvgController.handleAlertSvgEffect();
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
          svgInstanceId={svgInstanceId}
          filter='shadow'
          active={userEffects.current.svg[svgInstanceId].shadow}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgInstanceId].shadow =
              !userEffects.current.svg[svgInstanceId].shadow;
            const style = userEffectsStyles.current.svg[svgInstanceId].shadow;

            if (userEffects.current.svg[svgInstanceId].shadow) {
              svgMedia.applyShadowEffect(
                `${style.shadowColor}`,
                `${style.strength}`,
                `${style.offsetX}`,
                `${style.offsetY}`
              );
            } else {
              svgMedia.removeEffect("#fgSvgShadowFilter_" + svgInstanceId);
            }

            lowerSvgController.handleAlertSvgEffect();

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={
                userEffects.current.svg[svgInstanceId].shadow
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
            userEffectsStyles.current.svg[svgInstanceId].shadow[key] = value;

            if (!userEffects.current.svg[svgInstanceId].shadow) {
              userEffects.current.svg[svgInstanceId].shadow = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgInstanceId].shadow;

            svgMedia.applyShadowEffect(
              `${style.shadowColor}`,
              `${style.strength}`,
              `${style.offsetX}`,
              `${style.offsetY}`
            );

            lowerSvgController.handleAlertSvgEffect();
          }}
          handleAcceptColor={(_key, hexa) => {
            userEffectsStyles.current.svg[svgInstanceId].shadow.shadowColor =
              hexa;

            if (!userEffects.current.svg[svgInstanceId].shadow)
              userEffects.current.svg[svgInstanceId].shadow = true;

            const style = userEffectsStyles.current.svg[svgInstanceId].shadow;

            svgMedia.applyShadowEffect(
              `${style.shadowColor}`,
              `${style.strength}`,
              `${style.offsetX}`,
              `${style.offsetY}`
            );

            lowerSvgController.handleAlertSvgEffect();
          }}
        />
        <SvgEffectButton
          svgInstanceId={svgInstanceId}
          filter='blur'
          active={userEffects.current.svg[svgInstanceId].blur}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgInstanceId].blur =
              !userEffects.current.svg[svgInstanceId].blur;
            const style = userEffectsStyles.current.svg[svgInstanceId].blur;

            if (userEffects.current.svg[svgInstanceId].blur) {
              svgMedia.applyBlurEffect(`${style.strength}`);
            } else {
              svgMedia.removeEffect("#fgSvgBlurFilter_" + svgInstanceId);
            }

            lowerSvgController.handleAlertSvgEffect();

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={
                userEffects.current.svg[svgInstanceId].blur
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
            userEffectsStyles.current.svg[svgInstanceId].blur[key] = value;

            if (!userEffects.current.svg[svgInstanceId].blur) {
              userEffects.current.svg[svgInstanceId].blur = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgInstanceId].blur;

            svgMedia.applyBlurEffect(`${style.strength}`);

            lowerSvgController.handleAlertSvgEffect();
          }}
        />
        <SvgEffectButton
          svgInstanceId={svgInstanceId}
          filter='colorOverlay'
          active={userEffects.current.svg[svgInstanceId].colorOverlay}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgInstanceId].colorOverlay =
              !userEffects.current.svg[svgInstanceId].colorOverlay;
            const style =
              userEffectsStyles.current.svg[svgInstanceId].colorOverlay;

            if (userEffects.current.svg[svgInstanceId].colorOverlay) {
              svgMedia.applyColorOverlayEffect(`${style.overlayColor}`);
            } else {
              svgMedia.removeEffect(
                "#fgSvgColorOverlayFilter_" + svgInstanceId
              );
            }

            lowerSvgController.handleAlertSvgEffect();

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
            userEffectsStyles.current.svg[
              svgInstanceId
            ].colorOverlay.overlayColor = hexa;

            if (!userEffects.current.svg[svgInstanceId].colorOverlay) {
              userEffects.current.svg[svgInstanceId].colorOverlay = true;
              setRerender((prev) => !prev);
            }

            const style =
              userEffectsStyles.current.svg[svgInstanceId].colorOverlay;

            svgMedia.applyColorOverlayEffect(`${style.overlayColor}`);

            lowerSvgController.handleAlertSvgEffect();
          }}
        />
        <SvgEffectButton
          svgInstanceId={svgInstanceId}
          filter='saturate'
          active={userEffects.current.svg[svgInstanceId].saturate}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgInstanceId].saturate =
              !userEffects.current.svg[svgInstanceId].saturate;
            const style = userEffectsStyles.current.svg[svgInstanceId].saturate;

            if (userEffects.current.svg[svgInstanceId].saturate) {
              svgMedia.applySaturateEffect(`${style.saturation}`);
            } else {
              svgMedia.removeEffect("#fgSvgSaturateFilter_" + svgInstanceId);
            }

            lowerSvgController.handleAlertSvgEffect();

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
            userEffectsStyles.current.svg[svgInstanceId].saturate[key] = value;

            if (!userEffects.current.svg[svgInstanceId].saturate) {
              userEffects.current.svg[svgInstanceId].saturate = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgInstanceId].saturate;

            svgMedia.applySaturateEffect(`${style.saturation}`);

            lowerSvgController.handleAlertSvgEffect();
          }}
        />
        <SvgEffectButton
          svgInstanceId={svgInstanceId}
          filter='grayscale'
          active={userEffects.current.svg[svgInstanceId].grayscale}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgInstanceId].grayscale =
              !userEffects.current.svg[svgInstanceId].grayscale;
            const style =
              userEffectsStyles.current.svg[svgInstanceId].grayscale;

            if (userEffects.current.svg[svgInstanceId].grayscale) {
              svgMedia.applyGrayscaleEffect(`${style.scale}`);
            } else {
              svgMedia.removeEffect("#fgSvgGrayscaleFilter_" + svgInstanceId);
            }

            lowerSvgController.handleAlertSvgEffect();

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={
                userEffects.current.svg[svgInstanceId].grayscale
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
            userEffectsStyles.current.svg[svgInstanceId].grayscale[key] = value;

            if (!userEffects.current.svg[svgInstanceId].grayscale) {
              userEffects.current.svg[svgInstanceId].grayscale = true;
              setRerender((prev) => !prev);
            }

            const style =
              userEffectsStyles.current.svg[svgInstanceId].grayscale;

            svgMedia.applyGrayscaleEffect(`${style.scale}`);

            lowerSvgController.handleAlertSvgEffect();
          }}
        />
        <SvgEffectButton
          svgInstanceId={svgInstanceId}
          filter='edgeDetection'
          active={userEffects.current.svg[svgInstanceId].edgeDetection}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgInstanceId].edgeDetection =
              !userEffects.current.svg[svgInstanceId].edgeDetection;

            if (userEffects.current.svg[svgInstanceId].edgeDetection) {
              svgMedia.applyEdgeDetectionEffect();
            } else {
              svgMedia.removeEffect(
                "#fgSvgEdgeDetectionFilter_" + svgInstanceId
              );
            }

            lowerSvgController.handleAlertSvgEffect();

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
          svgInstanceId={svgInstanceId}
          filter='neonGlow'
          active={userEffects.current.svg[svgInstanceId].neonGlow}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgInstanceId].neonGlow =
              !userEffects.current.svg[svgInstanceId].neonGlow;
            const style = userEffectsStyles.current.svg[svgInstanceId].neonGlow;

            if (userEffects.current.svg[svgInstanceId].neonGlow) {
              svgMedia.applyNeonGlowEffect(`${style.neonColor}`);
            } else {
              svgMedia.removeEffect("#fgSvgNeonGlowFilter_" + svgInstanceId);
            }

            lowerSvgController.handleAlertSvgEffect();

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
            userEffectsStyles.current.svg[svgInstanceId].neonGlow.neonColor =
              hexa;

            if (!userEffects.current.svg[svgInstanceId].neonGlow) {
              userEffects.current.svg[svgInstanceId].neonGlow = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgInstanceId].neonGlow;

            svgMedia.applyNeonGlowEffect(`${style.neonColor}`);

            lowerSvgController.handleAlertSvgEffect();
          }}
        />
        <SvgEffectButton
          svgInstanceId={svgInstanceId}
          filter='waveDistortion'
          active={userEffects.current.svg[svgInstanceId].waveDistortion}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgInstanceId].waveDistortion =
              !userEffects.current.svg[svgInstanceId].waveDistortion;
            const style =
              userEffectsStyles.current.svg[svgInstanceId].waveDistortion;

            if (userEffects.current.svg[svgInstanceId].waveDistortion) {
              svgMedia.applyWaveDistortionEffect(
                `${style.frequency}`,
                `${style.strength}`
              );
            } else {
              svgMedia.removeEffect(
                "#fgSvgWaveDistortionFilter_" + svgInstanceId
              );
            }

            lowerSvgController.handleAlertSvgEffect();

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
            userEffectsStyles.current.svg[svgInstanceId].waveDistortion[key] =
              value;

            if (!userEffects.current.svg[svgInstanceId].waveDistortion) {
              userEffects.current.svg[svgInstanceId].waveDistortion = true;
              setRerender((prev) => !prev);
            }

            const style =
              userEffectsStyles.current.svg[svgInstanceId].waveDistortion;

            svgMedia.applyWaveDistortionEffect(
              `${style.frequency}`,
              `${style.strength}`
            );

            lowerSvgController.handleAlertSvgEffect();
          }}
        />
        <SvgEffectButton
          svgInstanceId={svgInstanceId}
          filter='crackedGlass'
          active={userEffects.current.svg[svgInstanceId].crackedGlass}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgInstanceId].crackedGlass =
              !userEffects.current.svg[svgInstanceId].crackedGlass;
            const style =
              userEffectsStyles.current.svg[svgInstanceId].crackedGlass;

            if (userEffects.current.svg[svgInstanceId].crackedGlass) {
              svgMedia.applyCrackedGlassEffect(
                `${style.density}`,
                `${style.detail}`,
                `${style.strength}`
              );
            } else {
              svgMedia.removeEffect(
                "#fgSvgCrackedGlassFilter_" + svgInstanceId
              );
            }

            lowerSvgController.handleAlertSvgEffect();

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
            userEffectsStyles.current.svg[svgInstanceId].crackedGlass[key] =
              value;

            if (!userEffects.current.svg[svgInstanceId].crackedGlass) {
              userEffects.current.svg[svgInstanceId].crackedGlass = true;
              setRerender((prev) => !prev);
            }

            const style =
              userEffectsStyles.current.svg[svgInstanceId].crackedGlass;

            svgMedia.applyCrackedGlassEffect(
              `${style.density}`,
              `${style.detail}`,
              `${style.strength}`
            );

            lowerSvgController.handleAlertSvgEffect();
          }}
        />
      </div>
    </motion.div>
  );
}
