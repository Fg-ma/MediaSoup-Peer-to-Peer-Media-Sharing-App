import React, { useRef, useState } from "react";
import fuzzysort from "fuzzysort";
import FgSVGElement from "../../../../fgSVGElement/FgSVGElement";
import FgInput from "../../../../fgInput/FgInput";
import {
  LittleBuddiesTypes,
  littleBuddySemanticKeywords,
} from "../../../../../tableBabylon/littleBuddies/lib/typeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const searchIcon = nginxAssetServerBaseUrl + "svgs/searchIcon.svg";

export default function SearchBar({
  setSearchContent,
  advanced,
  searchValue,
}: {
  setSearchContent: React.Dispatch<
    React.SetStateAction<
      {
        littleBuddy: LittleBuddiesTypes;
        score: number;
      }[]
    >
  >;
  advanced: boolean;
  searchValue: React.MutableRefObject<string>;
}) {
  const [_, setRerender] = useState(false);
  const typingTimeout = useRef<undefined | NodeJS.Timeout>(undefined);
  const typingInterval = useRef<undefined | NodeJS.Timeout>(undefined);

  const searchBuddiesFuzzysort = (
    query: string,
  ): { littleBuddy: LittleBuddiesTypes; score: number }[] => {
    if (!query.trim()) return [];

    const results: { littleBuddy: LittleBuddiesTypes; score: number }[] = [];

    for (const buddy in littleBuddySemanticKeywords) {
      const keywords = [
        buddy,
        ...littleBuddySemanticKeywords[buddy as LittleBuddiesTypes],
      ];
      const bestMatch = fuzzysort.go(query, keywords);
      if (bestMatch.total > -Infinity) {
        results.push({
          littleBuddy: buddy as LittleBuddiesTypes,
          score: bestMatch.total,
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  };

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
                setSearchContent(searchBuddiesFuzzysort(searchValue.current));
              }, 150);
            }

            typingTimeout.current = setTimeout(() => {
              if (typingInterval.current) {
                clearInterval(typingInterval.current);
                typingInterval.current = undefined;
              }
            }, 200);
          }}
          options={{ submitButton: false }}
        />
      </div>
    </div>
  );
}
