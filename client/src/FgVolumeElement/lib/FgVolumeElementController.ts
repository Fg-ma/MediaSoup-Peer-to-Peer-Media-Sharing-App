import FgVolumeElementSocket from "./FgVolumeElementSocket";
import volumeSVGPaths, { newVolumeSVGPaths } from "../lib/volumeSVGPaths";

class FgVolumeElementController {
  private isUser: boolean;
  private username: string;
  private clientMute: React.MutableRefObject<boolean>;
  private videoIconStateRef: React.MutableRefObject<{
    from: string;
    to: string;
  }>;
  private setPaths: React.Dispatch<
    React.SetStateAction<[string, string, string] | undefined>
  >;
  private audioRef: React.RefObject<HTMLAudioElement>;
  private localMute: React.MutableRefObject<boolean>;
  private setActive: React.Dispatch<React.SetStateAction<boolean>>;

  private fgVolumeElementSocket: FgVolumeElementSocket;

  constructor(
    isUser: boolean,
    username: string,
    clientMute: React.MutableRefObject<boolean>,
    videoIconStateRef: React.MutableRefObject<{
      from: string;
      to: string;
    }>,
    setPaths: React.Dispatch<
      React.SetStateAction<[string, string, string] | undefined>
    >,
    audioRef: React.RefObject<HTMLAudioElement>,
    localMute: React.MutableRefObject<boolean>,
    setActive: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    this.isUser = isUser;
    this.username = username;
    this.clientMute = clientMute;
    this.videoIconStateRef = videoIconStateRef;
    this.setPaths = setPaths;
    this.audioRef = audioRef;
    this.localMute = localMute;
    this.setActive = setActive;

    this.fgVolumeElementSocket = new FgVolumeElementSocket(
      this.isUser,
      this.username,
      this.clientMute,
      this.videoIconStateRef,
      this.audioRef,
      this.localMute,
      this.setPaths,
      this.getNewPaths,
      this.setActive
    );
  }

  handleMessage(event: any) {
    switch (event.type) {
      case "clientMuteStateResponsed":
        this.fgVolumeElementSocket.onClientMuteStateResponsed(event);
        break;
      case "clientMuteChange":
        this.fgVolumeElementSocket.onClientMuteChange(event);
        break;
      case "localMuteChange":
        this.fgVolumeElementSocket.onLocalMuteChange();
        break;
      default:
        break;
    }
  }

