import React from "react";
import { Settings } from "../../typeConstant";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSlider from "../../../../../elements/fgSlider/FgSlider";
import FgSVG from "../../../../../elements/fgSVG/FgSVG";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const additionIcon = nginxAssetSeverBaseUrl + "svgs/additionIcon.svg";

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
    value: number
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

  return (
    <>
      {settings.envelopeType.mixGausianEnvelope.value.map((gausian, index) => (
        <div key={index} className='flex h-max w-full flex-col space-y-2'>
          <FgSlider
            className='h-10 w-full'
            externalValue={
              settings.envelopeType.mixGausianEnvelope.value[index].amplitude
            }
            externalStyleValue={
              settings.envelopeType.mixGausianEnvelope.value[index].amplitude
            }
            onValueChange={(value) => {
              handleChangeMixGaussianEnvelope(index, "amplitude", value.value);
            }}
            options={{
              initValue:
                settings.envelopeType.mixGausianEnvelope.value[index].amplitude,
              ticks: 6,
              rangeMax: 1,
              rangeMin: 0,
              precision: 2,
              orientation: "horizontal",
              tickLabels: false,
              topLabel: "Amplitude",
            }}
          />
          <FgSlider
            className='h-10 w-full'
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
            }}
          />
          <FgSlider
            className='h-10 w-full'
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
            }}
          />
        </div>
      ))}
      <FgButton
        className='flex h-10 w-full hover:bg-fg-white hover:text-fg-tone-black-1 rounded items-center justify-center'
        clickFunction={handleAddGaussian}
        contentFunction={() => (
          <FgSVG
            className='flex h-full aspect-square items-center justify-center'
            src={additionIcon}
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
              { key: "fill", value: "#f2f2f2" },
              { key: "stroke", value: "#f2f2f2" },
            ]}
          />
        )}
      />
    </>
  );
}
