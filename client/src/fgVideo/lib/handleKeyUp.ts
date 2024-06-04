const handleKeyUp = (
  event: KeyboardEvent,
  shiftPressed: React.MutableRefObject<boolean>,
  controlPressed: React.MutableRefObject<boolean>
) => {
  if (!event.key) {
    return;
  }

  switch (event.key.toLowerCase()) {
    case "shift":
      shiftPressed.current = false;
      break;
    case "control":
      controlPressed.current = false;
      break;
  }
};

export default handleKeyUp;
