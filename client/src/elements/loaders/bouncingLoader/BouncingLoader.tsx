import React from "react";
import "./lib/bouncingLoader.css";

export default function BouncingLoader({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <svg
      className={`${className} bg-fg-tone-black-1`}
      onClick={onClick}
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="bouncing-loader-gradient"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor="hsl(320, 98%, 50%)" />
          <stop offset="100%" stopColor="hsl(355, 98%, 42%)" />
        </linearGradient>
      </defs>
      <path
        className="bouncing-loader-ball"
        d="M92,15.492S78.194,4.967,66.743,16.887c-17.231,17.938-28.26,96.974-28.26,96.974L119.85,59.892l-99-31.588,57.528,89.832L97.8,19.349,13.636,88.51l89.012,16.015S81.908,38.332,66.1,22.337C50.114,6.156,36,15.492,36,15.492a56,56,0,1,0,56,0Z"
        fill="none"
        stroke="url(#bouncing-loader-gradient)"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="44 1111"
        strokeDashoffset="10"
      />
    </svg>
  );
}
