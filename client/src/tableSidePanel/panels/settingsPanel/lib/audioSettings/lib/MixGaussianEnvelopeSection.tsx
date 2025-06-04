import React from "react";
import { Settings } from "../../typeConstant";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSlider from "../../../../../elements/fgSlider/FgSlider";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const additionIcon = nginxAssetServerBaseUrl + "svgs/additionIcon.svg";
const minusIcon = nginxAssetServerBaseUrl + "svgs/minusIcon.svg";

export default function MixGaussianEnvelopeSection({
  settings,
  setSettings,
}: {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}) {
  const handleChangeMixGaussianEnvelope = (
    index: number,
    valueType: "amplitude" | "mean" | "stdDev",
    value: number,
  ) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.envelopeType.mixGausianEnvelope.value[index][valueType] =
        value;

      return newSettings;
    });
  };

  const handleAddGaussian = () => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.envelopeType.mixGausianEnvelope.value.push({
        amplitude: 0.8,
        mean: 0.2,
        stdDev: 0.05,
      });

      return newSettings;
    });
  };

  const handleRemoveGaussian = (index: number) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.envelopeType.mixGausianEnvelope.value.splice(index, 1);

      return newSettings;
    });
  };

  return (
    <>
      {settings.envelopeType.mixGausianEnvelope.value.map((gausian, index) => (
        <div
          key={index}
          className="relative h-48 w-full rounded border-2 border-fg-white-95 bg-fg-tone-black-5"
        >
          <div className="absolute left-1/2 top-1 w-max -translate-x-1/2 font-Josefin text-lg text-fg-white">
            Gaussian envelope{" "}
            <span className="text-xl text-fg-red-light">{index + 1}</span>
          </div>
          <div className="absolute left-1/2 top-[26px] h-16 w-[95%] -translate-x-1/2">
            <FgSlider
              className="h-full w-full"
              externalValue={
                settings.envelopeType.mixGausianEnvelope.value[index].amplitude
              }
              externalStyleValue={
                settings.envelopeType.mixGausianEnvelope.value[index].amplitude
              }
              onValueChange={(value) => {
                handleChangeMixGaussianEnvelope(
                  index,
                  "amplitude",
                  value.value,
                );
              }}
              options={{
                initValue:
                  settings.envelopeType.mixGausianEnvelope.value[index]
                    .amplitude,
                ticks: 6,
                rangeMax: 1,
                rangeMin: 0,
                precision: 2,
                orientation: "horizontal",
                tickLabels: false,
                topLabel: "Amplitude",
                labelsColor: "#f2f2f2",
              }}
            />
          </div>
          <div className="absolute left-1/2 top-[64px] h-16 w-[95%] -translate-x-1/2">
            <FgSlider
              className="h-full w-full"
              externalValue={
                settings.envelopeType.mixGausianEnvelope.value[index].mean
              }
              externalStyleValue={
                settings.envelopeType.mixGausianEnvelope.value[index].mean
              }
              onValueChange={(value) => {
                handleChangeMixGaussianEnvelope(index, "mean", value.value);
              }}
              options={{
                initValue:
                  settings.envelopeType.mixGausianEnvelope.value[index].mean,
                ticks: 6,
                rangeMax: 1,
                rangeMin: 0,
                precision: 2,
                orientation: "horizontal",
                tickLabels: false,
                topLabel: "Mean",
                labelsColor: "#f2f2f2",
              }}
            />
          </div>
          <div className="absolute left-1/2 top-[102px] h-16 w-[95%] -translate-x-1/2">
            <FgSlider
              className="h-full w-full"
              externalValue={
                settings.envelopeType.mixGausianEnvelope.value[index].stdDev
              }
              externalStyleValue={
                settings.envelopeType.mixGausianEnvelope.value[index].stdDev
              }
              onValueChange={(value) => {
                handleChangeMixGaussianEnvelope(index, "stdDev", value.value);
              }}
              options={{
                initValue:
                  settings.envelopeType.mixGausianEnvelope.value[index].stdDev,
                ticks: 6,
                rangeMax: 1,
                rangeMin: 0,
                precision: 2,
                orientation: "horizontal",
                tickLabels: false,
                topLabel: "Standard deviation",
                labelsColor: "#f2f2f2",
              }}
            />
          </div>
          <FgButton
            className="absolute left-1/2 top-[154px] flex h-6 w-[95%] -translate-x-1/2 items-center justify-center rounded-sm fill-fg-white stroke-fg-white hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1"
            clickFunction={() => handleRemoveGaussian(index)}
            contentFunction={() => (
              <FgSVGElement
                className="flex aspect-square h-full items-center justify-center"
                src={minusIcon}
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                ]}
              />
            )}
          />
        </div>
      ))}
      <FgButton
        className="flex h-8 w-full items-center justify-center rounded fill-fg-white stroke-fg-white hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1"
        style={{ marginTop: "1rem" }}
        clickFunction={handleAddGaussian}
        contentFunction={() => (
          <FgSVGElement
            className="flex aspect-square h-full items-center justify-center"
            src={additionIcon}
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        )}
      />
    </>
  );
}
