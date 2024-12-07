import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { VoskResult } from "../CaptionButton";

export default function FgVideoCaptions({
  visualMediaContainerRef,
  browserStandardSpeechRecognitionAvailable,
  voskCaptions,
  browserCaptions,
}: {
  visualMediaContainerRef: React.RefObject<HTMLDivElement>;
  browserStandardSpeechRecognitionAvailable: React.MutableRefObject<boolean>;
  voskCaptions?: VoskResult;
  browserCaptions: string;
}) {
  const [timedOut, setTimedOut] = useState(false);
  const timeOut = useRef<NodeJS.Timeout | undefined>(undefined);

  if (!visualMediaContainerRef.current) {
    return;
  }

  useEffect(() => {
    timeOut.current = setTimeout(() => {
      setTimedOut(true);
    }, 5500);

    return () => {
      setTimedOut(false);
      clearTimeout(timeOut.current);
      timeOut.current = undefined;
    };
  }, [voskCaptions, browserCaptions]);

  return ReactDOM.createPortal(
    <div className='captions'>
      {!timedOut &&
        browserStandardSpeechRecognitionAvailable.current &&
        browserCaptions && (
          <div className='caption-text'>{browserCaptions}</div>
        )}
      {!timedOut &&
        !browserStandardSpeechRecognitionAvailable.current &&
        voskCaptions &&
        voskCaptions.result.text && (
          <div className='caption-text'>{voskCaptions.result.text}</div>
        )}
    </div>,
    visualMediaContainerRef.current
  );
}
