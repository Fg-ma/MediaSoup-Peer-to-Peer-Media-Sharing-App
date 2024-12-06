type FgAudioContainerMessageEvents = {
  type: "responsedCatchUpData";
  inquiredUsername: string;
  inquiredInstance: string;
  inquiredType: "camera" | "screen" | "audio";
  inquiredVideoId: string;
  data:
    | {
        paused: boolean;
        timeEllapsed: number;
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
      }
    | {
        paused: boolean;
        timeEllapsed: number;
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
      }
    | {
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
      }
    | undefined;
};

class FgAudioElementContainerController {
  constructor(
    private isUser: boolean,
    private username: string,
    private instance: string,
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
    }>
  ) {}

  onResponsedCatchUpData = (event: {
    type: "responsedCatchUpData";
    inquiredUsername: string;
    inquiredInstance: string;
    inquiredType: "camera" | "screen" | "audio";
    inquiredVideoId: string;
    data:
      | {
          paused: boolean;
          timeEllapsed: number;
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
        }
      | {
          paused: boolean;
          timeEllapsed: number;
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
        }
      | {
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
        }
      | undefined;
  }) => {
    if (
      !this.isUser &&
      this.username === event.inquiredUsername &&
      this.instance === event.inquiredInstance &&
      event.inquiredType === "audio" &&
      event.data &&
      Object.keys(event.data.positioning).length !== 0
    ) {
      this.positioning.current = event.data.positioning;
    }
  };

  handleMessage = (event: FgAudioContainerMessageEvents) => {
    switch (event.type) {
      case "responsedCatchUpData":
        this.onResponsedCatchUpData(event);
        break;
      default:
        break;
    }
  };
}

export default FgAudioElementContainerController;
