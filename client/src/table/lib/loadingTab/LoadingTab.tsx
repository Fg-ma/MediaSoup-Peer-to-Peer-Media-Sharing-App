import React, { useState } from "react";
import LoadingElement from "./lib/LoadingElement";

export default function LoadingTab() {
  const [loadingTabActive, setLoadingTabActive] = useState(true);

  return (
    <>
      {loadingTabActive && (
        <div className="absolute bottom-0 left-0 z-popup-labels flex h-10 w-32 items-center justify-start rounded-bl-md rounded-tr-md border-2 border-fg-off-white bg-fg-tone-black-8">
          <LoadingElement />
        </div>
      )}
    </>
  );
}
