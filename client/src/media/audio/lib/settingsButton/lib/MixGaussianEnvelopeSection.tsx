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
          className='h-48 w-full bg-fg-tone-black-5 rounded relative border-2 border-fg-white-95'
        >
          <div className='font-Josefin text-fg-white absolute top-1 left-1/2 -translate-x-1/2 w-max text-lg'>
            Gaussian envelope{" "}
            <span className='text-fg-red-light'>{index + 1}</span>
          </div>
          <div className='h-16 w-[95%] absolute top-[26px] left-1/2 -translate-x-1/2'>
            <FgSlider
              className='h-full w-full'
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
                  value.value
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
          <div className='h-16 w-[95%] absolute top-[64px] left-1/2 -translate-x-1/2'>
            <FgSlider
              className='h-full w-full'
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
          <div className='h-16 w-[95%] absolute top-[102px] left-1/2 -translate-x-1/2'>
            <FgSlider
              className='h-full w-full'
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
            className='absolute top-[154px] left-1/2 -translate-x-1/2 flex h-6 w-[95%] hover:bg-fg-white hover:text-fg-tone-black-1 rounded-sm items-center justify-center hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 fill-fg-white stroke-fg-white'
            clickFunction={() => handleRemoveGaussian(index)}
            contentFunction={() => (
              <FgSVGElement
                className='flex h-full aspect-square items-center justify-center'
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
        className='flex h-8 w-full hover:bg-fg-white hover:text-fg-tone-black-1 rounded items-center justify-center hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 fill-fg-white stroke-fg-white'
        style={{ marginTop: "1rem" }}
        clickFunction={handleAddGaussian}
        contentFunction={() => (
          <FgSVGElement
            className='flex h-full aspect-square items-center justify-center'
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
