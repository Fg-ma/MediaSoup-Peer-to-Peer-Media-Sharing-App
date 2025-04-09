import React, { useEffect, useRef } from "react";
import FgButton from "../fgButton/FgButton";
import FgHoverContentStandard from "../fgHoverContentStandard/FgHoverContentStandard";
import FgSVGElement from "../fgSVGElement/FgSVGElement";
import { defaultInputOptions, InputOptionsType } from "./lib/typeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateForward = nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

export default function FgInput({
  placeholder,
  className,
  name,
  onSubmit,
  onChange,
  onUnfocus,
  externalValue,
  options,
}: {
  placeholder?: string;
  className?: string;
  name?: string;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUnfocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  externalValue?: string;
  options?: InputOptionsType;
}) {
  const fgInputOptions = { ...defaultInputOptions, ...options };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (fgInputOptions.autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [fgInputOptions.autoFocus]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onSubmit) onSubmit(event);
  };

  return (
    <form
      className={`${className} flex items-center justify-between overflow-hidden border-fg-white bg-fg-white text-fg-tone-black-3 text-opacity-80 focus-within:border-fg-red hover:border-fg-red`}
      onSubmit={handleSubmit}
    >
      <div className="h-max grow">
        <input
          ref={inputRef}
          placeholder={placeholder}
          name={name ? name : "defaultInput"}
          type="text"
          className={`${fgInputOptions.centerText ? "text-center" : ""} px-[${fgInputOptions.padding}rem] h-full w-full bg-fg-white focus:outline-none`}
          onChange={onChange}
          onBlur={onUnfocus}
          value={externalValue}
          autoComplete={fgInputOptions.autocomplete}
        />
      </div>
      {fgInputOptions.submitButton && (
        <FgButton
          className="mr-1 flex aspect-square h-[90%] items-center justify-center rounded-full border-fg-red pl-[1%]"
          style={{ borderWidth: "1px" }}
          contentFunction={() => (
            <FgSVGElement
              src={navigateForward}
              className="flex h-[95%] w-[95%] items-center justify-center"
              attributes={[
                { key: "width", value: "95%" },
                { key: "height", value: "95%" },
                { key: "fill", value: "#e62833" },
                { key: "stroke", value: "#e62833" },
              ]}
            />
          )}
          hoverContent={
            <FgHoverContentStandard content="Submit" style="light" />
          }
          options={{
            hoverSpacing: 4,
            hoverType: "above",
            hoverTimeoutDuration: 3500,
            hoverZValue: 1000000000000000,
          }}
          type="submit"
        />
      )}
    </form>
  );
}
