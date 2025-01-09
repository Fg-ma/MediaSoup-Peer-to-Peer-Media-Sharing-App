import React, { useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import FgButton from "../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../fgElements/fgSVG/FgSVG";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const uploadIcon = nginxAssetSeverBaseUrl + "svgs/uploadIcon.svg";

export default function UploadMediaButton({
  table_id,
}: {
  table_id: React.MutableRefObject<string>;
}) {
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
        className='h-full aspect-square bg-fg-secondary'
        contentFunction={() => (
          <FgSVG
            src={uploadIcon}
            className='flex justify-center items-center'
            attributes={[
              { key: "width", value: "70%" },
              { key: "height", value: "70%" },
              { key: "fill", value: "white" },
            ]}
          />
        )}
        clickFunction={clickFunction}
      />
    </>
  );
}
