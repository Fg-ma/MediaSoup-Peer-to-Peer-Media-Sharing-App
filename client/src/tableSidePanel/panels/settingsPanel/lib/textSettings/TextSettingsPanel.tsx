import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../../../context/mediaContext/MediaContext";
import { useSocketContext } from "../../../../..//context/socketContext/SocketContext";
import { useEffectsContext } from "../../../../../context/effectsContext/EffectsContext";
import { useGeneralContext } from "../../../../../context/generalContext/GeneralContext";
import { useSignalContext } from "../../../../../context/signalContext/SignalContext";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import TextSettingsController from "./lib/TextSettingsController";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import ColorsPage from "./lib/ColorsPage";
import FontStylePage from "./lib/FontStylePage";
import CursorStylePage from "./lib/CursorStylePage";
import HoverElement from "../../../../../elements/hoverElement/HoverElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";
const additionIcon = nginxAssetServerBaseUrl + "svgs/additionIcon.svg";
const minusIcon = nginxAssetServerBaseUrl + "svgs/minusIcon.svg";
const editIcon = nginxAssetServerBaseUrl + "svgs/editIcon.svg";
const mapIcon = nginxAssetServerBaseUrl + "svgs/mapIcon.svg";
const syncIcon = nginxAssetServerBaseUrl + "svgs/syncIcon.svg";
const desyncIcon = nginxAssetServerBaseUrl + "svgs/desyncIcon.svg";
const backgroundIcon = nginxAssetServerBaseUrl + "svgs/backgroundIcon.svg";
const navigateForwardIcon =
  nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

