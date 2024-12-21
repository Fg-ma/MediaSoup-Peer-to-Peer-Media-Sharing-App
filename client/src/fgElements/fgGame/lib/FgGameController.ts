import { Socket } from "socket.io-client";
import { RemoteDataStreamsType } from "../../../context/mediaContext/typeConstant";

type Messages =
  | onNewConsumerWasCreatedType
  | onRequestedGameCatchUpDataType
  | onResponsedGameCatchUpDataType;

type onNewConsumerWasCreatedType = { type: "newConsumerWasCreated" };

type onRequestedGameCatchUpDataType = {
  type: "requestedGameCatchUpData";
  inquiringUsername: string;
  inquiringInstance: string;
  gameId: string;
};

type onResponsedGameCatchUpDataType = {
  type: "responsedGameCatchUpData";
  gameId: string;
  positioning: {
    position: {
      left: number;
      top: number;
    };
    scale: {
      x: number;
      y: number;
    };
    rotation: number;
  };
};

class FgGameController {
  constructor(
    private socket: React.MutableRefObject<Socket>,
    private table_id: string,
    private gameId: string,
    private gameStarted: boolean,
    private setFocus: React.Dispatch<React.SetStateAction<boolean>>,
    private setFocusClicked: React.Dispatch<React.SetStateAction<boolean>>,
    private focusClicked: boolean,
    private setHideControls: React.Dispatch<React.SetStateAction<boolean>>,
    private mouseLeaveHideControlsTimeout: React.MutableRefObject<
      NodeJS.Timeout | undefined
    >,
    private mouseStillHideControlsTimeout: React.MutableRefObject<
      NodeJS.Timeout | undefined
    >,
    private gameRef: React.RefObject<HTMLDivElement>,
    private closeGameFunction: (() => void) | undefined,
    private startGameFunction: (() => void) | undefined,
    private remoteDataStreams: React.MutableRefObject<RemoteDataStreamsType>,
    private positioningListeners: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: () => void;
      };
    }>,
    private positioning: React.MutableRefObject<{
      position: {
        left: number;
        top: number;
      };
      scale: {
        x: number;
        y: number;
      };
      rotation: number;
    }>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  handleKeyDown = (event: KeyboardEvent) => {
    if (!focus || event.target instanceof HTMLInputElement) return;

    switch (event.key.toLowerCase()) {
      case "p":
        if (this.startGameFunction) {
          this.startGameFunction();
        }
        break;
      case "x":
        if (this.closeGameFunction) {
          this.closeGameFunction();
        }
        break;
      case "delete":
        if (this.closeGameFunction) {
          this.closeGameFunction();
        }
        break;
      case "escape":
        if (this.closeGameFunction) {
          this.closeGameFunction();
        }
        break;
      default:
        break;
    }
  };

  handleGameClick = (event: React.MouseEvent) => {
    if (this.gameRef.current) {
      const value = this.gameRef.current.contains(event.target as Node);
      this.setFocus(value);
      this.setFocusClicked(value);
    }
  };

  attachPositioningListeners = () => {
    for (const remoteUsername in this.remoteDataStreams.current) {
      const remoteUserStreams = this.remoteDataStreams.current[remoteUsername];
      for (const remoteInstance in remoteUserStreams) {
        const stream = remoteUserStreams[remoteInstance].positionScaleRotation;
        if (
          stream &&
          (!this.positioningListeners.current[remoteUsername] ||
            !this.positioningListeners.current[remoteUsername][remoteInstance])
        ) {
          const handleMessage = (message: string) => {
            const data = JSON.parse(message);
            if (
              data.table_id === this.table_id &&
              data.gameId === this.gameId &&
              data.type === "games"
            ) {
              this.positioning.current = data.positioning;
              this.setRerender((prev) => !prev);
            }
          };

          stream.on("message", handleMessage);

          // Store cleanup function
          if (!this.positioningListeners.current[remoteUsername]) {
            this.positioningListeners.current[remoteUsername] = {};
          }
          this.positioningListeners.current[remoteUsername][remoteInstance] =
            () => stream.off("message", handleMessage);
        }
      }
    }
  };

  onRequestedGameCatchUpData = (event: onRequestedGameCatchUpDataType) => {
    const { inquiringUsername, inquiringInstance, gameId } = event;

    if (gameId === this.gameId) {
      const msg = {
        type: "responseGameCatchUpData",
        table_id: this.table_id,
        inquiringUsername,
        inquiringInstance,
        gameId,
        positioning: this.positioning.current,
      };
      this.socket.current.send(msg);
    }
  };

  onResponsedGameCatchUpData = (event: onResponsedGameCatchUpDataType) => {
    const { gameId, positioning } = event;

    if (gameId === this.gameId) {
      this.positioning.current = positioning;
      this.setRerender((prev) => !prev);
    }
  };

  handleMessage = (event: Messages) => {
    switch (event.type) {
      case "newConsumerWasCreated":
        this.attachPositioningListeners();
        break;
      case "requestedGameCatchUpData":
        this.onRequestedGameCatchUpData(event);
        break;
      case "responsedGameCatchUpData":
        this.onResponsedGameCatchUpData(event);
        break;
      default:
        break;
    }
  };

  handleMouseLeave = () => {
    if (!this.focusClicked) {
      this.setFocus(false);
    }

    if (!this.mouseLeaveHideControlsTimeout.current) {
      this.mouseLeaveHideControlsTimeout.current = setTimeout(() => {
        clearTimeout(this.mouseLeaveHideControlsTimeout.current);
        this.mouseLeaveHideControlsTimeout.current = undefined;

        this.setHideControls(true);
      }, 1250);
    }

    if (this.mouseStillHideControlsTimeout.current) {
      clearTimeout(this.mouseStillHideControlsTimeout.current);
      this.mouseStillHideControlsTimeout.current = undefined;
    }
  };

  handleMouseEnter = () => {
    this.setFocus(true);
    this.setHideControls(false);

    if (this.mouseLeaveHideControlsTimeout.current) {
      clearTimeout(this.mouseLeaveHideControlsTimeout.current);
      this.mouseLeaveHideControlsTimeout.current = undefined;
    }

    if (this.gameStarted) {
      this.mouseStillHideControlsTimeout.current = setTimeout(() => {
        clearTimeout(this.mouseStillHideControlsTimeout.current);
        this.mouseStillHideControlsTimeout.current = undefined;

        this.setHideControls(true);
      }, 1250);
    }
  };

  handleMouseMove = (event: React.MouseEvent) => {
    this.setHideControls(false);

    if (this.mouseStillHideControlsTimeout.current) {
      clearTimeout(this.mouseStillHideControlsTimeout.current);
      this.mouseStillHideControlsTimeout.current = undefined;
    }

    const target = event.target;

    if (
      this.gameStarted &&
      target &&
      this.gameRef.current?.contains(target as Node)
    ) {
      this.mouseStillHideControlsTimeout.current = setTimeout(() => {
        clearTimeout(this.mouseStillHideControlsTimeout.current);
        this.mouseStillHideControlsTimeout.current = undefined;

        this.setHideControls(true);
      }, 1250);
    }
  };
}

export default FgGameController;
