const onMuteRequest = (
  localMuted: React.MutableRefObject<boolean>,
  isFinishedRef: React.MutableRefObject<boolean>,
  changedWhileNotFinishedRef: React.MutableRefObject<boolean>,
  videoIconStateRef: React.MutableRefObject<{
    from: string;
    to: string;
  }>,
  getPaths: (from: string, to: string) => string[][],
  setPaths: React.Dispatch<React.SetStateAction<string[][]>>,
  audioRef: React.RefObject<HTMLAudioElement>
) => {
  localMuted.current = !localMuted.current;

  if (localMuted.current) {
    if (!isFinishedRef.current) {
      if (!changedWhileNotFinishedRef.current) {
        changedWhileNotFinishedRef.current = true;
      }
      return;
    }

    videoIconStateRef.current = {
      from: videoIconStateRef.current.to,
      to: "off",
    };

    const newPaths = getPaths(videoIconStateRef.current.from, "off");
    if (newPaths[0]) {
      setPaths(newPaths);
    }
  } else {
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

    videoIconStateRef.current = {
      from: videoIconStateRef.current.to,
      to: newVolumeState,
    };

    const newPaths = getPaths(videoIconStateRef.current.from, newVolumeState);
    if (newPaths[0]) {
      setPaths(newPaths);
    }
  }
};

export default onMuteRequest;
