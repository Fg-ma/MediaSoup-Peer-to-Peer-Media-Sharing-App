import React, { useState, useEffect, useRef } from "react";
import { useSocketContext } from "../../../../../../../../context/socketContext/SocketContext";
import { useEffectsContext } from "../../../../../../../..//context/effectsContext/EffectsContext";
import ClearAllButton from "../../../../../../../../elements/effectsButtons/ClearAllButton";
import FgSVGElement from "../../../../../../../..//elements/fgSVGElement/FgSVGElement";
import ColorPickerButton from "../../../../../../../.././elements/colorPickerButton/ColorPickerButton";
import SvgEffectButton from "../../../../../../../../media/fgTableSvg/lib/svgEffectsSection/lib/SvgEffectButton";
import TableSvgMediaInstance from "../../../../../../../../media/fgTableSvg/TableSvgMediaInstance";

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

export default function SvgEffectsSection({
  svgInstanceId,
  svgMediaInstance,
}: {
  svgInstanceId: string;
  svgMediaInstance: TableSvgMediaInstance;
}) {
  const { userEffects, userEffectsStyles } = useEffectsContext();
  const { tableStaticContentSocket } = useSocketContext();

  const [effectsDisabled, setEffectsDisabled] = useState(true);

  const effectsContainerRef = useRef<HTMLDivElement>(null);
  const subEffectsContainerRef = useRef<HTMLDivElement>(null);

  const shadowColorPickerRef = useRef<HTMLDivElement>(null);
  const overlayColorPickerRef = useRef<HTMLDivElement>(null);
  const neonColorPickerRef = useRef<HTMLDivElement>(null);

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

  const handleAlertSvgEffect = () => {
    tableStaticContentSocket.current?.updateContentEffects(
      "svg",
      svgMediaInstance.svgMedia.svgId,
      svgInstanceId,
      userEffects.current.svg[svgInstanceId],
      userEffectsStyles.current.svg[svgInstanceId],
    );
  };

  return (
    <div
      ref={effectsContainerRef}
      className="hide-scroll-bar flex h-12 w-full max-w-full items-center justify-start overflow-x-auto rounded"
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
            svgMediaInstance.clearAllEffects();

            handleAlertSvgEffect();
          }}
        />
        <SvgEffectButton
          svgInstanceId={svgInstanceId}
          filter="shadow"
          active={userEffects.current.svg[svgInstanceId].shadow}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgInstanceId].shadow =
              !userEffects.current.svg[svgInstanceId].shadow;
            const style = userEffectsStyles.current.svg[svgInstanceId].shadow;

            if (userEffects.current.svg[svgInstanceId].shadow) {
              svgMediaInstance.applyShadowEffect(
                `${style.shadowColor}`,
                `${style.strength}`,
                `${style.offsetX}`,
                `${style.offsetY}`,
              );
            } else {
              svgMediaInstance.removeEffect(
                "#fgSvgShadowFilter_" + svgInstanceId,
              );
            }

            handleAlertSvgEffect();

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={
                userEffects.current.svg[svgInstanceId].shadow
                  ? shadowOffIcon
                  : shadowIcon
              }
              className="flex h-full w-full items-center justify-center"
              attributes={[
                { key: "width", value: "70%" },
                { key: "height", value: "70%" },
                { key: "fill", value: "#f2f2f2" },
                { key: "stroke", value: "#f2f2f2" },
              ]}
            />
          }
          hoverLabel="Shadow"
          colorPickerRefs={{ shadowColor: shadowColorPickerRef }}
          handleValueChange={(key, value) => {
            // @ts-expect-error key isn't typed
            userEffectsStyles.current.svg[svgInstanceId].shadow[key] = value;

            if (!userEffects.current.svg[svgInstanceId].shadow) {
              userEffects.current.svg[svgInstanceId].shadow = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgInstanceId].shadow;

            svgMediaInstance.applyShadowEffect(
              `${style.shadowColor}`,
              `${style.strength}`,
              `${style.offsetX}`,
              `${style.offsetY}`,
            );

            handleAlertSvgEffect();
          }}
          handleAcceptColor={(_key, hexa) => {
            userEffectsStyles.current.svg[svgInstanceId].shadow.shadowColor =
              hexa;

            if (!userEffects.current.svg[svgInstanceId].shadow)
              userEffects.current.svg[svgInstanceId].shadow = true;

            const style = userEffectsStyles.current.svg[svgInstanceId].shadow;

            svgMediaInstance.applyShadowEffect(
              `${style.shadowColor}`,
              `${style.strength}`,
              `${style.offsetX}`,
              `${style.offsetY}`,
            );

            handleAlertSvgEffect();
          }}
        />
        <SvgEffectButton
          svgInstanceId={svgInstanceId}
          filter="blur"
          active={userEffects.current.svg[svgInstanceId].blur}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgInstanceId].blur =
              !userEffects.current.svg[svgInstanceId].blur;
            const style = userEffectsStyles.current.svg[svgInstanceId].blur;

            if (userEffects.current.svg[svgInstanceId].blur) {
              svgMediaInstance.applyBlurEffect(`${style.strength}`);
            } else {
              svgMediaInstance.removeEffect(
                "#fgSvgBlurFilter_" + svgInstanceId,
              );
            }

            handleAlertSvgEffect();

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={
                userEffects.current.svg[svgInstanceId].blur
                  ? blurOffIcon
                  : blurIcon
              }
              className="flex h-full w-full items-center justify-center"
              attributes={[
                { key: "width", value: "80%" },
                { key: "height", value: "80%" },
                { key: "fill", value: "#f2f2f2" },
                { key: "stroke", value: "#f2f2f2" },
              ]}
            />
          }
          hoverLabel="Blur"
          handleValueChange={(key, value) => {
            // @ts-expect-error key isn't typed
            userEffectsStyles.current.svg[svgInstanceId].blur[key] = value;

            if (!userEffects.current.svg[svgInstanceId].blur) {
              userEffects.current.svg[svgInstanceId].blur = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgInstanceId].blur;

            svgMediaInstance.applyBlurEffect(`${style.strength}`);

            handleAlertSvgEffect();
          }}
        />
        <SvgEffectButton
          svgInstanceId={svgInstanceId}
          filter="colorOverlay"
          active={userEffects.current.svg[svgInstanceId].colorOverlay}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgInstanceId].colorOverlay =
              !userEffects.current.svg[svgInstanceId].colorOverlay;
            const style =
              userEffectsStyles.current.svg[svgInstanceId].colorOverlay;

            if (userEffects.current.svg[svgInstanceId].colorOverlay) {
              svgMediaInstance.applyColorOverlayEffect(`${style.overlayColor}`);
            } else {
              svgMediaInstance.removeEffect(
                "#fgSvgColorOverlayFilter_" + svgInstanceId,
              );
            }

            handleAlertSvgEffect();

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={colorOverlayIcon}
              className="flex h-full w-full items-center justify-center"
              attributes={[
                { key: "width", value: "75%" },
                { key: "height", value: "75%" },
                { key: "fill", value: "#f2f2f2" },
                { key: "stroke", value: "#f2f2f2" },
              ]}
            />
          }
          hoverLabel="Color overlay"
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

            svgMediaInstance.applyColorOverlayEffect(`${style.overlayColor}`);

            handleAlertSvgEffect();
          }}
        />
        <SvgEffectButton
          svgInstanceId={svgInstanceId}
          filter="saturate"
          active={userEffects.current.svg[svgInstanceId].saturate}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgInstanceId].saturate =
              !userEffects.current.svg[svgInstanceId].saturate;
            const style = userEffectsStyles.current.svg[svgInstanceId].saturate;

            if (userEffects.current.svg[svgInstanceId].saturate) {
              svgMediaInstance.applySaturateEffect(`${style.saturation}`);
            } else {
              svgMediaInstance.removeEffect(
                "#fgSvgSaturateFilter_" + svgInstanceId,
              );
            }

            handleAlertSvgEffect();

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={saturateIcon}
              className="flex h-full w-full items-center justify-center"
              attributes={[
                { key: "width", value: "70%" },
                { key: "height", value: "70%" },
                { key: "fill", value: "#f2f2f2" },
                { key: "stroke", value: "#f2f2f2" },
              ]}
            />
          }
          hoverLabel="Saturate"
          handleValueChange={(key, value) => {
            // @ts-expect-error key isn't typed
            userEffectsStyles.current.svg[svgInstanceId].saturate[key] = value;

            if (!userEffects.current.svg[svgInstanceId].saturate) {
              userEffects.current.svg[svgInstanceId].saturate = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgInstanceId].saturate;

            svgMediaInstance.applySaturateEffect(`${style.saturation}`);

            handleAlertSvgEffect();
          }}
        />
        <SvgEffectButton
          svgInstanceId={svgInstanceId}
          filter="grayscale"
          active={userEffects.current.svg[svgInstanceId].grayscale}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgInstanceId].grayscale =
              !userEffects.current.svg[svgInstanceId].grayscale;
            const style =
              userEffectsStyles.current.svg[svgInstanceId].grayscale;

            if (userEffects.current.svg[svgInstanceId].grayscale) {
              svgMediaInstance.applyGrayscaleEffect(`${style.scale}`);
            } else {
              svgMediaInstance.removeEffect(
                "#fgSvgGrayscaleFilter_" + svgInstanceId,
              );
            }

            handleAlertSvgEffect();

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={
                userEffects.current.svg[svgInstanceId].grayscale
                  ? grayscaleOffIcon
                  : grayscaleIcon
              }
              className="flex h-full w-full items-center justify-center"
              attributes={[
                { key: "width", value: "70%" },
                { key: "height", value: "70%" },
                { key: "fill", value: "#f2f2f2" },
                { key: "stroke", value: "#f2f2f2" },
              ]}
            />
          }
          hoverLabel="Grayscale"
          handleValueChange={(key, value) => {
            // @ts-expect-error key isn't typed
            userEffectsStyles.current.svg[svgInstanceId].grayscale[key] = value;

            if (!userEffects.current.svg[svgInstanceId].grayscale) {
              userEffects.current.svg[svgInstanceId].grayscale = true;
              setRerender((prev) => !prev);
            }

            const style =
              userEffectsStyles.current.svg[svgInstanceId].grayscale;

            svgMediaInstance.applyGrayscaleEffect(`${style.scale}`);

            handleAlertSvgEffect();
          }}
        />
        <SvgEffectButton
          svgInstanceId={svgInstanceId}
          filter="edgeDetection"
          active={userEffects.current.svg[svgInstanceId].edgeDetection}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgInstanceId].edgeDetection =
              !userEffects.current.svg[svgInstanceId].edgeDetection;

            if (userEffects.current.svg[svgInstanceId].edgeDetection) {
              svgMediaInstance.applyEdgeDetectionEffect();
            } else {
              svgMediaInstance.removeEffect(
                "#fgSvgEdgeDetectionFilter_" + svgInstanceId,
              );
            }

            handleAlertSvgEffect();

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={edgeDetectionIcon}
              className="flex h-full w-full items-center justify-center"
              attributes={[
                { key: "width", value: "65%" },
                { key: "height", value: "65%" },
                { key: "fill", value: "#f2f2f2" },
                { key: "stroke", value: "#f2f2f2" },
              ]}
            />
          }
          hoverLabel="Edge dectection"
        />
        <SvgEffectButton
          svgInstanceId={svgInstanceId}
          filter="neonGlow"
          active={userEffects.current.svg[svgInstanceId].neonGlow}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgInstanceId].neonGlow =
              !userEffects.current.svg[svgInstanceId].neonGlow;
            const style = userEffectsStyles.current.svg[svgInstanceId].neonGlow;

            if (userEffects.current.svg[svgInstanceId].neonGlow) {
              svgMediaInstance.applyNeonGlowEffect(`${style.neonColor}`);
            } else {
              svgMediaInstance.removeEffect(
                "#fgSvgNeonGlowFilter_" + svgInstanceId,
              );
            }

            handleAlertSvgEffect();

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={neonGlowIcon}
              className="flex h-full w-full items-center justify-center"
              attributes={[
                { key: "width", value: "80%" },
                { key: "height", value: "80%" },
                { key: "fill", value: "#f2f2f2" },
                { key: "stroke", value: "#f2f2f2" },
              ]}
            />
          }
          hoverLabel="Neon glow"
          colorPickerRefs={{ neonColor: neonColorPickerRef }}
          handleAcceptColor={(_key, hexa) => {
            userEffectsStyles.current.svg[svgInstanceId].neonGlow.neonColor =
              hexa;

            if (!userEffects.current.svg[svgInstanceId].neonGlow) {
              userEffects.current.svg[svgInstanceId].neonGlow = true;
              setRerender((prev) => !prev);
            }

            const style = userEffectsStyles.current.svg[svgInstanceId].neonGlow;

            svgMediaInstance.applyNeonGlowEffect(`${style.neonColor}`);

            handleAlertSvgEffect();
          }}
        />
        <SvgEffectButton
          svgInstanceId={svgInstanceId}
          filter="waveDistortion"
          active={userEffects.current.svg[svgInstanceId].waveDistortion}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgInstanceId].waveDistortion =
              !userEffects.current.svg[svgInstanceId].waveDistortion;
            const style =
              userEffectsStyles.current.svg[svgInstanceId].waveDistortion;

            if (userEffects.current.svg[svgInstanceId].waveDistortion) {
              svgMediaInstance.applyWaveDistortionEffect(
                `${style.frequency}`,
                `${style.strength}`,
              );
            } else {
              svgMediaInstance.removeEffect(
                "#fgSvgWaveDistortionFilter_" + svgInstanceId,
              );
            }

            handleAlertSvgEffect();

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={waveDistortionIcon}
              className="flex h-full w-full items-center justify-center"
              attributes={[
                { key: "width", value: "70%" },
                { key: "height", value: "70%" },
                { key: "fill", value: "#f2f2f2" },
                { key: "stroke", value: "#f2f2f2" },
              ]}
            />
          }
          hoverLabel="Wave distortion"
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

            svgMediaInstance.applyWaveDistortionEffect(
              `${style.frequency}`,
              `${style.strength}`,
            );

            handleAlertSvgEffect();
          }}
        />
        <SvgEffectButton
          svgInstanceId={svgInstanceId}
          filter="crackedGlass"
          active={userEffects.current.svg[svgInstanceId].crackedGlass}
          scrollingContainerRef={effectsContainerRef}
          clickFunctionCallback={() => {
            userEffects.current.svg[svgInstanceId].crackedGlass =
              !userEffects.current.svg[svgInstanceId].crackedGlass;
            const style =
              userEffectsStyles.current.svg[svgInstanceId].crackedGlass;

            if (userEffects.current.svg[svgInstanceId].crackedGlass) {
              svgMediaInstance.applyCrackedGlassEffect(
                `${style.density}`,
                `${style.detail}`,
                `${style.strength}`,
              );
            } else {
              svgMediaInstance.removeEffect(
                "#fgSvgCrackedGlassFilter_" + svgInstanceId,
              );
            }

            handleAlertSvgEffect();

            setRerender((prev) => !prev);
          }}
          content={
            <FgSVGElement
              src={crackedGlassIcon}
              className="flex h-full w-full items-center justify-center"
              attributes={[
                { key: "width", value: "70%" },
                { key: "height", value: "70%" },
                { key: "fill", value: "#f2f2f2" },
                { key: "stroke", value: "#f2f2f2" },
              ]}
            />
          }
          hoverLabel="Cracked glass"
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

            svgMediaInstance.applyCrackedGlassEffect(
              `${style.density}`,
              `${style.detail}`,
              `${style.strength}`,
            );

            handleAlertSvgEffect();
          }}
        />
      </div>
    </div>
  );
}
