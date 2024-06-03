const onMuteLockChange = (
  event: {
    type: string;
    isMuteLock: boolean;
    username: string;
  },
  isUser: boolean,
  username: string,
  isFinishedRef: React.MutableRefObject<boolean>,
  changedWhileNotFinishedRef: React.MutableRefObject<boolean>,
  muteLock: React.MutableRefObject<boolean>,
  videoIconStateRef: React.MutableRefObject<{
    from: string;
    to: string;
  }>,
  getPaths: (from: string, to: string) => string[][],
  setPaths: React.Dispatch<React.SetStateAction<string[][]>>,
  audioRef: React.RefObject<HTMLAudioElement>
) => {
  if (isUser || username !== event.username) {
    return;
  }

  if (event.isMuteLock) {
    if (!isFinishedRef.current) {
      if (!changedWhileNotFinishedRef.current) {
        changedWhileNotFinishedRef.current = true;
      }
      return;
    }

    muteLock.current = true;

    if (videoIconStateRef.current.to !== "off") {
      videoIconStateRef.current = {
        from: videoIconStateRef.current.to,
        to: "off",
      };
      const newPaths = getPaths(videoIconStateRef.current.from, "off");
      if (newPaths[0]) {
        setPaths(newPaths);
      }
    }
  } else {
    muteLock.current = false;

    if (!audioRef.current) {
      return;
    }

    const newVolume = audioRef.current.volume;
    let newVolumeState;
    if (newVolume === 0) {
      newVolumeState = "off";
    } else if (newVolume >= 0.5) {
      newVolumeState = "high";
    } else {
      newVolumeState = "low";
    }

    if (
      !isFinishedRef.current &&
      videoIconStateRef.current.to !== newVolumeState
    ) {
      if (!changedWhileNotFinishedRef.current) {
        changedWhileNotFinishedRef.current = true;
      }
      return;
    }

    if (
      newVolumeState !== videoIconStateRef.current.to &&
      !audioRef.current.muted
    ) {
      videoIconStateRef.current = {
        from: videoIconStateRef.current.to,
        to: newVolumeState,
      };

      const newPaths = getPaths(videoIconStateRef.current.from, newVolumeState);
      if (newPaths[0]) {
        setPaths(newPaths);
      }
    }
  }
};

export default onMuteLockChange;
