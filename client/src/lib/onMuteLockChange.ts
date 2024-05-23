const onMuteLockChange = (
  event: {
    type: string;
    isMuteLock: boolean;
    username: string;
  },
  username: React.MutableRefObject<string>
) => {
  if (event.username === username.current) {
    return;
  }

  const bundleContainerElement = document.getElementById(
    `${event.username}_bundle_container`
  );
  if (bundleContainerElement) {
    if (event.isMuteLock) {
      bundleContainerElement.classList.add("mute-lock");
    } else {
      bundleContainerElement.classList.remove("mute-lock");
    }
  }
};

export default onMuteLockChange;
