import React from "react";

interface CheckboardProps {
  size?: number;
  white?: string;
  grey?: string;
}

const Checkboard: React.FC<CheckboardProps> = ({
  size = 8,
  white = "#fff",
  grey = "#ccc",
}) => {
  const base64 = `
    data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAA
    A3NCSVQICAjb4U/gAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA
    B3RJTUUH5AgLCTgZNyGmGAAAAMdJREFUSEvNlUEKgCAQRGc9
    39n6WZ1CaKqEnS4ZwduDgmbds5gqL+xME8Qw4nHjDh3wpJQK
    FRSglilQgtlpDkpLsMTsVQK8Od+A8Z8QWmP1fJ0qhwFN8iI2
    h8fzrpeuIw0vRCV1IYMgMLF1j1PKwNQjNAAAAAElFTkSuQmCC
  `;

  const style = {
    width: "100%",
    height: "100%",
    background: `url(${base64})`,
    backgroundSize: `${size}px ${size}px`,
  };

  return <div style={style} />;
};

export default Checkboard;
