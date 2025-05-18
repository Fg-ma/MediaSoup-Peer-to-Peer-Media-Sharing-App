import React from "react";
import SelectedSection from "./lib/selectedSection/SelectedSection";
import UploadDownloadSection from "./lib/uploadDownloadSection/UploadDownloadSection";

export default function GeneralPanel({
  tablePanelRef,
}: {
  tablePanelRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="flex h-max w-full flex-col items-center justify-start space-y-2">
      <SelectedSection tablePanelRef={tablePanelRef} />
      <UploadDownloadSection />
    </div>
  );
}
