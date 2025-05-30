import React from "react";
import "./lib/tinyLoader.css";

export default function TinyLoader({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`${className} tiny-loader-container relative`}
      onClick={onClick}
    >
      <div className="tiny-loader rounded-full" />
    </div>
  );
}
