import React, {
  CSSProperties,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence } from "framer-motion";

const FgPortal = React.lazy(() => import("../fgPortal/FgPortal"));

interface FgSVGOptions {
  hoverTimeoutDuration?: number;
  hoverType?: "above" | "below";
}

const defaultFgSVGOptions: {
  hoverTimeoutDuration: number;
  hoverType: "above" | "below";
} = {
  hoverTimeoutDuration: 50,
  hoverType: "above",
};

export default function FgSVGElement({
  externalRef,
  src,
  attributes,
  className,
  style,
  hoverContent,
  options,
}: {
  externalRef?: React.MutableRefObject<SVGSVGElement | null>;
  src: string;
  attributes?: {
    key: string;
    value: string;
    id?: string;
    transition?: string;
  }[];
  className?: string;
  style?: CSSProperties;
  hoverContent?: React.ReactElement;
  options?: FgSVGOptions;
}) {
  const fgSVGOptions = {
    ...defaultFgSVGOptions,
    ...options,
  };

  const hoverTimeout = useRef<NodeJS.Timeout>();
  const [isHover, setIsHover] = useState(false);

  const svgContainerRef = useRef<HTMLDivElement>(null);

  const handlePointerEnter = () => {
    if (hoverContent && !hoverTimeout.current) {
      hoverTimeout.current = setTimeout(() => {
        setIsHover(true);
      }, fgSVGOptions.hoverTimeoutDuration);

      document.addEventListener("pointermove", handlePointerMove);
    }
  };

  const handlePointerMove = (event: PointerEvent) => {
    const svgElement = svgContainerRef.current;

    if (svgElement && !svgElement.contains(event.target as Node)) {
      setIsHover(false);
      if (hoverTimeout.current !== undefined) {
        clearTimeout(hoverTimeout.current);
        hoverTimeout.current = undefined;
      }

      document.removeEventListener("pointermove", handlePointerMove);
    }
  };

  useEffect(() => {
    const fetchSVG = async () => {
      try {
        const response = await fetch(src);
        const svgText = await response.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const svgElement = svgDoc.documentElement;

        // Apply attributes from props
        if (attributes) {
          attributes.forEach(({ key, value, id, transition }) => {
            if (id === undefined) {
              svgElement.setAttribute(key, value);
            } else {
              const element = svgDoc.getElementById(id);
              if (element) {
                try {
                  element.style[key as any] = "";
                } catch (error) {}
                element.setAttribute(key, value);
              }
            }
            if (transition) {
              svgElement.style.transition = transition;
            }
          });
        }

        if (externalRef)
          externalRef.current = svgElement as unknown as SVGSVGElement;

        if (svgContainerRef.current) {
          svgContainerRef.current.innerHTML = "";
          svgContainerRef.current.appendChild(svgElement);
        }
      } catch (error) {
        console.error("Error fetching SVG:", error);
      }
    };

    fetchSVG();
  }, [src, attributes]);

  return (
    <div
      className={className}
      style={style}
      ref={svgContainerRef}
      {...(hoverContent && { onPointerEnter: handlePointerEnter })}
    >
      {hoverContent && (
        <AnimatePresence>
          {isHover && (
            <Suspense fallback={<div>Loading...</div>}>
              <FgPortal
                type={fgSVGOptions.hoverType}
                content={hoverContent}
                externalRef={svgContainerRef}
              />
            </Suspense>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
