const onAcceptedMuteLock = (
  event: {
    type: string;
    producerUsername: string;
  },
  isUser: boolean,
  username: string,
  muteLock: React.MutableRefObject<boolean>,
  videoIconStateRef: React.MutableRefObject<{
    from: string;
    to: string;
  }>,
  getPaths: (from: string, to: string) => string[][],
  setPaths: React.Dispatch<React.SetStateAction<string[][]>>
) => {
  if (isUser || username !== event.producerUsername) {
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
};

export default onAcceptedMuteLock;
