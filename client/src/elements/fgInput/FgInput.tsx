import React from "react";
import FgButton from "../fgButton/FgButton";
import FgHoverContentStandard from "../fgHoverContentStandard/FgHoverContentStandard";
import FgSVG from "../fgSVG/FgSVG";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateForward = nginxAssetSeverBaseUrl + "svgs/navigateForward.svg";

export default function FgInput({
  placeholder,
  className,
  name,
  onSubmit,
  onChange,
  externalValue,
  options = {
    submitButton: true,
  },
}: {
  placeholder?: string;
  className?: string;
  name?: string;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  externalValue?: string;
  options?: {
    submitButton: boolean;
  };
}) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onSubmit) onSubmit(event);
  };

  return (
    <form
      className={`${className} bg-fg-white text-fg-tone-black-3 text-opacity-80 border-fg-white focus-within:border-fg-red hover:border-fg-red flex justify-between items-center overflow-hidden`}
      onSubmit={handleSubmit}
    >
      <div className='grow h-max'>
        <input
          placeholder={placeholder}
          name={name ? name : "defaultInput"}
          type='text'
          className='w-full h-full px-2 focus:outline-none bg-fg-white'
          onChange={onChange}
          value={externalValue}
        />
      </div>
      {options.submitButton && (
        <FgButton
          className='h-[90%] aspect-square rounded-full border-fg-red flex items-center justify-center pl-[1%] mr-1'
          style={{ borderWidth: "1px" }}
          contentFunction={() => (
            <FgSVG
              src={navigateForward}
              className='w-[95%] h-[95%] flex items-center justify-center'
              attributes={[
                { key: "width", value: "95%" },
                { key: "height", value: "95%" },
                { key: "fill", value: "#e62833" },
                { key: "stroke", value: "#e62833" },
              ]}
            />
          )}
          hoverContent={
            <FgHoverContentStandard content='Submit' style='light' />
          }
          options={{
            hoverSpacing: 4,
            hoverType: "above",
            hoverTimeoutDuration: 3500,
            hoverZValue: 1000000000000000,
          }}
          type='submit'
        />
      )}
    </form>
  );
}
