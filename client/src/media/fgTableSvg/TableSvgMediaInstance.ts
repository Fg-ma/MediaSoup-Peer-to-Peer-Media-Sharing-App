import JSZip from "jszip";
import SvgMedia, { SvgListenerTypes } from "./TableSvgMedia";
import {
  defaultSvgEffects,
  defaultSvgEffectsStyles,
  StaticContentEffectsStylesType,
  StaticContentEffectsType,
  SvgEffectTypes,
} from "../../../../universal/effectsTypeConstant";
import {
  DownloadCompressionTypes,
  DownloadMimeTypes,
} from "./lib/typeConstant";

export type SvgInstanceListenerTypes = { type: "effectsChanged" };

class TableSvgMediaInstance {
  instanceSvg: SVGSVGElement | undefined = undefined;

  private positioning: {
    position: {
      left: number;
      top: number;
    };
    scale: {
      x: number;
      y: number;
    };
    rotation: number;
  };

  private svgInstanceListeners: Set<
    (message: SvgInstanceListenerTypes) => void
  > = new Set();

  constructor(
    public svgMedia: SvgMedia,
    private svgInstanceId: string,
    private staticContentEffectsStyles: React.MutableRefObject<StaticContentEffectsStylesType>,
    private staticContentEffects: React.MutableRefObject<StaticContentEffectsType>,
    initPositioning: {
      position: {
        left: number;
        top: number;
      };
      scale: {
        x: number;
        y: number;
      };
      rotation: number;
    },
  ) {
    this.positioning = initPositioning;

    if (!this.staticContentEffects.current.svg[this.svgInstanceId]) {
      this.staticContentEffects.current.svg[this.svgInstanceId] =
        structuredClone(defaultSvgEffects);
    }

    if (!this.staticContentEffectsStyles.current.svg[this.svgInstanceId]) {
      this.staticContentEffectsStyles.current.svg[this.svgInstanceId] =
        structuredClone(defaultSvgEffectsStyles);
    }

    if (this.svgMedia.svg) {
      this.instanceSvg = this.svgMedia.svg?.cloneNode(true) as SVGSVGElement;
    }
    this.svgMedia.addSvgListener(this.handleSvgMessages);
  }

  deconstructor = () => {
    this.svgMedia.removeSvgListener(this.handleSvgMessages);
  };

  private handleSvgMessages = (event: SvgListenerTypes) => {
    switch (event.type) {
      case "downloadComplete":
        this.onDownloadComplete();
        break;
      default:
        break;
    }
  };

  private onDownloadComplete = () => {
    this.instanceSvg = this.svgMedia.svg!.cloneNode(true) as SVGSVGElement;
    this.updateAllEffects();
  };

  clearAllEffects = () => {
    Object.entries(
      this.staticContentEffects.current.svg[this.svgInstanceId],
    ).map(([effect, value]) => {
      if (value) {
        let effectId = "";
        switch (effect) {
          case "blur":
            effectId = "#fgSvgBlurFilter_" + this.svgInstanceId;
            break;
          case "shadow":
            effectId = "#fgSvgShadowFilter_" + this.svgInstanceId;
            break;
          case "grayscale":
            effectId = "#fgSvgGrayscaleFilter_" + this.svgInstanceId;
            break;
          case "saturate":
            effectId = "#fgSvgSaturateFilter_" + this.svgInstanceId;
            break;
          case "edgeDetection":
            effectId = "#fgSvgEdgeDetectionFilter_" + this.svgInstanceId;
            break;
          case "colorOverlay":
            effectId = "#fgSvgColorOverlayFilter_" + this.svgInstanceId;
            break;
          case "waveDistortion":
            effectId = "#fgSvgWaveDistortionFilter_" + this.svgInstanceId;
            break;
          case "crackedGlass":
            effectId = "#fgSvgCrackedGlassFilter_" + this.svgInstanceId;
            break;
          case "neonGlow":
            effectId = "#fgSvgNeonGlowFilter_" + this.svgInstanceId;
            break;
          default:
            break;
        }

        if (effectId) this.removeEffect(effectId);

        this.staticContentEffects.current.svg[this.svgInstanceId][
          effect as SvgEffectTypes
        ] = false;
      }
    });

    this.svgInstanceListeners.forEach((listener) => {
      listener({ type: "effectsChanged" });
    });
  };