  getPaths(from: string, to: string) {
    let newPaths: string[][] = [];
    if (from === "high" && to === "off") {
      newPaths = [
        [
          volumeSVGPaths.volumeHigh1a,
          volumeSVGPaths.volumeHighOffIB1a,
          volumeSVGPaths.volumeOff1a,
        ],
        [
          volumeSVGPaths.volumeHigh1b,
          volumeSVGPaths.volumeHighOffIB1b,
          volumeSVGPaths.volumeOff1b,
        ],
        [
          volumeSVGPaths.volumeHigh2a,
          volumeSVGPaths.volumeHighOffIB2a,
          volumeSVGPaths.volumeOff2a,
        ],
        [
          volumeSVGPaths.volumeHigh2b,
          volumeSVGPaths.volumeHighOffIB2b,
          volumeSVGPaths.volumeOff2b,
        ],
        [
          volumeSVGPaths.volumeHigh3a,
          volumeSVGPaths.volumeHighOffIB3a,
          volumeSVGPaths.volumeOff3a,
        ],
        [
          volumeSVGPaths.volumeHigh3b,
          volumeSVGPaths.volumeHighOffIB3b,
          volumeSVGPaths.volumeOff3b,
        ],
      ];
    } else if (from === "off" && to === "high") {
      newPaths = [
        [
          volumeSVGPaths.volumeOff1a,
          volumeSVGPaths.volumeHighOffIB1a,
          volumeSVGPaths.volumeHigh1a,
        ],
        [
          volumeSVGPaths.volumeOff1b,
          volumeSVGPaths.volumeHighOffIB1b,
          volumeSVGPaths.volumeHigh1b,
        ],
        [
          volumeSVGPaths.volumeOff2a,
          volumeSVGPaths.volumeHighOffIB2a,
          volumeSVGPaths.volumeHigh2a,
        ],
        [
          volumeSVGPaths.volumeOff2b,
          volumeSVGPaths.volumeHighOffIB2b,
          volumeSVGPaths.volumeHigh2b,
        ],
        [
          volumeSVGPaths.volumeOff3a,
          volumeSVGPaths.volumeHighOffIB3a,
          volumeSVGPaths.volumeHigh3a,
        ],
        [
          volumeSVGPaths.volumeOff3b,
          volumeSVGPaths.volumeHighOffIB3b,
          volumeSVGPaths.volumeHigh3b,
        ],
      ];
    } else if (from === "low" && to === "off") {
      newPaths = [
        [
          volumeSVGPaths.volumeLow1a,
          volumeSVGPaths.volumeLowOffA1a,
          volumeSVGPaths.volumeLowOffB1a,
          volumeSVGPaths.volumeOff1a,
        ],
        [
          volumeSVGPaths.volumeLow1b,
          volumeSVGPaths.volumeLowOffA1b,
          volumeSVGPaths.volumeLowOffB1b,
          volumeSVGPaths.volumeOff1b,
        ],
        [
          volumeSVGPaths.volumeLow2a,
          volumeSVGPaths.volumeLowOffA2a,
          volumeSVGPaths.volumeLowOffB2a,
          volumeSVGPaths.volumeOff2a,
        ],
        [
          volumeSVGPaths.volumeLow2b,
          volumeSVGPaths.volumeLowOffA2b,
          volumeSVGPaths.volumeLowOffB2b,
          volumeSVGPaths.volumeOff2b,
        ],
        [
          volumeSVGPaths.volumeLow3a,
          volumeSVGPaths.volumeLowOffA3a,
          volumeSVGPaths.volumeLowOffB3a,
          volumeSVGPaths.volumeOff3a,
        ],
        [
          volumeSVGPaths.volumeLow3b,
          volumeSVGPaths.volumeLowOffA3b,
          volumeSVGPaths.volumeLowOffB3b,
          volumeSVGPaths.volumeOff3b,
        ],
      ];
    } else if (from === "off" && to === "low") {
      newPaths = [
        [
          volumeSVGPaths.volumeOff1a,
          volumeSVGPaths.volumeLowOffB1a,
          volumeSVGPaths.volumeLowOffA1a,
          volumeSVGPaths.volumeLow1a,
        ],
        [
          volumeSVGPaths.volumeOff1b,
          volumeSVGPaths.volumeLowOffB1b,
          volumeSVGPaths.volumeLowOffA1b,
          volumeSVGPaths.volumeLow1b,
        ],
        [
          volumeSVGPaths.volumeOff2a,
          volumeSVGPaths.volumeLowOffB2a,
          volumeSVGPaths.volumeLowOffA2a,
          volumeSVGPaths.volumeLow2a,
        ],
        [
          volumeSVGPaths.volumeOff2b,
          volumeSVGPaths.volumeLowOffB2b,
          volumeSVGPaths.volumeLowOffA2b,
          volumeSVGPaths.volumeLow2b,
        ],
        [
          volumeSVGPaths.volumeOff3a,
          volumeSVGPaths.volumeLowOffB3a,
          volumeSVGPaths.volumeLowOffA3a,
          volumeSVGPaths.volumeLow3a,
        ],
        [
          volumeSVGPaths.volumeOff3b,
          volumeSVGPaths.volumeLowOffB3b,
          volumeSVGPaths.volumeLowOffA3b,
          volumeSVGPaths.volumeLow3b,
        ],
      ];
    } else if (from === "high" && to === "low") {
      newPaths = [
        [
          volumeSVGPaths.volumeHigh1a,
          volumeSVGPaths.volumeHighLowIB1a,
          volumeSVGPaths.volumeLow1a,
        ],
        [
          volumeSVGPaths.volumeHigh1b,
          volumeSVGPaths.volumeHighLowIB1b,
          volumeSVGPaths.volumeLow1b,
        ],
        [
          volumeSVGPaths.volumeHigh2a,
          volumeSVGPaths.volumeHighLowIB2a,
          volumeSVGPaths.volumeLow2a,
        ],
        [
          volumeSVGPaths.volumeHigh2b,
          volumeSVGPaths.volumeHighLowIB2b,
          volumeSVGPaths.volumeLow2b,
        ],
        [
          volumeSVGPaths.volumeHigh3a,
          volumeSVGPaths.volumeHighLowIB3a,
          volumeSVGPaths.volumeLow3a,
        ],
        [
          volumeSVGPaths.volumeHigh3b,
          volumeSVGPaths.volumeHighLowIB3b,
          volumeSVGPaths.volumeLow3b,
        ],
      ];
    } else if (from === "low" && to === "high") {
      newPaths = [
        [
          volumeSVGPaths.volumeLow1a,
          volumeSVGPaths.volumeHighLowIB1a,
          volumeSVGPaths.volumeHigh1a,
        ],
        [
          volumeSVGPaths.volumeLow1b,
          volumeSVGPaths.volumeHighLowIB1b,
          volumeSVGPaths.volumeHigh1b,
        ],
        [
          volumeSVGPaths.volumeLow2a,
          volumeSVGPaths.volumeHighLowIB2a,
          volumeSVGPaths.volumeHigh2a,
        ],
        [
          volumeSVGPaths.volumeLow2b,
          volumeSVGPaths.volumeHighLowIB2b,
          volumeSVGPaths.volumeHigh2b,
        ],
        [
          volumeSVGPaths.volumeLow3a,
          volumeSVGPaths.volumeHighLowIB3a,
          volumeSVGPaths.volumeHigh3a,
        ],
        [
          volumeSVGPaths.volumeLow3b,
          volumeSVGPaths.volumeHighLowIB3b,
          volumeSVGPaths.volumeHigh3b,
        ],
      ];
    }
    return newPaths;
  }

