import React, { useState } from "react";
import FgPanel from "../fgPanel/FgPanel";
import FgButton from "../fgButton/FgButton";
import "./button.css";

export default function FgSoundBoard() {
  const [numButtons, setNumButtons] = useState(5);
  const [activeButtons, setActiveButtons] = useState(
    Array(numButtons).fill(false)
  );

  const toggleButton = (index: number) => {
    setActiveButtons((prevState) => {
      const newActiveButtons = [...prevState];
      newActiveButtons[index] = !newActiveButtons[index];
      return newActiveButtons;
    });
  };

  return (
    <FgPanel
      content={
        <div className='grid col-span-3 gap-3'>
          {Array.from({ length: numButtons }, (_, index) => (
            <FgButton
              key={index}
              className={`button-60 ${activeButtons[index] ? "active" : ""}`}
              clickFunction={() => toggleButton(index)}
              contentFunction={() => (
                <>
                  <div className='button-60-alt'></div>
                  <div className='button-60-alt-2'></div>
                </>
              )}
            />
          ))}
        </div>
      }
      initPosition={{ x: 0, y: 0 }}
      initHeight='400px'
      initWidth='400px'
      backgroundColor='#f3f3f3'
      secondaryBackgroundColor='#d9d9d9'
    />
  );
}
