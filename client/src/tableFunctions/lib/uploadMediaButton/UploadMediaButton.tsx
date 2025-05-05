import React, { useRef } from "react";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import { useToolsContext } from "../../../context/toolsContext/ToolsContext";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const uploadIcon = nginxAssetServerBaseUrl + "svgs/uploadIcon.svg";

export default function UploadMediaButton() {
  const { uploader } = useToolsContext();

  const file = useRef<File | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clickFunction = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    file.current = e.target.files ? e.target.files[0] : undefined;

    if (file.current) uploader.current?.uploadToTable(file.current);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        className="hidden"
        type="file"
        onChange={handleFileChange}
      />
      <FgButton
        className="relative flex aspect-square h-full items-center justify-center rounded-full hover:border-2 hover:border-fg-off-white"
        clickFunction={clickFunction}
        contentFunction={() => (
          <FgSVGElement
            src={uploadIcon}
            className="flex aspect-square h-[75%] items-center justify-center"
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
              { key: "fill", value: "#f2f2f2" },
            ]}
          />
        )}
        hoverContent={<FgHoverContentStandard content="Upload to table" />}
        options={{ hoverTimeoutDuration: 100 }}
        aria-label={"Upload file to table"}
      />
    </>
  );
}
