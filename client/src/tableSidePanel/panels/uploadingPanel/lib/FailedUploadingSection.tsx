import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUserInfoContext } from "../../../../context/userInfoContext/UserInfoContext";
import { useSocketContext } from "../../../../context/socketContext/SocketContext";
import FgHoverContentStandard from "../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import HoverElement from "../../../../elements/hoverElement/HoverElement";
import { useToolsContext } from "../../../../context/toolsContext/ToolsContext";
import FgSVGElement from "../../../../elements/fgSVGElement/FgSVGElement";
import FgImageElement from "../../../../elements/fgImageElement/FgImageElement";
import ChunkUploader from "../../../../tools/uploader/lib/chunkUploader/ChunkUploader";
import TextChunkUploader from "../../../../tools/uploader/lib/textChunkUploader/TextChunkUploader";
import VideoChunkUploader from "../../../../tools/uploader/lib/videoChunkUploader/VideoChunkUploader";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";
const textIcon = nginxAssetServerBaseUrl + "svgs/textIcon.svg";

export default function FailedUploadingSection({
  upload,
}: {
  upload: ChunkUploader | TextChunkUploader | VideoChunkUploader;
}) {
  const [_, setRerender] = useState(false);
  const [hovering, setHovering] = useState(false);
  const clickState = useRef<"delete" | "retry">("retry");
  const failedUploadingSectionRef = useRef<HTMLDivElement>(null);
  const filenameRef = useRef<HTMLDivElement>(null);

  const clickFunction = async () => {
    if (clickState.current === "retry") {
      upload.retryUpload();
    } else {
      upload.deconstructor();
    }
  };

  const onPointerEnter = () => {
    setHovering(true);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!failedUploadingSectionRef.current) return;
    const { left, width } =
      failedUploadingSectionRef.current.getBoundingClientRect();
    const offsetX = event.clientX - left;

    if (offsetX >= width - 48) {
      if (clickState.current !== "delete") {
        clickState.current = "delete";
        setRerender((prev) => !prev);
      }
    } else {
      if (clickState.current !== "retry") {
        clickState.current = "retry";
        setRerender((prev) => !prev);
      }
    }
  };

  const onPointerLeave = () => {
    setHovering(false);
  };

  useEffect(() => {
    failedUploadingSectionRef.current?.addEventListener(
      "pointerenter",
      onPointerEnter,
    );
    failedUploadingSectionRef.current?.addEventListener(
      "pointerleave",
      onPointerLeave,
    );
    failedUploadingSectionRef.current?.addEventListener(
      "pointermove",
      onPointerMove,
    );

    return () => {
      failedUploadingSectionRef.current?.removeEventListener(
        "pointerenter",
        onPointerEnter,
      );
      failedUploadingSectionRef.current?.removeEventListener(
        "pointerleave",
        onPointerLeave,
      );
      failedUploadingSectionRef.current?.removeEventListener(
        "pointermove",
        onPointerMove,
      );
    };
  }, []);

  return (
    <div
      ref={failedUploadingSectionRef}
      className={`${
        hovering &&
        (clickState.current === "delete" || clickState.current === "retry")
          ? "border-y-3 border-fg-off-white"
          : "border-y-2 border-fg-tone-black-3"
      } relative flex h-[6rem] w-full cursor-pointer items-center justify-center space-x-2 bg-fg-tone-black-5 px-8 py-4 transition-all`}
      onClick={clickFunction}
    >
      <div className="flex h-16 items-center justify-center">
        {upload.file.type === "image/svg+xml"
          ? upload.uploadUrl && (
              <FgSVGElement
                className="aspect-square h-full"
                src={upload.uploadUrl}
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                ]}
              />
            )
          : upload.file.type.startsWith("image/") ||
              upload.file.type.startsWith("video/")
            ? upload.uploadUrl && (
                <FgImageElement
                  className="aspect-square h-full"
                  imageClassName="object-contain"
                  src={upload.uploadUrl}
                />
              )
            : upload.file.type.startsWith("text/") && (
                <FgSVGElement
                  className="aspect-square h-[70%] fill-fg-white"
                  src={textIcon}
                  attributes={[
                    { key: "width", value: "100%" },
                    { key: "height", value: "100%" },
                  ]}
                />
              )}
      </div>
      <HoverElement
        externalRef={filenameRef}
        className={`${
          hovering &&
          (clickState.current === "delete" || clickState.current === "retry")
            ? "text-2xl text-fg-red-light"
            : "text-xl text-fg-white"
        } h-max grow truncate font-K2D transition-all`}
        content={<>{upload.filename}</>}
        hoverContent={
          (filenameRef.current?.scrollWidth ?? 0) >
          (filenameRef.current?.clientWidth ?? 0) ? (
            <FgHoverContentStandard style="light" content={upload.filename} />
          ) : undefined
        }
        options={{
          hoverSpacing: 4,
          hoverType: "above",
          hoverTimeoutDuration: 500,
        }}
      />
      <AnimatePresence>
        {hovering && clickState.current === "delete" && (
          <motion.div
            className="flex absolute right-0 top-0 h-full w-12 items-center justify-center rounded-l bg-fg-red"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
          >
            <FgSVGElement
              src={closeIcon}
              className="aspect-square h-[35%] fill-fg-white stroke-fg-white"
              attributes={[
                { key: "width", value: "100%" },
                { key: "height", value: "100%" },
              ]}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