export default function TextSettingsPanel({
  instanceId,
  setExternalRerender,
}: {
  instanceId: string;
  setExternalRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { staticContentMedia } = useMediaContext();
  const { tableStaticContentSocket } = useSocketContext();
  const { staticContentEffectsStyles } = useEffectsContext();
  const { currentSettingsActive } = useGeneralContext();
  const { sendSettingsSignal } = useSignalContext();

  const textMediaInstance = useRef(
    staticContentMedia.current.text.tableInstances[instanceId],
  );

  const effectsStyles =
    staticContentEffectsStyles.current.text[
      textMediaInstance.current.textInstanceId
    ];

  const [colorsPageActive, setColorsPageActive] = useState(false);
  const [fontStylePageActive, setFontStylePageActive] = useState(false);
  const [cursorStylePageActive, setCursorStylePageActive] = useState(false);
  const filenameRef = useRef<HTMLDivElement>(null);
  const holdTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const holdInterval = useRef<NodeJS.Timeout | undefined>(undefined);
  const letterGapButtonsRef = useRef<HTMLDivElement>(null);
  const fontSizeButtonsRef = useRef<HTMLDivElement>(null);

  const [_, setRerender] = useState(false);

  const textSettingsController = new TextSettingsController(
    textMediaInstance,
    tableStaticContentSocket,
    staticContentEffectsStyles,
    setRerender,
  );

  useEffect(() => {
    textMediaInstance.current =
      staticContentMedia.current.text.tableInstances[instanceId];

    setColorsPageActive(false);
    setFontStylePageActive(false);
    setCursorStylePageActive(false);

    setRerender((prev) => !prev);
  }, [instanceId]);

  useEffect(() => {
    setRerender((prev) => !prev);
  }, []);

  return (
    <div
      className="mx-6 my-4 flex h-max max-w-[320px] flex-col items-center justify-center space-y-1 rounded border border-fg-white bg-fg-tone-black-8 px-2 py-2 font-K2D text-fg-white"
      style={{ width: "calc(100% - 3rem)" }}
    >
      <div className="flex h-7 w-full items-center justify-start px-1">
        <FgButton
          className="mr-2 flex h-full items-center justify-center"
          contentFunction={() => (
            <FgSVGElement
              src={closeIcon}
              className="aspect-square h-[55%] fill-fg-white stroke-fg-white"
              attributes={[
                { key: "width", value: "100%" },
                { key: "height", value: "100%" },
              ]}
            />
          )}
          clickFunction={() => {
            const idx = currentSettingsActive.current.findIndex(
              (active) =>
                "text" === active.contentType &&
                instanceId === active.instanceId,
            );

            if (idx !== -1) {
              currentSettingsActive.current.splice(idx, 1);
              sendSettingsSignal({
                type: "sidePanelChanged",
              });
              setExternalRerender((prev) => !prev);
            }
          }}
          hoverContent={
            <FgHoverContentStandard content={"Close settings"} style="light" />
          }
          options={{
            hoverSpacing: 4,
            hoverTimeoutDuration: 3500,
            hoverType: "above",
          }}
        />
        <HoverElement
          externalRef={filenameRef}
          className="truncate py-1 font-Josefin text-2xl text-fg-white underline decoration-fg-red-light underline-offset-4"
          style={{ width: "calc(100% - 2.25rem)" }}
          content={<>{textMediaInstance.current.textMedia.filename}</>}
          hoverContent={
            (filenameRef.current?.scrollWidth ?? 0) >
            (filenameRef.current?.clientWidth ?? 0) ? (
              <FgHoverContentStandard
                style="light"
                content={textMediaInstance.current.textMedia.filename}
              />
            ) : undefined
          }
          options={{
            hoverSpacing: 4,
            hoverType: "above",
            hoverTimeoutDuration: 750,
          }}
        />
      </div>
      <FgButton
        className="h-7 w-full"
        contentFunction={() => (
          <div
            className={`${
              textMediaInstance.current.settings.synced.value
                ? "bg-fg-white fill-fg-tone-black-1 stroke-fg-tone-black-1 text-fg-tone-black-1"
                : "fill-fg-white stroke-fg-white"
            } flex h-full w-full items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1`}
          >
            <FgSVGElement
              src={
                textMediaInstance.current.settings.synced.value
                  ? desyncIcon
                  : syncIcon
              }
              className="mr-2 flex aspect-square h-full items-center justify-center"
              attributes={[
                { key: "width", value: "80%" },
                { key: "height", value: "80%" },
              ]}
            />
            <div className="truncate">
              {textMediaInstance.current.settings.synced.value
                ? "Desync"
                : "Sync"}
            </div>
          </div>
        )}
        clickFunction={textSettingsController.handleSync}
        hoverContent={
          <FgHoverContentStandard
            content={
              textMediaInstance.current.settings.synced.value
                ? "Desync (h)"
                : "Sync (h)"
            }
            style="light"
          />
        }
        options={{
          hoverSpacing: 4,
          hoverTimeoutDuration: 3500,
          hoverType: "above",
        }}
      />
      <FgButton
        className="h-7 w-full"
        contentFunction={() => (
          <div
            className={`${
              textMediaInstance.current.settings.background.value
                ? "bg-fg-white fill-fg-tone-black-1 stroke-fg-tone-black-1 text-fg-tone-black-1"
                : "fill-fg-white stroke-fg-white"
            } flex h-full w-full items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1`}
          >
            <FgSVGElement
              src={backgroundIcon}
              className="mr-2 flex aspect-square h-full items-center justify-center"
              attributes={[
                { key: "width", value: "80%" },
                { key: "height", value: "80%" },
              ]}
            />
            <div className="truncate">Set as background</div>
          </div>
        )}
        clickFunction={textSettingsController.handleSetAsBackground}
        hoverContent={
          <FgHoverContentStandard
            content="Set as background (b)"
            style="light"
          />
        }
        options={{
          hoverSpacing: 4,
          hoverTimeoutDuration: 3500,
          hoverType: "above",
        }}
      />
      <FgButton
        className="h-7 w-full"
        contentFunction={() => (
          <div className="flex h-full w-full items-center justify-start text-nowrap rounded fill-fg-white stroke-fg-white px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
            <FgSVGElement
              src={editIcon}
              className="mr-2 flex aspect-square h-full items-center justify-center"
              attributes={[
                { key: "width", value: "80%" },
                { key: "height", value: "80%" },
              ]}
            />
            <div className="truncate">
              {textMediaInstance.current.isReadOnly ? "Edit" : "Stop editing"}
            </div>
          </div>
        )}
        clickFunction={textSettingsController.handleEdit}
        hoverContent={
          <FgHoverContentStandard
            content={
              textMediaInstance.current.isReadOnly
                ? "Edit (e)"
                : "Stop editing (e)"
            }
            style="light"
          />
        }
        options={{
          hoverSpacing: 4,
          hoverTimeoutDuration: 3500,
          hoverType: "above",
        }}
      />
      <FgButton
        className="h-7 w-full"
        contentFunction={() => (
          <div className="flex h-full w-full items-center justify-start text-nowrap rounded fill-fg-white stroke-fg-white px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
            <FgSVGElement
              src={mapIcon}
              className="mr-2 flex aspect-square h-full items-center justify-center"
              attributes={[
                { key: "width", value: "80%" },
                { key: "height", value: "80%" },
              ]}
            />
            <div className="truncate">
              {textMediaInstance.current.settings.minimap.value
                ? "Close minimap"
                : "Open minimap"}
            </div>
          </div>
        )}
        clickFunction={textSettingsController.handleMinimap}
        hoverContent={
          <FgHoverContentStandard
            content={
              textMediaInstance.current.settings.minimap.value
                ? "Open minimap (m)"
                : "Open minimap (m)"
            }
            style="light"
          />
        }
        options={{
          hoverSpacing: 4,
          hoverTimeoutDuration: 3500,
          hoverType: "above",
        }}
      />
      <FgButton
        className="h-7 w-full"
        contentFunction={() => (
          <div className="flex w-full items-center justify-between space-x-4 text-nowrap rounded fill-fg-white stroke-fg-white px-2 hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
            <div>Colors</div>
            <FgSVGElement
              className={`${colorsPageActive ? "-scale-x-100" : ""} rotate-90`}
              src={navigateForwardIcon}
              attributes={[
                { key: "width", value: "1.25rem" },
                { key: "height", value: "1.25rem" },
              ]}
            />
          </div>
        )}
        clickFunction={() => setColorsPageActive((prev) => !prev)}
        hoverContent={
          <FgHoverContentStandard
            content={colorsPageActive ? "Close colors" : "Open colors"}
            style="light"
          />
        }
        options={{
          hoverSpacing: 4,
          hoverTimeoutDuration: 3500,
          hoverType: "above",
        }}
      />
      {colorsPageActive && (
        <ColorsPage
          textMediaInstance={textMediaInstance}
          setRerender={setRerender}
        />
      )}
      <div className="flex h-7 w-full items-center justify-between">
        <div
          className="truncate px-2 text-lg"
          style={{
            width: `calc(100% - ${fontSizeButtonsRef.current?.clientWidth ?? 0}px)`,
          }}
        >
          Font size
        </div>
        <div
          ref={fontSizeButtonsRef}
          className="flex h-5 w-max items-center justify-center space-x-1"
        >
          <FgButton
            className="h-full"
            clickFunction={() =>
              textSettingsController.handleFontSizeChange("increment", 1)
            }
            contentFunction={() => (
              <FgSVGElement
                src={additionIcon}
                className="aspect-square h-full"
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                  { key: "fill", value: "#f2f2f2" },
                  { key: "stroke", value: "#f2f2f2" },
                ]}
              />
            )}
            pointerDownFunction={() => {
              if (holdTimeout.current) {
                clearTimeout(holdTimeout.current);
                holdTimeout.current = undefined;
              }
              if (holdInterval.current) {
                clearInterval(holdInterval.current);
                holdInterval.current = undefined;
              }

              holdTimeout.current = setTimeout(() => {
                holdInterval.current = setInterval(() => {
                  textSettingsController.handleFontSizeChange("increment", 1);
                }, 50);
              }, 1000);
            }}
            pointerUpFunction={() => {
              if (holdTimeout.current) {
                clearTimeout(holdTimeout.current);
                holdTimeout.current = undefined;
              }
              if (holdInterval.current) {
                clearInterval(holdInterval.current);
                holdInterval.current = undefined;
              }
            }}
            hoverContent={
              <FgHoverContentStandard content="Increase" style="light" />
            }
            options={{
              hoverType: "above",
              hoverSpacing: 4,
              hoverTimeoutDuration: 2500,
            }}
          />
          <input
            type="text"
            className="flex h-full w-6 bg-transparent text-center font-K2D text-base focus:outline-none"
            value={effectsStyles.fontSize.slice(0, -2)}
            onChange={(event) => {
              const inputValue = event.target.value;
              const parsedValue =
                inputValue.trim() !== "" && !isNaN(Number(inputValue))
                  ? parseInt(inputValue, 10)
                  : 1;

              textSettingsController.handleFontSizeChange("value", parsedValue);
            }}
            placeholder="Size..."
          />
          <FgButton
            className="h-full"
            clickFunction={() =>
              textSettingsController.handleFontSizeChange("decrement", 1)
            }
            contentFunction={() => (
              <FgSVGElement
                src={minusIcon}
                className="aspect-square h-full"
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                  { key: "fill", value: "#f2f2f2" },
                  { key: "stroke", value: "#f2f2f2" },
                ]}
              />
            )}
            pointerDownFunction={() => {
              if (holdTimeout.current) {
                clearTimeout(holdTimeout.current);
                holdTimeout.current = undefined;
              }
              if (holdInterval.current) {
                clearInterval(holdInterval.current);
                holdInterval.current = undefined;
              }

              holdTimeout.current = setTimeout(() => {
                holdInterval.current = setInterval(() => {
                  textSettingsController.handleFontSizeChange("decrement", 1);
                }, 50);
              }, 1000);
            }}
            pointerUpFunction={() => {
              if (holdTimeout.current) {
                clearTimeout(holdTimeout.current);
                holdTimeout.current = undefined;
              }
              if (holdInterval.current) {
                clearInterval(holdInterval.current);
                holdInterval.current = undefined;
              }
            }}
            hoverContent={
              <FgHoverContentStandard content="Decrease" style="light" />
            }
            options={{
              hoverType: "above",
              hoverSpacing: 4,
              hoverTimeoutDuration: 2500,
            }}
          />
        </div>
      </div>
      <FgButton
        className="h-7 w-full"
        contentFunction={() => (
          <div className="flex w-full items-center justify-between space-x-4 text-nowrap rounded fill-fg-white stroke-fg-white px-2 hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
            <div>Font style</div>
            <FgSVGElement
              className={`${fontStylePageActive ? "-scale-x-100" : ""} rotate-90`}
              src={navigateForwardIcon}
              attributes={[
                { key: "width", value: "1.25rem" },
                { key: "height", value: "1.25rem" },
              ]}
            />
          </div>
        )}
        clickFunction={() => setFontStylePageActive((prev) => !prev)}
        hoverContent={
          <FgHoverContentStandard
            content={
              fontStylePageActive ? "Close font style" : "Open font style"
            }
            style="light"
          />
        }
        options={{
          hoverSpacing: 4,
          hoverTimeoutDuration: 3500,
          hoverType: "above",
        }}
      />
      {fontStylePageActive && (
        <FontStylePage
          textMediaInstance={textMediaInstance}
          setRerender={setRerender}
        />
      )}
      <div className="flex h-7 w-full items-center justify-between">
        <div
          className="truncate px-2 text-lg"
          style={{
            width: `calc(100% - ${letterGapButtonsRef.current?.clientWidth ?? 0}px)`,
          }}
        >
          Letter gap
        </div>
        <div
          ref={letterGapButtonsRef}
          className="flex h-5 w-max items-center justify-center space-x-1"
        >
          <FgButton
            className="h-full"
            clickFunction={() =>
              textSettingsController.handleLetterSpacingChange("increment", 1)
            }
            pointerDownFunction={() => {
              if (holdTimeout.current) {
                clearTimeout(holdTimeout.current);
                holdTimeout.current = undefined;
              }
              if (holdInterval.current) {
                clearInterval(holdInterval.current);
                holdInterval.current = undefined;
              }

              holdTimeout.current = setTimeout(() => {
                holdInterval.current = setInterval(() => {
                  textSettingsController.handleLetterSpacingChange(
                    "increment",
                    1,
                  );
                }, 50);
              }, 1000);
            }}
            pointerUpFunction={() => {
              if (holdTimeout.current) {
                clearTimeout(holdTimeout.current);
                holdTimeout.current = undefined;
              }
              if (holdInterval.current) {
                clearInterval(holdInterval.current);
                holdInterval.current = undefined;
              }
            }}
            contentFunction={() => (
              <FgSVGElement
                src={additionIcon}
                className="aspect-square h-full"
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                  { key: "fill", value: "#f2f2f2" },
                  { key: "stroke", value: "#f2f2f2" },
                ]}
              />
            )}
            hoverContent={
              <FgHoverContentStandard content="Increase" style="light" />
            }
            options={{
              hoverType: "above",
              hoverSpacing: 4,
              hoverTimeoutDuration: 2500,
            }}
          />
          <input
            type="text"
            className="flex h-full w-6 bg-transparent text-center font-K2D text-base focus:outline-none"
            value={effectsStyles.letterSpacing}
            onChange={(event) => {
              const inputValue = event.target.value;
              const parsedValue =
                inputValue.trim() !== "" && !isNaN(Number(inputValue))
                  ? parseInt(inputValue, 10)
                  : 0;

              textSettingsController.handleLetterSpacingChange(
                "value",
                parsedValue,
              );
            }}
            placeholder="Space..."
          />
          <FgButton
            className="h-full"
            clickFunction={() =>
              textSettingsController.handleLetterSpacingChange("decrement", 1)
            }
            contentFunction={() => (
              <FgSVGElement
                src={minusIcon}
                className="aspect-square h-full"
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                  { key: "fill", value: "#f2f2f2" },
                  { key: "stroke", value: "#f2f2f2" },
                ]}
              />
            )}
            pointerDownFunction={() => {
              if (holdTimeout.current) {
                clearTimeout(holdTimeout.current);
                holdTimeout.current = undefined;
              }
              if (holdInterval.current) {
                clearInterval(holdInterval.current);
                holdInterval.current = undefined;
              }

              holdTimeout.current = setTimeout(() => {
                holdInterval.current = setInterval(() => {
                  textSettingsController.handleLetterSpacingChange(
                    "decrement",
                    1,
                  );
                }, 50);
              }, 1000);
            }}
            pointerUpFunction={() => {
              if (holdTimeout.current) {
                clearTimeout(holdTimeout.current);
                holdTimeout.current = undefined;
              }
              if (holdInterval.current) {
                clearInterval(holdInterval.current);
                holdInterval.current = undefined;
              }
            }}
            hoverContent={
              <FgHoverContentStandard content="Decrease" style="light" />
            }
            options={{
              hoverType: "above",
              hoverSpacing: 4,
              hoverTimeoutDuration: 2500,
            }}
          />
        </div>
      </div>
      <FgButton
        className="h-7 w-full"
        contentFunction={() => (
          <div className="flex w-full items-center justify-between space-x-4 text-nowrap rounded fill-fg-white stroke-fg-white px-2 hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
            <div>Cursor</div>
            <FgSVGElement
              className={`${cursorStylePageActive ? "-scale-x-100" : ""} rotate-90`}
              src={navigateForwardIcon}
              attributes={[
                { key: "width", value: "1.25rem" },
                { key: "height", value: "1.25rem" },
              ]}
            />
          </div>
        )}
        clickFunction={() => setCursorStylePageActive((prev) => !prev)}
        hoverContent={
          <FgHoverContentStandard
            content={cursorStylePageActive ? "Close cursor" : "Open cursor"}
            style="light"
          />
        }
        options={{
          hoverSpacing: 4,
          hoverTimeoutDuration: 3500,
          hoverType: "above",
        }}
      />
      {cursorStylePageActive && (
        <CursorStylePage
          textMediaInstance={textMediaInstance}
          setRerender={setRerender}
        />
      )}
      <FgButton
        className="h-7 w-full"
        contentFunction={() => (
          <div className="flex h-full w-full items-center justify-start text-nowrap rounded fill-fg-white stroke-fg-white px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
            <FgSVGElement
              src={closeIcon}
              className="mr-2 flex aspect-square h-[45%] items-center justify-center"
              attributes={[
                { key: "width", value: "100%" },
                { key: "height", value: "100%" },
              ]}
            />
            <div className="truncate">Reset all</div>
          </div>
        )}
        clickFunction={() => textSettingsController.handleResetAll()}
        hoverContent={
          <FgHoverContentStandard content="Reset all settings" style="light" />
        }
        options={{
          hoverSpacing: 4,
          hoverTimeoutDuration: 3500,
          hoverType: "above",
        }}
      />
    </div>
  );
}
