import React from "react";
import "./lib/simpleLoader.css";

export default function SimpleLoader({ className }: { className?: string }) {
  return (
    <div className={`${className} simple-loader-container relative`}>
      <div className="simple-loader rounded-full" />
      <div className="simple-loader rounded-full" />
      <div className="simple-loader rounded-full" />
    </div>
  );
}
