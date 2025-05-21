import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUserInfoContext } from "../../../../context/userInfoContext/UserInfoContext";
import { useSocketContext } from "../../../../context/socketContext/SocketContext";
import FgHoverContentStandard from "../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import HoverElement from "../../../../elements/hoverElement/HoverElement";
import { useToolsContext } from "../../../../context/toolsContext/ToolsContext";
import FgSVGElement from "../../../../elements/fgSVGElement/FgSVGElement";
import FgImageElement from "../../../../elements/fgImageElement/FgImageElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";

export default function FailedUploadingSection({
  savedTableId,
  uploadId,
  contentId,
  offset,
  failed,
}: {
  savedTableId: string;
  uploadId: string;
  contentId: string;
  offset: number;
  failed: FileSystemFileHandle;
}) {
  const { uploader, indexedDBController, reasonableFileSizer } =
    useToolsContext();
  const { tableId } = useUserInfoContext();
  const { tableStaticContentSocket } = useSocketContext();

  const [_, setRerender] = useState(false);
  const [hovering, setHovering] = useState(false);
  const clickState = useRef<"delete" | "start">("delete");
  const failedUploadingSectionRef = useRef<HTMLDivElement>(null);
  const filenameRef = useRef<HTMLDivElement>(null);
  const file = useRef<File | undefined>(undefined);
  const fileUrl = useRef<string | undefined>(undefined);

  const clickFunction = async () => {
    if (savedTableId !== tableId.current) return;

    if (clickState.current === "start") {
      const perm = await (failed as any).queryPermission({ mode: "read" });
      if (perm !== "granted") {
        const request = await (failed as any).requestPermission({
          mode: "read",
        });
        if (request !== "granted") {
          await indexedDBController.current.uploadDeletes?.deleteFileHandle(
            contentId,
          );
          tableStaticContentSocket.current?.deleteUploadSession(uploadId);
          return;
        }
      }

      const file = (await failed.getFile()) as File;

      await indexedDBController.current.uploadDeletes?.deleteFileHandle(
        contentId,
      );

      await uploader.current?.uploadToTable(
        file,
        undefined,
        undefined,
        failed,
        uploadId,
        contentId,
        offset,
      );
    } else {
      await indexedDBController.current.uploadDeletes?.deleteFileHandle(
        contentId,
      );
      tableStaticContentSocket.current?.deleteUploadSession(uploadId);
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
      if (clickState.current !== "start") {
        clickState.current = "start";
        setRerender((prev) => !prev);
      }
    }
  };

  const onPointerLeave = () => {
    setHovering(false);
  };

  useEffect(() => {
    const loadFile = async () => {
      const perm = await (failed as any).queryPermission({ mode: "read" });
      if (perm !== "granted") {
        const request = await (failed as any).requestPermission({
          mode: "read",
        });
        if (request !== "granted") {
          await indexedDBController.current.uploadDeletes?.deleteFileHandle(
            contentId,
          );
          tableStaticContentSocket.current?.deleteUploadSession(uploadId);
          return;
        }
      }

      file.current = (await failed.getFile()) as File;

      reasonableFileSizer.current.getUrl(file.current).then((url) => {
        fileUrl.current = url;
        setRerender((prev) => !prev);
      });
    };

    loadFile();

    return () => {
      if (fileUrl.current) URL.revokeObjectURL(fileUrl.current);
    };
  }, []);

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
  }, [file.current]);

  useEffect(() => {
    setRerender((prev) => !prev);
  }, [filenameRef.current]);

  return (
    file.current && (
      <div
        ref={failedUploadingSectionRef}
        className={`${
          hovering &&
          (clickState.current === "delete" || clickState.current === "start")
            ? "border-y-3 border-fg-off-white"
            : "border-y-2 border-fg-tone-black-3"
        } relative flex h-[6rem] w-full cursor-pointer items-center justify-center space-x-2 bg-fg-tone-black-5 px-8 py-4 transition-all`}
        onClick={clickFunction}
      >
        {fileUrl.current && (
          <div className="h-16">
            {file.current.type === "image/svg+xml" ? (
              <FgSVGElement
                className="aspect-square h-full"
                src={fileUrl.current}
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                ]}
              />
            ) : (
              (file.current.type.startsWith("image/") ||
                file.current.type.startsWith("video/")) && (
                <FgImageElement
                  className="aspect-square h-full"
                  imageClassName="object-contain"
                  src={fileUrl.current}
                />
              )
            )}
          </div>
        )}
        <HoverElement
          externalRef={filenameRef}
          className={`${
            hovering &&
            (clickState.current === "delete" || clickState.current === "start")
              ? "text-2xl text-fg-red-light"
              : "text-xl text-fg-white"
          } h-max grow truncate font-K2D transition-all`}
          content={<>{file.current.name}</>}
          hoverContent={
            (filenameRef.current?.scrollWidth ?? 0) >
            (filenameRef.current?.clientWidth ?? 0) ? (
              <FgHoverContentStandard style="light" content={failed.name} />
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
    )
  );
}