  updateAllEffects = () => {
    Object.entries(
      this.staticContentEffects.current.svg[this.svgInstanceId],
    ).map(([effect, value]) => {
      if (value) {
        const styles =
          this.staticContentEffectsStyles.current.svg[this.svgInstanceId];

        switch (effect) {
          case "blur":
            this.applyBlurEffect(`${styles.blur.strength}`);
            break;
          case "shadow":
            this.applyShadowEffect(
              styles.shadow.shadowColor,
              `${styles.shadow.strength}`,
              `${styles.shadow.offsetX}`,
              `${styles.shadow.offsetY}`,
            );
            break;
          case "grayscale":
            this.applyGrayscaleEffect(`${styles.grayscale.scale}`);
            break;
          case "saturate":
            this.applySaturateEffect(`${styles.saturate.saturation}`);
            break;
          case "edgeDetection":
            this.applyEdgeDetectionEffect();
            break;
          case "colorOverlay":
            this.applyColorOverlayEffect(styles.colorOverlay.overlayColor);
            break;
          case "waveDistortion":
            this.applyWaveDistortionEffect(
              `${styles.waveDistortion.frequency}`,
              `${styles.waveDistortion.strength}`,
            );
            break;
          case "crackedGlass":
            this.applyCrackedGlassEffect(
              `${styles.crackedGlass.density}`,
              `${styles.crackedGlass.detail}`,
              `${styles.crackedGlass.strength}`,
            );
            break;
          case "neonGlow":
            this.applyNeonGlowEffect(styles.neonGlow.neonColor);
            break;
          default:
            break;
        }
      }
    });

    this.svgInstanceListeners.forEach((listener) => {
      listener({ type: "effectsChanged" });
    });
  };

  applyShadowEffect = (
    shadowColor: string,
    strength: string,
    offsetX: string,
    offsetY: string,
  ) => {
    if (!this.instanceSvg) return;

    let filter = this.instanceSvg.querySelector(
      "#fgSvgShadowFilter_" + this.svgInstanceId,
    );

    if (!filter) {
      filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute("id", "fgSvgShadowFilter_" + this.svgInstanceId);

      const feGaussianBlur = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feGaussianBlur",
      );
      feGaussianBlur.setAttribute("in", "SourceAlpha");
      feGaussianBlur.setAttribute("stdDeviation", strength);
      feGaussianBlur.setAttribute("result", "blur");

      const feOffset = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feOffset",
      );
      feOffset.setAttribute("dx", offsetX);
      feOffset.setAttribute("dy", offsetY);
      feOffset.setAttribute("result", "offsetBlur");

