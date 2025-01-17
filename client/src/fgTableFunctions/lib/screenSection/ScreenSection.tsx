import React from "react";
import { useMediaContext } from "../../../context/mediaContext/MediaContext";
import { useSocketContext } from "../../../context/socketContext/SocketContext";
import { useUserInfoContext } from "../../../context/userInfoContext/UserInfoContext";
import FgButton from "../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../fgElements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import ProducersController from "../../../lib/ProducersController";
import ScreenSectionController from "./lib/ScreenSectionController";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const removeScreenIcon = nginxAssetSeverBaseUrl + "svgs/removeScreenIcon.svg";
const shareScreenIcon = nginxAssetSeverBaseUrl + "svgs/shareScreenIcon.svg";

export default function ScreenSection({
  screenBtnRef,
  newScreenBtnRef,
  isScreen,
  screenActive,
  setScreenActive,
  producersController,
  handleDisableEnableBtns,
}: {
  screenBtnRef: React.RefObject<HTMLButtonElement>;
  newScreenBtnRef: React.RefObject<HTMLButtonElement>;
  isScreen: React.MutableRefObject<boolean>;
  screenActive: boolean;
  setScreenActive: React.Dispatch<React.SetStateAction<boolean>>;
  producersController: ProducersController;
  handleDisableEnableBtns: (disabled: boolean) => void;
}) {
  const { userMedia } = useMediaContext();
  const { mediasoupSocket } = useSocketContext();
  const { table_id, username, instance, device } = useUserInfoContext();

  const screenSectionController = new ScreenSectionController(
    mediasoupSocket,
    device,
    table_id,
    username,
    instance,

    isScreen,
    setScreenActive,

    userMedia,

    producersController,

    handleDisableEnableBtns
  );

  return (
    <div className='flex space-x-4 h-full'>
      <FgButton
        externalRef={screenBtnRef}
        clickFunction={() => screenSectionController.shareScreen()}
        className='disabled:opacity-25 h-full aspect-square rounded-full flex items-center justify-center relative hover:border-2 hover:border-fg-off-white'
        contentFunction={() => {
          if (screenActive) {
            return (
              <FgSVG
                src={removeScreenIcon}
                className='h-[80%] aspect-square'
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                  { key: "fill", value: "white" },
                ]}
              />
            );
          } else {
            return (
              <FgSVG
                src={shareScreenIcon}
                className='h-[80%] aspect-square'
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                  { key: "fill", value: "white" },
                ]}
              />
            );
          }
        }}
        hoverContent={
          <FgHoverContentStandard
            content={screenActive ? "Remove screen" : "Share screen"}
          />
        }
        options={{ hoverTimeoutDuration: 100 }}
        aria-label={"Share screen"}
      />
      <FgButton
        externalRef={newScreenBtnRef}
        clickFunction={() => screenSectionController.shareNewScreen()}
        className={`${
          screenActive ? "visible" : "hidden"
        } disabled:opacity-25 h-full aspect-square rounded-full flex items-center justify-center relative hover:border-2 hover:border-fg-off-white`}
        contentFunction={() => (
          <FgSVG
            src={shareScreenIcon}
            className='h-[80%] aspect-square'
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
              { key: "fill", value: "white" },
            ]}
          />
        )}
        hoverContent={<FgHoverContentStandard content='Share a new screen' />}
        options={{ hoverTimeoutDuration: 100 }}
        aria-label={"Share a new screen"}
      />
    </div>
  );
}
