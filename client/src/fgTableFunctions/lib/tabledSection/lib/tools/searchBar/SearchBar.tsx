import React from "react";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import FgInput from "../../../../../../elements/fgInput/FgInput";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const searchIcon = nginxAssetServerBaseUrl + "svgs/searchIcon.svg";

export default function SearchBar() {
  return (
    <div className="h-full grow pl-4">
      <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-fg-tone-black-8 bg-fg-white px-3">
        <FgSVGElement
          src={searchIcon}
          className="aspect-square h-[80%] fill-fg-tone-black-1 stroke-fg-tone-black-1"
          attributes={[
            { key: "width", value: "100%" },
            { key: "height", value: "100%" },
          ]}
        />
        <FgInput
          className="h-[80%] w-full font-K2D text-xl"
          onChange={(event) => {
            console.log(event);
          }}
          onSubmit={(event) => {
            console.log(event);
          }}
          options={{ submitButton: false }}
        />
      </div>
    </div>
  );
}