      const feFlood = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feFlood",
      );
      feFlood.setAttribute("flood-color", shadowColor);
      feFlood.setAttribute("result", "colorBlur");

      const feComposite = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feComposite",
      );
      feComposite.setAttribute("in", "colorBlur");
      feComposite.setAttribute("in2", "offsetBlur");
      feComposite.setAttribute("operator", "in");
      feComposite.setAttribute("result", "coloredBlur");

      const feMerge = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feMerge",
      );
      const feMergeNode1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feMergeNode",
      );
      feMergeNode1.setAttribute("in", "coloredBlur");

      const feMergeNode2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feMergeNode",
      );
      feMergeNode2.setAttribute("in", "SourceGraphic");

      feMerge.appendChild(feMergeNode1);
      feMerge.appendChild(feMergeNode2);

      filter.appendChild(feGaussianBlur);
      filter.appendChild(feOffset);
      filter.appendChild(feFlood);
      filter.appendChild(feComposite);
      filter.appendChild(feMerge);

      this.instanceSvg.appendChild(filter);
    } else {
      const feGaussianBlur = filter.querySelector("feGaussianBlur");
      const feOffset = filter.querySelector("feOffset");
      const feFlood = filter.querySelector("feFlood");

      if (feGaussianBlur) feGaussianBlur.setAttribute("stdDeviation", strength);
      if (feOffset) {
        feOffset.setAttribute("dx", offsetX);
        feOffset.setAttribute("dy", offsetY);
      }
      if (feFlood) feFlood.setAttribute("flood-color", shadowColor);
    }

    const filterList = this.instanceSvg.style.filter.split(/\s+/);
    const filterString = `url(#fgSvgShadowFilter_${this.svgInstanceId})`;
    if (filterList && !filterList.includes(filterString)) {
      this.instanceSvg.style.filter += ` ${filterString}`;
    } else if (!filterList) {
      this.instanceSvg.style.filter = filterString;
    }

    this.svgInstanceListeners.forEach((listener) => {
      listener({ type: "effectsChanged" });
    });
  };

  applyBlurEffect = (strength: string) => {
    if (!this.instanceSvg) return;

    let filter = this.instanceSvg.querySelector(
      "#fgSvgBlurFilter_" + this.svgInstanceId,
    );

    if (!filter) {
      filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute("id", "fgSvgBlurFilter_" + this.svgInstanceId);

      const feGaussianBlur = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feGaussianBlur",
      );
      feGaussianBlur.setAttribute("in", "SourceGraphic");
      feGaussianBlur.setAttribute("stdDeviation", strength);

      filter.appendChild(feGaussianBlur);
      this.instanceSvg.appendChild(filter);
    } else {
      const feGaussianBlur = filter.querySelector("feGaussianBlur");
      if (feGaussianBlur) feGaussianBlur.setAttribute("stdDeviation", strength);
    }

    const filterList = this.instanceSvg.style.filter.split(/\s+/);
    const filterString = `url(#fgSvgBlurFilter_${this.svgInstanceId})`;
    if (filterList && !filterList.includes(filterString)) {
      this.instanceSvg.style.filter += ` ${filterString}`;
    } else if (!filterList) {
      this.instanceSvg.style.filter = filterString;
    }

    this.svgInstanceListeners.forEach((listener) => {
      listener({ type: "effectsChanged" });
    });
  };

  applyGrayscaleEffect = (scale: string) => {
    if (!this.instanceSvg) return;

    let filter = this.instanceSvg.querySelector(
      "#fgSvgGrayscaleFilter_" + this.svgInstanceId,
    );

    if (!filter) {
      filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute("id", "fgSvgGrayscaleFilter_" + this.svgInstanceId);

      const feColorMatrix = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feColorMatrix",
      );
      feColorMatrix.setAttribute("type", "saturate");
      feColorMatrix.setAttribute("values", scale);

      filter.appendChild(feColorMatrix);
      this.instanceSvg.appendChild(filter);
    } else {
      const feColorMatrix = filter.querySelector("feColorMatrix");
      if (feColorMatrix) feColorMatrix.setAttribute("values", scale);
    }

    const filterList = this.instanceSvg.style.filter.split(/\s+/);
    const filterString = `url(#fgSvgGrayscaleFilter_${this.svgInstanceId})`;
    if (filterList && !filterList.includes(filterString)) {
      this.instanceSvg.style.filter += ` ${filterString}`;
    } else if (!filterList) {
      this.instanceSvg.style.filter = filterString;
    }

    this.svgInstanceListeners.forEach((listener) => {
      listener({ type: "effectsChanged" });
    });
  };

  applySaturateEffect = (saturation: string) => {
    if (!this.instanceSvg) return;

    let filter = this.instanceSvg.querySelector(
      "#fgSvgSaturateFilter_" + this.svgInstanceId,
    );

    if (!filter) {
      filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute("id", "fgSvgSaturateFilter_" + this.svgInstanceId);

      const feColorMatrix = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feColorMatrix",
      );
      feColorMatrix.setAttribute("type", "saturate");
      feColorMatrix.setAttribute("values", saturation);

      filter.appendChild(feColorMatrix);
      this.instanceSvg.appendChild(filter);
    } else {
      const feColorMatrix = filter.querySelector("feColorMatrix");
      if (feColorMatrix) feColorMatrix.setAttribute("values", saturation);
    }

    const filterList = this.instanceSvg.style.filter.split(/\s+/);
    const filterString = `url(#fgSvgSaturateFilter_${this.svgInstanceId})`;
    if (filterList && !filterList.includes(filterString)) {
      this.instanceSvg.style.filter += ` ${filterString}`;
    } else if (!filterList) {
      this.instanceSvg.style.filter = filterString;
    }

    this.svgInstanceListeners.forEach((listener) => {
      listener({ type: "effectsChanged" });
    });
  };

  applyEdgeDetectionEffect = () => {
    if (!this.instanceSvg) return;

    let filter = this.instanceSvg.querySelector(
      "#fgSvgEdgeDetectionFilter_" + this.svgInstanceId,
    );
    if (!filter) {
      filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute(
        "id",
        "fgSvgEdgeDetectionFilter_" + this.svgInstanceId,
      );

      const feConvolveMatrix = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feConvolveMatrix",
      );
      feConvolveMatrix.setAttribute("order", "3");
      feConvolveMatrix.setAttribute(
        "kernelMatrix",
        "-1 -1 -1 -1 8 -1 -1 -1 -1",
      );
      feConvolveMatrix.setAttribute("result", "edgeDetected");

      filter.appendChild(feConvolveMatrix);
      this.instanceSvg.appendChild(filter);
    }

    const filterList = this.instanceSvg.style.filter.split(/\s+/);
    const filterString = `url(#fgSvgEdgeDetectionFilter_${this.svgInstanceId})`;
    if (filterList && !filterList.includes(filterString)) {
      this.instanceSvg.style.filter += ` ${filterString}`;
    } else if (!filterList) {
      this.instanceSvg.style.filter = filterString;
    }

    this.svgInstanceListeners.forEach((listener) => {
      listener({ type: "effectsChanged" });
    });
  };

  applyColorOverlayEffect = (overlayColor: string) => {
    if (!this.instanceSvg) return;

    let filter = this.instanceSvg.querySelector(
      "#fgSvgColorOverlayFilter_" + this.svgInstanceId,
    );
    if (!filter) {
      filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute(
        "id",
        "fgSvgColorOverlayFilter_" + this.svgInstanceId,
      );

      const feFlood = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feFlood",
      );
      feFlood.setAttribute("flood-color", overlayColor);
      feFlood.setAttribute("result", "flood");
      feFlood.setAttribute("id", "fgSvgFeFlood_" + this.svgInstanceId);

      const feComposite1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feComposite",
      );
      feComposite1.setAttribute("in2", "SourceAlpha");
      feComposite1.setAttribute("operator", "in");
      feComposite1.setAttribute("result", "overlay");

      const feComposite2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feComposite",
      );
      feComposite2.setAttribute("in", "overlay");
      feComposite2.setAttribute("in2", "SourceGraphic");
      feComposite2.setAttribute("operator", "over");

      filter.appendChild(feFlood);
      filter.appendChild(feComposite1);
      filter.appendChild(feComposite2);
      this.instanceSvg.appendChild(filter);
    } else {
      // Update existing filter
      const feFlood = filter.querySelector(
        "#fgSvgFeFlood_" + this.svgInstanceId,
      );
      if (feFlood) {
        feFlood.setAttribute("flood-color", overlayColor);
      }
    }

    const filterList = this.instanceSvg.style.filter.split(/\s+/);
    const filterString = `url(#fgSvgColorOverlayFilter_${this.svgInstanceId})`;
    if (filterList && !filterList.includes(filterString)) {
      this.instanceSvg.style.filter += ` ${filterString}`;
    } else if (!filterList) {
      this.instanceSvg.style.filter = filterString;
    }

    this.svgInstanceListeners.forEach((listener) => {
      listener({ type: "effectsChanged" });
    });
  };

  applyNeonGlowEffect = (neonColor: string) => {
    if (!this.instanceSvg) return;

    let filter = this.instanceSvg.querySelector(
      "#fgSvgNeonGlowFilter_" + this.svgInstanceId,
    );
    if (!filter) {
      filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute("id", "fgSvgNeonGlowFilter_" + this.svgInstanceId);

      const feGaussianBlur = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feGaussianBlur",
      );
      feGaussianBlur.setAttribute("in", "SourceAlpha");
      feGaussianBlur.setAttribute("stdDeviation", "3");
      feGaussianBlur.setAttribute("result", "blurred");

      const feFlood = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feFlood",
      );
      feFlood.setAttribute("flood-color", neonColor);
      feFlood.setAttribute("result", "glowColor");
      feFlood.setAttribute("id", "fgSvgFeNeonFlood_" + this.svgInstanceId);

      const feComposite1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feComposite",
      );
      feComposite1.setAttribute("in", "glowColor");
      feComposite1.setAttribute("in2", "blurred");
      feComposite1.setAttribute("operator", "in");
      feComposite1.setAttribute("result", "glow");

      const feComposite2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feComposite",
      );
      feComposite2.setAttribute("in", "SourceGraphic");
      feComposite2.setAttribute("in2", "glow");
      feComposite2.setAttribute("operator", "over");

      filter.appendChild(feGaussianBlur);
      filter.appendChild(feFlood);
      filter.appendChild(feComposite1);
      filter.appendChild(feComposite2);

      this.instanceSvg.appendChild(filter);
    } else {
      // Update existing filter
      const feFlood = filter.querySelector(
        "#fgSvgFeNeonFlood_" + this.svgInstanceId,
      );
      if (feFlood) {
        feFlood.setAttribute("flood-color", neonColor);
      }
    }

    const filterList = this.instanceSvg.style.filter.split(/\s+/);
    const filterString = `url(#fgSvgNeonGlowFilter_${this.svgInstanceId})`;
    if (filterList && !filterList.includes(filterString)) {
      this.instanceSvg.style.filter += ` ${filterString}`;
    } else if (!filterList) {
      this.instanceSvg.style.filter = filterString;
    }

    this.svgInstanceListeners.forEach((listener) => {
      listener({ type: "effectsChanged" });
    });
  };

  applyCrackedGlassEffect = (
    density: string,
    detail: string,
    strength: string,
  ) => {
    if (!this.instanceSvg) return;

    let filter = this.instanceSvg.querySelector(
      "#fgSvgCrackedGlassFilter_" + this.svgInstanceId,
    );
    if (!filter) {
      filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute(
        "id",
        "fgSvgCrackedGlassFilter_" + this.svgInstanceId,
      );

      const feTurbulence = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feTurbulence",
      );
      feTurbulence.setAttribute("type", "fractalNoise");
      feTurbulence.setAttribute("baseFrequency", density);
      feTurbulence.setAttribute("numOctaves", `${parseInt(detail)}`);
      feTurbulence.setAttribute("result", "turbulence");
      feTurbulence.setAttribute(
        "id",
        "fgSvgFeCrackedTurbulence_" + this.svgInstanceId,
      );

      const feDisplacementMap = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feDisplacementMap",
      );
      feDisplacementMap.setAttribute("in", "SourceGraphic");
      feDisplacementMap.setAttribute("in2", "turbulence");
      feDisplacementMap.setAttribute("scale", strength);
      feDisplacementMap.setAttribute(
        "id",
        "fgSvgFeCrackedDisplacement_" + this.svgInstanceId,
      );

      filter.appendChild(feTurbulence);
      filter.appendChild(feDisplacementMap);

      this.instanceSvg.appendChild(filter);
    } else {
      // Update existing filter
      const feTurbulence = filter.querySelector(
        "#fgSvgFeCrackedTurbulence_" + this.svgInstanceId,
      );
      if (feTurbulence) {
        feTurbulence.setAttribute("baseFrequency", density);
        feTurbulence.setAttribute("numOctaves", `${parseInt(detail)}`);
      }
      const feDisplacementMap = filter.querySelector(
        "#fgSvgFeCrackedDisplacement_" + this.svgInstanceId,
      );
      if (feDisplacementMap) {
        feDisplacementMap.setAttribute("scale", strength);
      }
    }

    const filterList = this.instanceSvg.style.filter.split(/\s+/);
    const filterString = `url(#fgSvgCrackedGlassFilter_${this.svgInstanceId})`;
    if (filterList && !filterList.includes(filterString)) {
      this.instanceSvg.style.filter += ` ${filterString}`;
    } else if (!filterList) {
      this.instanceSvg.style.filter = filterString;
    }

    this.svgInstanceListeners.forEach((listener) => {
      listener({ type: "effectsChanged" });
    });
  };

  applyWaveDistortionEffect = (frequency: string, strength: string) => {
    if (!this.instanceSvg) return;

    let filter = this.instanceSvg.querySelector(
      "#fgSvgWaveDistortionFilter_" + this.svgInstanceId,
    );

    if (!filter) {
      filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute(
        "id",
        "fgSvgWaveDistortionFilter_" + this.svgInstanceId,
      );

      const feTurbulence = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feTurbulence",
      );
      feTurbulence.setAttribute("type", "fractalNoise");
      feTurbulence.setAttribute("baseFrequency", frequency);
      feTurbulence.setAttribute("result", "turbulence");

      const feDisplacementMap = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feDisplacementMap",
      );
      feDisplacementMap.setAttribute("in", "SourceGraphic");
      feDisplacementMap.setAttribute("in2", "turbulence");
      feDisplacementMap.setAttribute("scale", strength);

      filter.appendChild(feTurbulence);
      filter.appendChild(feDisplacementMap);

      this.instanceSvg.appendChild(filter);
    } else {
      const feTurbulence = filter.querySelector("feTurbulence");
      const feDisplacementMap = filter.querySelector("feDisplacementMap");

      if (feTurbulence) feTurbulence.setAttribute("baseFrequency", frequency);
      if (feDisplacementMap) feDisplacementMap.setAttribute("scale", strength);
    }

    let filterList = this.instanceSvg.style.filter.split(/\s+/);
    const filterString = `url(#fgSvgWaveDistortionFilter_${this.svgInstanceId})`;
    if (filterList && !filterList.includes(filterString)) {
      this.instanceSvg.style.filter += ` ${filterString}`;
    } else if (!filterList) {
      this.instanceSvg.style.filter = filterString;
    }

    this.svgInstanceListeners.forEach((listener) => {
      listener({ type: "effectsChanged" });
    });
  };

  removeEffect = (id: string) => {
    if (!this.instanceSvg) return;

    let filter = this.instanceSvg.querySelector(id);
    if (filter) {
      filter.remove();
    }

    let currentFilter = this.instanceSvg.style.filter;
    if (currentFilter && currentFilter.includes(`url("${id}")`)) {
      this.instanceSvg.style.filter = currentFilter
        .split(/\s+/)
        .filter((filter) => filter !== `url("${id}")`)
        .join(" ")
        .trim();
    }

    this.svgInstanceListeners.forEach((listener) => {
      listener({ type: "effectsChanged" });
    });
  };

  private triggerDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  private zipBlob = async (blob: Blob): Promise<Blob> => {
    const zip = new JSZip();
    zip.file("compressed-image", blob);
    const compressedBlob = await zip.generateAsync({ type: "blob" });
    return compressedBlob;
  };

  downloadSvg = async (
    mimeType: DownloadMimeTypes,
    width: number,
    height: number,
    compression: DownloadCompressionTypes,
  ) => {
    if (!this.instanceSvg) {
      console.error("SVG element is not available.");
      return;
    }

    // Serialize SVG to a string
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(this.instanceSvg);

    // Handle minification (remove unnecessary whitespace and comments)
    if (compression === "Minified") {
      svgString = svgString
        .replace(/\s{2,}/g, " ") // Remove excessive spaces
        .replace(/<!--.*?-->/g, "") // Remove comments
        .trim();
    }

    // Handle zipped SVGZ
    if (
      mimeType === "svgz" ||
      (mimeType === "svg" && compression === "Zipped")
    ) {
      const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);
      this.triggerDownload(url, "downloaded-vector-image.svgz");
      return;
    }

    // Handle standard SVG download
    if (mimeType === "svg") {
      const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);
      this.triggerDownload(url, "downloaded-vector-image.svg");
      return;
    }

    // Convert SVG to raster formats (PNG, JPG, WebP, etc.)
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = async () => {
      ctx?.clearRect(0, 0, width, height);
      ctx?.drawImage(img, 0, 0, width, height);

      const mimeTypeMap: Record<DownloadMimeTypes, string> = {
        svg: "image/svg+xml",
        svgz: "image/svg+xml",
        jpg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
        tiff: "image/tiff",
        heic: "image/heic",
      };

      // Convert canvas to desired image format
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error("Failed to create image blob.");
          return;
        }

        // Handle Zipped compression for raster images
        if (compression === "Zipped") {
          const compressedBlob = await this.zipBlob(blob);
          const zipUrl = URL.createObjectURL(compressedBlob);
          this.triggerDownload(
            zipUrl,
            `downloaded-vector-image.${mimeType}.zip`,
          );
          return;
        }

        // Normal image download
        const imageUrl = URL.createObjectURL(blob);
        this.triggerDownload(imageUrl, `downloaded-vector-image.${mimeType}`);
      }, mimeTypeMap[mimeType]);

      // Cleanup
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  copyToClipboard = async (compression: DownloadCompressionTypes) => {
    if (!this.instanceSvg) {
      console.error("SVG element is not available.");
      return;
    }

    // Serialize the SVG to a string
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(this.instanceSvg);

    // Minify if needed
    if (compression === "Minified") {
      svgString = svgString
        .replace(/\s{2,}/g, " ") // Remove excessive spaces
        .replace(/<!--.*?-->/g, "") // Remove comments
        .trim();
    }

    try {
      await navigator.clipboard.writeText(svgString);
    } catch (error) {
      console.error("Failed to copy SVG to clipboard:", error);
    }
  };

  getAspect = () => {
    return this.svgMedia.aspect;
  };

  setPositioning = (positioning: {
    position: {
      left: number;
      top: number;
    };
    scale: {
      x: number;
      y: number;
    };
    rotation: number;
  }) => {
    this.positioning = positioning;
  };

  getPositioning = () => {
    return this.positioning;
  };

  addSvgInstanceListener = (
    listener: (message: SvgInstanceListenerTypes) => void,
  ): void => {
    this.svgInstanceListeners.add(listener);
  };

  removeSvgInstanceListener = (
    listener: (message: SvgInstanceListenerTypes) => void,
  ): void => {
    this.svgInstanceListeners.delete(listener);
  };
}

export default TableSvgMediaInstance;
