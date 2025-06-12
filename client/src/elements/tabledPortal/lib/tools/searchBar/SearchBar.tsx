import React, { useEffect, useRef, useState } from "react";
import FgSVGElement from "../../../../fgSVGElement/FgSVGElement";
import FgInput from "../../../../fgInput/FgInput";
import { useSocketContext } from "../../../../../context/socketContext/SocketContext";
import { IncomingTableStaticContentMessages } from "../../../../../serverControllers/tableStaticContentServer/lib/typeConstant";
import { Categories } from "../../../TabledPortal";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const searchIcon = nginxAssetServerBaseUrl + "svgs/searchIcon.svg";

export default function SearchBar({
  activePage,
  setSearchContent,
  advanced,
  searchValue,
}: {
  activePage: Categories;
  setSearchContent: React.Dispatch<
    React.SetStateAction<
      {
        score: number;
        aid?: string;
        iid?: string;
        sid?: string;
        xid?: string;
        vid?: string;
      }[]
    >
  >;
  advanced: boolean;
  searchValue: React.MutableRefObject<string>;
}) {
  const { tableStaticContentSocket } = useSocketContext();

  const [_, setRerender] = useState(false);
  const typingTimeout = useRef<undefined | NodeJS.Timeout>(undefined);
  const typingInterval = useRef<undefined | NodeJS.Timeout>(undefined);

  const handleTableStaticContentMessages = (
    message: IncomingTableStaticContentMessages,
  ) => {
    switch (message.type) {
      case "searchTabledContentResponded":
        if (message.data.length === 0) {
          setSearchContent([]);
        } else {
          setSearchContent(
            message.data.map((ata: any) => ({
              score: ata.score,
              ...ata.source,
            })),
          );
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    tableStaticContentSocket.current?.addMessageListener(
      handleTableStaticContentMessages,
    );

    return () => {
      tableStaticContentSocket.current?.removeMessageListener(
        handleTableStaticContentMessages,
      );
    };
  }, []);

  return (
    <div className={`${advanced ? "mb-6 w-full pr-4" : "grow"} !h-12 pl-4`}>
      <div
        className={`${advanced ? "border-fg-tone-black-4" : "border-fg-tone-black-8"} flex h-full w-full items-center justify-center rounded-full border-2 bg-fg-white px-3`}
      >
        <FgSVGElement
          src={searchIcon}
          className="aspect-square h-[55%] fill-fg-tone-black-1 stroke-fg-tone-black-1"
          attributes={[
            { key: "width", value: "100%" },
            { key: "height", value: "100%" },
          ]}
        />
        <FgInput
          externalValue={searchValue.current}
          className="h-[80%] w-full font-K2D text-xl"
          onChange={(event) => {
            searchValue.current = event.target.value;
            if (event.target.value.length === 0) {
              if (typingTimeout.current) {
                clearTimeout(typingTimeout.current);
                typingTimeout.current = undefined;
              }
              if (typingInterval.current) {
                clearInterval(typingInterval.current);
                typingInterval.current = undefined;
              }
              setSearchContent([]);
              return;
            }

            setRerender((prev) => !prev);

            if (typingTimeout.current) {
              clearTimeout(typingTimeout.current);
              typingTimeout.current = undefined;
            }

            if (!typingInterval.current) {
              typingInterval.current = setInterval(() => {
                tableStaticContentSocket.current?.searchTabledContent(
                  activePage,
                  searchValue.current,
                );
              }, 350);
            }

            typingTimeout.current = setTimeout(() => {
              if (typingInterval.current) {
                clearInterval(typingInterval.current);
                typingInterval.current = undefined;
              }
            }, 400);
          }}
          options={{ submitButton: false }}
        />
      </div>
    </div>
  );
}
