import React, { useEffect, useRef } from "react";
import "./lib/fgImageElement.css";

export default function FgImageElement({
  src,
  srcLoading,
  alt,
  className,
  imageClassName,
  style,
  ...props
}: {
  src: string;
  srcLoading?: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
  style?: React.CSSProperties;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const loaded = useRef(false);

  const onLoad = () => {
    loaded.current = true;
    containerRef.current?.classList.add("loaded");
    containerRef.current?.style.setProperty("background-image", "none");
  };

  useEffect(() => {
    if (containerRef.current && srcLoading) {
      containerRef.current.style.setProperty(
        "--background-image",
        `url(${srcLoading})`,
      );
    }
  }, [srcLoading]);

  return (
    <div
      ref={containerRef}
      className={`${className} ${loaded.current ? "loaded" : ""} blurred-img`}
      style={{
        backgroundImage: `${srcLoading ? `url(${srcLoading})` : ""}`,
        ...style,
      }}
      {...props}
    >
      <img
        className={`${imageClassName} h-full w-full`}
        ref={imgRef}
        src={src}
        onLoad={onLoad}
        loading="lazy"
        alt={alt}
        {...props}
      />
    </div>
  );
}
