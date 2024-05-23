const onAcceptedMuteLock = (event: {
  type: string;
  producerUsername: string;
}) => {
  const bundleContainerElement = document.getElementById(
    `${event.producerUsername}_bundle_container`
  );
  if (bundleContainerElement) {
    bundleContainerElement.classList.add("mute-lock");
  }
};
export default onAcceptedMuteLock;
