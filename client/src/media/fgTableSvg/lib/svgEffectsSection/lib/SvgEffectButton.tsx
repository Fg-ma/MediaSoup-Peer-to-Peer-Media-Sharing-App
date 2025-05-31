import React, { ReactElement, useState } from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import {
  filtersMeta,
  FiltersTypes,
} from "../../../../../elements/bezier/lib/typeConstant";
import FgSlider from "../../../../../elements/fgSlider/FgSlider";
import { useEffectsContext } from "../../../../../context/effectsContext/EffectsContext";
import ColorPickerButton from "../../../../../elements/colorPickerButton/ColorPickerButton";

export default function SvgEffectButton({
  svgInstanceId,
  filter,
  scrollingContainerRef,
  content,
  active,
  hoverLabel,
  colorPickerRefs,
  clickFunctionCallback,
  handleValueChange,
  handleAcceptColor,
}: {
  svgInstanceId: string;
  filter: FiltersTypes;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
  content: ReactElement;
  active: boolean;
  hoverLabel: string;
  colorPickerRefs?: { [key: string]: React.RefObject<HTMLDivElement> };
  clickFunctionCallback?: () => void;
  handleValueChange?: (key: string, value: number) => void;
  handleAcceptColor?: (key: string, hexa: string) => void;
}) {
  const { staticContentEffectsStyles } = useEffectsContext();

  const [_, setRerender] = useState(false);

  return (
    <FgButton
      className={`${
        active ? "border-fg-red-light" : "border-fg-white"
      } flex !aspect-square h-full items-center justify-center rounded-full border-2 hover:border-fg-red-light`}
      clickFunction={async () => {
        if (clickFunctionCallback) clickFunctionCallback();
      }}
      contentFunction={() => content}
      hoverContent={<FgHoverContentStandard content={hoverLabel} />}
      holdFunction={() => {}}
      holdContent={
        <div className="pointer-events-auto h-max w-60 rounded bg-fg-tone-black-2 p-2 font-K2D text-xl text-fg-white">
          {filtersMeta[filter].options.length !== 0 &&
            filtersMeta[filter].options.map((option) =>
              option.type === "number" ? (
                <div key={option.key} className="h-max w-[95%]">
                  <FgSlider
                    className="h-16"
                    externalValue={
                      // @ts-ignore-error no coherence between filter and option.key
                      staticContentEffectsStyles.current.svg[svgInstanceId][
                        filter
                      ][option.key]
                    }
                    externalStyleValue={
                      // @ts-ignore-error no coherence between filter and option.key
                      staticContentEffectsStyles.current.svg[svgInstanceId][
                        filter
                      ][option.key]
                    }
                    onValueChange={(value) => {
                      if (handleValueChange) {
                        handleValueChange(option.key, value.value);
                        setRerender((prev) => !prev);
                      }
                    }}
                    options={{
                      initValue:
                        // @ts-ignore-error no coherence between filter and option.key
                        staticContentEffectsStyles.current.svg[svgInstanceId][
                          filter
                        ][option.key],
                      ticks: option.ticks,
                      rangeMax: option.rangeMax,
                      rangeMin: option.rangeMin,
                      orientation: "horizontal",
                      tickLabels: false,
                      precision: option.precision,
                      topLabel: option.title,
                      labelsColor: "#f2f2f2",
                    }}
                  />
                </div>
              ) : (
                <div
                  key={option.key}
                  className="flex h-max w-[95%] items-center justify-between"
                >
                  {option.title}
                  <ColorPickerButton
                    className="aspect-square h-8"
                    defaultColor={
                      // @ts-ignore filter and option.key are strings not types
                      staticContentEffectsStyles.current.svg[svgInstanceId][
                        filter
                      ][option.key]
                    }
                    handleAcceptColorCallback={(_hex, hexa) => {
                      if (handleAcceptColor) {
                        handleAcceptColor(option.key, hexa);
                        setRerender((prev) => !prev);
                      }
                    }}
                    isAlpha={true}
                    externalColorPickerPanelRef={
                      colorPickerRefs ? colorPickerRefs[option.key] : undefined
                    }
                  />
                </div>
              ),
            )}
        </div>
      }
      scrollingContainerRef={scrollingContainerRef}
      holdToggleExclusionRefs={
        colorPickerRefs ? Object.values(colorPickerRefs) : undefined
      }
      options={{
        hoverTimeoutDuration: 750,
        holdKind: "toggle",
        holdSpacing: 4,
        hoverSpacing: 4,
        holdTimeoutDuration: 750,
        holdType: "above",
      }}
    />
  );
}
