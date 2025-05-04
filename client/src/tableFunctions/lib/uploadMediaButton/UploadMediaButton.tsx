import React, { useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useUserInfoContext } from "../../../context/userInfoContext/UserInfoContext";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import { useUploadContext } from "../../../context/uploadContext/UploadContext";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;
const tableStaticContentServerBaseUrl =
  process.env.TABLE_STATIC_CONTENT_SERVER_BASE_URL;

const uploadIcon = nginxAssetServerBaseUrl + "svgs/uploadIcon.svg";

export default function UploadMediaButton() {
  const { tableId } = useUserInfoContext();
  const { sendUploadSignal, addCurrentUpload, removeCurrentUpload } =
    useUploadContext();

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

    const contentId = uuidv4();
    const metadata = {
      tableId: tableId.current,
      contentId,
      instanceId: uuidv4(),
      direction: "toTable",
      state: [],
    };

    try {
      const metaRes = await fetch(
        tableStaticContentServerBaseUrl + "upload-meta",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(metadata),
        },
      );

      const { uploadId } = await metaRes.json();

      const formData = new FormData();
      const filename = file.current.name;
      formData.append("file", file.current, filename);

      const xhr = new XMLHttpRequest();

      addCurrentUpload(contentId, {
        uploadUrl: URL.createObjectURL(file.current),
        filename,
        mimeType: "svg",
        size: file.current.size,
        progress: 0,
        paused: false,
      });

      setTimeout(
        () =>
          sendUploadSignal({
            type: "uploadStart",
            header: {
              contentId,
            },
          }),
        250,
      );

      xhr.onload = () => {
        removeCurrentUpload(contentId);

        sendUploadSignal({
          type: "uploadFinish",
          header: {
            contentId,
          },
        });
      };

      xhr.upload.onprogress = (event) => {
        sendUploadSignal({
          type: "uploadProgress",
          header: {
            contentId,
          },
          data: {
            progress: event.loaded / event.total,
          },
        });
      };

      xhr.onerror = () => {
        removeCurrentUpload(contentId);

        sendUploadSignal({
          type: "uploadError",
          header: {
            contentId,
          },
        });
      };

      xhr.open(
        "POST",
        tableStaticContentServerBaseUrl + `upload-file/${uploadId}`,
        true,
      );

      xhr.send(formData);
    } catch (error) {
      console.error("Error sending metadata:", error);
    }
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
