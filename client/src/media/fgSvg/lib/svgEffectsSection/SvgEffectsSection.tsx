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
          svgId={svgId}
          filter='shadow'
          active={userEffects.current.svg[svgId].shadow}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgId].shadow =
              !userEffects.current.svg[svgId].shadow;
            const style = userEffectsStyles.current.svg[svgId].shadow;

            if (userEffects.current.svg[svgId].shadow) {
              svgMedia.applyShadowEffect(
                `${style.shadowColor}`,
                `${style.strength}`,
                `${style.offsetX}`,
                `${style.offsetY}`
              );
            } else {
              svgMedia.removeEffect("#fgSvgShadowFilter_" + svgId);
            }

            lowerSvgController.handleAlertSvgEffect();

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={
                userEffects.current.svg[svgId].shadow
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

            if (!userEffects.current.svg[svgId].shadow) {
              userEffects.current.svg[svgId].shadow = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgId].shadow;

            svgMedia.applyShadowEffect(
              `${style.shadowColor}`,
              `${style.strength}`,
              `${style.offsetX}`,
              `${style.offsetY}`
            );

            lowerSvgController.handleAlertSvgEffect();
          }}
          handleAcceptColor={(_key, hexa) => {
            userEffectsStyles.current.svg[svgId].shadow.shadowColor = hexa;

            if (!userEffects.current.svg[svgId].shadow)
              userEffects.current.svg[svgId].shadow = true;

            const style = userEffectsStyles.current.svg[svgId].shadow;

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
          svgId={svgId}
          filter='blur'
          active={userEffects.current.svg[svgId].blur}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgId].blur =
              !userEffects.current.svg[svgId].blur;
            const style = userEffectsStyles.current.svg[svgId].blur;

            if (userEffects.current.svg[svgId].blur) {
              svgMedia.applyBlurEffect(`${style.strength}`);
            } else {
              svgMedia.removeEffect("#fgSvgBlurFilter_" + svgId);
            }

            lowerSvgController.handleAlertSvgEffect();

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={userEffects.current.svg[svgId].blur ? blurOffIcon : blurIcon}
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

            if (!userEffects.current.svg[svgId].blur) {
              userEffects.current.svg[svgId].blur = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgId].blur;

            svgMedia.applyBlurEffect(`${style.strength}`);

            lowerSvgController.handleAlertSvgEffect();
          }}
        />
        <SvgEffectButton
          svgId={svgId}
          filter='colorOverlay'
          active={userEffects.current.svg[svgId].colorOverlay}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgId].colorOverlay =
              !userEffects.current.svg[svgId].colorOverlay;
            const style = userEffectsStyles.current.svg[svgId].colorOverlay;

            if (userEffects.current.svg[svgId].colorOverlay) {
              svgMedia.applyColorOverlayEffect(`${style.overlayColor}`);
            } else {
              svgMedia.removeEffect("#fgSvgColorOverlayFilter_" + svgId);
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
            userEffectsStyles.current.svg[svgId].colorOverlay.overlayColor =
              hexa;

            if (!userEffects.current.svg[svgId].colorOverlay) {
              userEffects.current.svg[svgId].colorOverlay = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgId].colorOverlay;

            svgMedia.applyColorOverlayEffect(`${style.overlayColor}`);

            lowerSvgController.handleAlertSvgEffect();
          }}
        />
        <SvgEffectButton
          svgId={svgId}
          filter='saturate'
          active={userEffects.current.svg[svgId].saturate}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgId].saturate =
              !userEffects.current.svg[svgId].saturate;
            const style = userEffectsStyles.current.svg[svgId].saturate;

            if (userEffects.current.svg[svgId].saturate) {
              svgMedia.applySaturateEffect(`${style.saturation}`);
            } else {
              svgMedia.removeEffect("#fgSvgSaturateFilter_" + svgId);
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
            userEffectsStyles.current.svg[svgId].saturate[key] = value;

            if (!userEffects.current.svg[svgId].saturate) {
              userEffects.current.svg[svgId].saturate = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgId].saturate;

            svgMedia.applySaturateEffect(`${style.saturation}`);

            lowerSvgController.handleAlertSvgEffect();
          }}
        />
        <SvgEffectButton
          svgId={svgId}
          filter='grayscale'
          active={userEffects.current.svg[svgId].grayscale}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgId].grayscale =
              !userEffects.current.svg[svgId].grayscale;
            const style = userEffectsStyles.current.svg[svgId].grayscale;

            if (userEffects.current.svg[svgId].grayscale) {
              svgMedia.applyGrayscaleEffect(`${style.scale}`);
            } else {
              svgMedia.removeEffect("#fgSvgGrayscaleFilter_" + svgId);
            }

            lowerSvgController.handleAlertSvgEffect();

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={
                userEffects.current.svg[svgId].grayscale
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

            if (!userEffects.current.svg[svgId].grayscale) {
              userEffects.current.svg[svgId].grayscale = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgId].grayscale;

            svgMedia.applyGrayscaleEffect(`${style.scale}`);

            lowerSvgController.handleAlertSvgEffect();
          }}
        />
        <SvgEffectButton
          svgId={svgId}
          filter='edgeDetection'
          active={userEffects.current.svg[svgId].edgeDetection}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgId].edgeDetection =
              !userEffects.current.svg[svgId].edgeDetection;

            if (userEffects.current.svg[svgId].edgeDetection) {
              svgMedia.applyEdgeDetectionEffect();
            } else {
              svgMedia.removeEffect("#fgSvgEdgeDetectionFilter_" + svgId);
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
          svgId={svgId}
          filter='neonGlow'
          active={userEffects.current.svg[svgId].neonGlow}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgId].neonGlow =
              !userEffects.current.svg[svgId].neonGlow;
            const style = userEffectsStyles.current.svg[svgId].neonGlow;

            if (userEffects.current.svg[svgId].neonGlow) {
              svgMedia.applyNeonGlowEffect(`${style.neonColor}`);
            } else {
              svgMedia.removeEffect("#fgSvgNeonGlowFilter_" + svgId);
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
            userEffectsStyles.current.svg[svgId].neonGlow.neonColor = hexa;

            if (!userEffects.current.svg[svgId].neonGlow) {
              userEffects.current.svg[svgId].neonGlow = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgId].neonGlow;

            svgMedia.applyNeonGlowEffect(`${style.neonColor}`);

            lowerSvgController.handleAlertSvgEffect();
          }}
        />
        <SvgEffectButton
          svgId={svgId}
          filter='waveDistortion'
          active={userEffects.current.svg[svgId].waveDistortion}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgId].waveDistortion =
              !userEffects.current.svg[svgId].waveDistortion;
            const style = userEffectsStyles.current.svg[svgId].waveDistortion;

            if (userEffects.current.svg[svgId].waveDistortion) {
              svgMedia.applyWaveDistortionEffect(
                `${style.frequency}`,
                `${style.strength}`
              );
            } else {
              svgMedia.removeEffect("#fgSvgWaveDistortionFilter_" + svgId);
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
            userEffectsStyles.current.svg[svgId].waveDistortion[key] = value;

            if (!userEffects.current.svg[svgId].waveDistortion) {
              userEffects.current.svg[svgId].waveDistortion = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgId].waveDistortion;

            svgMedia.applyWaveDistortionEffect(
              `${style.frequency}`,
              `${style.strength}`
            );

            lowerSvgController.handleAlertSvgEffect();
          }}
        />
        <SvgEffectButton
          svgId={svgId}
          filter='crackedGlass'
          active={userEffects.current.svg[svgId].crackedGlass}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgId].crackedGlass =
              !userEffects.current.svg[svgId].crackedGlass;
            const style = userEffectsStyles.current.svg[svgId].crackedGlass;

            if (userEffects.current.svg[svgId].crackedGlass) {
              svgMedia.applyCrackedGlassEffect(
                `${style.density}`,
                `${style.detail}`,
                `${style.strength}`
              );
            } else {
              svgMedia.removeEffect("#fgSvgCrackedGlassFilter_" + svgId);
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
            userEffectsStyles.current.svg[svgId].crackedGlass[key] = value;

            if (!userEffects.current.svg[svgId].crackedGlass) {
              userEffects.current.svg[svgId].crackedGlass = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgId].crackedGlass;

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