  getNewPaths(from: string, to: string) {
    let newPaths: [string, string, string] | undefined;
    if (from === "high" && to === "off") {
      newPaths = [
        newVolumeSVGPaths.high.right,
        newVolumeSVGPaths.high.right,
        newVolumeSVGPaths.high.right,
      ];
    } else if (from === "off" && to === "high") {
      newPaths = [
        newVolumeSVGPaths.high.right,
        newVolumeSVGPaths.high.right,
        newVolumeSVGPaths.high.right,
      ];
    } else if (from === "low" && to === "off") {
      newPaths = [
        newVolumeSVGPaths.low.right,
        newVolumeSVGPaths.highLow.right,
        newVolumeSVGPaths.high.right,
      ];
    } else if (from === "off" && to === "low") {
      newPaths = [
        newVolumeSVGPaths.high.right,
        newVolumeSVGPaths.highLow.right,
        newVolumeSVGPaths.low.right,
      ];
    } else if (from === "high" && to === "low") {
      newPaths = [
        newVolumeSVGPaths.high.right,
        newVolumeSVGPaths.highLow.right,
        newVolumeSVGPaths.low.right,
      ];
    } else if (from === "low" && to === "high") {
      newPaths = [
        newVolumeSVGPaths.low.right,
        newVolumeSVGPaths.highLow.right,
        newVolumeSVGPaths.high.right,
      ];
    }
    return newPaths;
  }

  getStrikePaths(from: string, to: string) {
    let newPaths: [string, string] | undefined;
    if (from === "high" && to === "off") {
      newPaths = [
        newVolumeSVGPaths.strike.ball,
        newVolumeSVGPaths.strike.strike,
      ];
    } else if (from === "off" && to === "high") {
      newPaths = [
        newVolumeSVGPaths.strike.strike,
        newVolumeSVGPaths.strike.ball,
      ];
    } else if (from === "low" && to === "off") {
      newPaths = [
        newVolumeSVGPaths.strike.ball,
        newVolumeSVGPaths.strike.strike,
      ];
    } else if (from === "off" && to === "low") {
      newPaths = [
        newVolumeSVGPaths.strike.strike,
        newVolumeSVGPaths.strike.ball,
      ];
    }
    return newPaths;
  }
}

export default FgVolumeElementController;
