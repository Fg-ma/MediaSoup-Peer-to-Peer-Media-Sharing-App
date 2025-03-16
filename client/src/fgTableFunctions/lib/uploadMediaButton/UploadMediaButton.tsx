import React, { useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useUserInfoContext } from "../../../context/userInfoContext/UserInfoContext";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const uploadIcon = nginxAssetServerBaseUrl + "svgs/uploadIcon.svg";

export default function UploadMediaButton() {
  const { table_id } = useUserInfoContext();

  const file = useRef<File | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clickFunction = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger the hidden input's click
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    file.current = e.target.files ? e.target.files[0] : undefined;

    handleFileUpload();
  };

  const handleFileUpload = async () => {
    if (!file.current) {
      return;
    }

    const url = `https://localhost:8045/upload/${table_id.current}/${uuidv4()}`;
    const formData = new FormData();
    formData.append("file", file.current);

    try {
      const xhr = new XMLHttpRequest();

      xhr.open("POST", url, true);

      xhr.send(formData);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        className='hidden'
        type='file'
        onChange={handleFileChange}
      />
      <FgButton
        className='flex h-full aspect-square rounded-full items-center justify-center relative hover:border-2 hover:border-fg-off-white'
        clickFunction={clickFunction}
        contentFunction={() => (
          <FgSVGElement
            src={uploadIcon}
            className='h-[75%] aspect-square flex justify-center items-center'
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
              { key: "fill", value: "#f2f2f2" },
            ]}
          />
        )}
        hoverContent={<FgHoverContentStandard content='Upload to table' />}
        options={{ hoverTimeoutDuration: 100 }}
        aria-label={"Upload file to table"}
      />
    </>
  );
}
