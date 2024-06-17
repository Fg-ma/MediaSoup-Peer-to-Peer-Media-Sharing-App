import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

export default function HoldButton({
  clickFunction,
  holdFunction,
  contentFunction,
  holdContent,
  styles,
  dataValue,
}: {
  clickFunction: () => void;
  holdFunction: (event: React.MouseEvent<Element, MouseEvent>) => void;
  contentFunction: () => React.ReactElement;
  holdContent: React.ReactElement;
  styles: string;
  dataValue: string;
}) {
  const [isHeld, setIsHeld] = useState(false);
  const isHeldRef = useRef(false);
  const holdTimeout = useRef<NodeJS.Timeout>();
  const holdButtonRef = useRef<HTMLButtonElement>(null);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    holdTimeout.current = setTimeout(() => {
      isHeldRef.current = true;
      setIsHeld(true);
    }, 500);
  };

  const handleMouseUp = (event: React.MouseEvent<Element, MouseEvent>) => {
    if (!isHeldRef.current) {
      clickFunction();
    } else {
      holdFunction(event);
    }

    if (holdTimeout.current !== null) {
      clearTimeout(holdTimeout.current);
    }
    isHeldRef.current = false;
    setIsHeld(false);
  };

  useEffect(() => {
    const handleWindowMouseUp = (event: MouseEvent) =>
      handleMouseUp(event as unknown as React.MouseEvent<Element, MouseEvent>);

    window.addEventListener("mouseup", handleWindowMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, []);

  return (
    <div>
      <button
        ref={holdButtonRef}
        onMouseDown={(event) => handleMouseDown(event)}
        className={styles}
        data-thing={"1"}
      >
        {contentFunction()}
      </button>
      {isHeld ? (
        <HoldButtonPortal
          holdContent={holdContent}
          holdButtonRef={holdButtonRef}
        />
      ) : null}
    </div>
  );
}

function HoldButtonPortal({
  holdContent,
  holdButtonRef,
}: {
  holdContent: React.ReactElement;
  holdButtonRef: React.RefObject<HTMLButtonElement>;
}) {
  const [portalPosition, setPortalPosition] = useState({ top: 0, left: 0 });
  const portalRef = useRef<HTMLDivElement>(null);

  const getPortalPosition = () => {
    const holdButtonRect = holdButtonRef.current?.getBoundingClientRect();
    const portalRect = portalRef.current?.getBoundingClientRect();

    if (!holdButtonRect || !portalRect) {
      return;
    }

    const top = holdButtonRect.top - portalRect.height;
    const left =
      holdButtonRect.left + holdButtonRect.width / 2 - portalRect.width / 2;

    const bodyRect = document.body.getBoundingClientRect();
    const topPercent = (top / bodyRect.height) * 100;
    const leftPercent = (left / bodyRect.width) * 100;

    setPortalPosition({
      top: topPercent,
      left: leftPercent,
    });
  };

  useEffect(() => {
    getPortalPosition();
  }, []);

  return ReactDOM.createPortal(
    <div
      ref={portalRef}
      className={`${
        !portalPosition.top && !portalPosition.left && "opacity-0"
      } absolute w-min h-min z-20`}
      style={{
        top: `${portalPosition.top}%`,
        left: `${portalPosition.left}%`,
      }}
    >
      {holdContent}
    </div>,
    document.body
  );
}
