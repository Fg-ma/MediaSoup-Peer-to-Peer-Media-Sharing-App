import {
  RemoteEffectStylesType,
  RemoteStreamEffectsType,
} from "../context/effectsContext/typeConstant";
import {
  RemoteDataStreamsType,
  RemoteMediaType,
} from "../context/mediaContext/typeConstant";

class CleanupController {
  constructor(
    private remoteMedia: React.MutableRefObject<RemoteMediaType>,
    private remoteDataStreams: React.MutableRefObject<RemoteDataStreamsType>,
    private remoteStreamEffects: React.MutableRefObject<RemoteStreamEffectsType>,
    private remoteEffectsStyles: React.MutableRefObject<RemoteEffectStylesType>,
    private setBundles: React.Dispatch<
      React.SetStateAction<{
        [username: string]: {
          [instance: string]: React.JSX.Element;
        };
      }>
    >
  ) {}

  handleUserLeftCleanup = (
    disconnectedUsername: string,
    disconnectedInstance: string
  ) => {
    this.setBundles((prev) => {
      const updatedBundles = { ...prev };
      if (updatedBundles[disconnectedUsername]) {
        delete updatedBundles[disconnectedUsername][disconnectedInstance];
      }
      return updatedBundles;
    });

    if (
      this.remoteMedia.current[disconnectedUsername] &&
      this.remoteMedia.current[disconnectedUsername][disconnectedInstance]
    ) {
      delete this.remoteMedia.current[disconnectedUsername][
        disconnectedInstance
      ];

      if (
        Object.keys(this.remoteMedia.current[disconnectedUsername]).length === 0
      ) {
        delete this.remoteMedia.current[disconnectedUsername];
      }
    }

    if (
      this.remoteDataStreams.current?.[disconnectedUsername]?.[
        disconnectedInstance
      ] !== undefined
    ) {
      this.remoteDataStreams.current?.[disconnectedUsername]?.[
        disconnectedInstance
      ].positionScaleRotation?.close();
      delete this.remoteDataStreams.current?.[disconnectedUsername]?.[
        disconnectedInstance
      ].positionScaleRotation;
      delete this.remoteDataStreams.current?.[disconnectedUsername]?.[
        disconnectedInstance
      ];

      if (
        Object.keys(this.remoteDataStreams.current?.[disconnectedUsername])
          .length === 0
      ) {
        delete this.remoteDataStreams.current?.[disconnectedUsername];
      }
    }

    if (
      this.remoteStreamEffects.current?.[disconnectedUsername]?.[
        disconnectedInstance
      ] !== undefined
    ) {
      delete this.remoteStreamEffects.current?.[disconnectedUsername]?.[
        disconnectedInstance
      ];

      if (
        Object.keys(this.remoteStreamEffects.current?.[disconnectedUsername])
          .length === 0
      ) {
        delete this.remoteStreamEffects.current?.[disconnectedUsername];
      }
    }

    if (
      this.remoteEffectsStyles.current?.[disconnectedUsername]?.[
        disconnectedInstance
      ]
    ) {
      delete this.remoteEffectsStyles.current?.[disconnectedUsername]?.[
        disconnectedInstance
      ];

      if (
        Object.keys(this.remoteEffectsStyles.current?.[disconnectedUsername])
          .length === 0
      ) {
        delete this.remoteEffectsStyles.current?.[disconnectedUsername];
      }
    }
  };
}

export default CleanupController;
