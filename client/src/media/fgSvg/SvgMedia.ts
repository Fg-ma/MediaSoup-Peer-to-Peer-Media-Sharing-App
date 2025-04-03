import JSZip from "jszip";
import {
  IncomingTableStaticContentMessages,
  TableTopStaticMimeType,
} from "../../serverControllers/tableStaticContentServer/lib/typeConstant";
import { StaticContentTypes } from "../../../../universal/typeConstant";
import {
  defaultSvgEffectsStyles,
  defaultSvgEffects,
  UserEffectsStylesType,
  UserEffectsType,
  SvgEffectTypes,
  SvgEffectStylesType,
} from "../../../../universal/effectsTypeConstant";
import {
  DownloadCompressionTypes,
  DownloadMimeTypes,
} from "./lib/typeConstant";

class SvgMedia {
  svg?: SVGSVGElement;

  filename: string;
  mimeType: TableTopStaticMimeType;
  visible: boolean;

  private fileChunks: Uint8Array[] = [];
  private totalSize = 0;
  blobURL: string | undefined;

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
  };

  private downloadCompleteListeners: Set<() => void> = new Set();

  aspect: number | undefined;

  constructor(
    private svgId: string,
    filename: string,
    mimeType: TableTopStaticMimeType,
    visible: boolean,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private userEffects: React.MutableRefObject<UserEffectsType>,
    private getSVG: (
      contentType: StaticContentTypes,
      contentId: string,
      key: string
    ) => void,
    private addMessageListener: (
      listener: (message: IncomingTableStaticContentMessages) => void
    ) => void,
    private removeMessageListener: (
      listener: (message: IncomingTableStaticContentMessages) => void
    ) => void,
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
    }
  ) {
    this.filename = filename;
    this.mimeType = mimeType;
    this.visible = visible;
    this.initPositioning = initPositioning;

    if (!this.userEffects.current.svg[this.svgId]) {
      this.userEffects.current.svg[this.svgId] =
        structuredClone(defaultSvgEffects);
    }

    if (!this.userEffectsStyles.current.svg[this.svgId]) {
      this.userEffectsStyles.current.svg[this.svgId] = structuredClone(
        defaultSvgEffectsStyles
      );
    }

    this.getSVG("svg", this.svgId, this.filename);
    this.addMessageListener(this.getSvgListener);
  }

  deconstructor = () => {
    if (this.blobURL) URL.revokeObjectURL(this.blobURL);

    this.removeMessageListener(this.getSvgListener);

    this.downloadCompleteListeners.clear();
  };

  reloadContent = (
    filename: string,
    mimeType: TableTopStaticMimeType,
    visible: boolean
  ) => {
    this.fileChunks = [];
    this.totalSize = 0;
    this.blobURL = undefined;

    this.filename = filename;
    this.mimeType = mimeType;
    this.visible = visible;

    this.getSVG("svg", this.svgId, this.filename);
    this.addMessageListener(this.getSvgListener);
  };

  private getSvgListener = async (
    message: IncomingTableStaticContentMessages
  ) => {
    if (message.type === "chunk") {
      const { contentType, contentId, key } = message.header;

      if (
        contentType !== "svg" ||
        contentId !== this.svgId ||
        key !== this.filename
      ) {
        return;
      }

      const chunkData = new Uint8Array(message.data.chunk.data);
      this.fileChunks.push(chunkData);
      this.totalSize += chunkData.length;
    } else if (message.type === "downloadComplete") {
      const { contentType, contentId, key } = message.header;

      if (
        contentType !== "svg" ||
        contentId !== this.svgId ||
        key !== this.filename
      ) {
        return;
      }

      const mergedBuffer = new Uint8Array(this.totalSize);
      let offset = 0;

      for (const chunk of this.fileChunks) {
        mergedBuffer.set(chunk, offset);
        offset += chunk.length;
      }

      const blob = new Blob([mergedBuffer], { type: this.mimeType });
      this.blobURL = URL.createObjectURL(blob);

      const response = await fetch(this.blobURL);
      const svgText = await response.text();
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
      this.svg = svgDoc.documentElement as unknown as SVGSVGElement;

      this.svg.setAttribute("width", "100%");
      this.svg.setAttribute("height", "100%");

      this.aspect = this.getSvgAspectRatio();

      this.downloadCompleteListeners.forEach((listener) => {
        listener();
      });

      this.removeMessageListener(this.getSvgListener);
    }
  };

  addDownloadCompleteListener = (listener: () => void): void => {
    this.downloadCompleteListeners.add(listener);
  };

  removeDownloadCompleteListener = (listener: () => void): void => {
    this.downloadCompleteListeners.delete(listener);
  };

  clearAllEffects = () => {
    Object.entries(this.userEffects.current.svg[this.svgId]).map(
      ([effect, value]) => {
        if (value) {
          let effectId = "";
          switch (effect) {
            case "blur":
              effectId = "#fgSvgBlurFilter_" + this.svgId;
              break;
            case "shadow":
              effectId = "#fgSvgShadowFilter_" + this.svgId;
              break;
            case "grayscale":
              effectId = "#fgSvgGrayscaleFilter_" + this.svgId;
              break;
            case "saturate":
              effectId = "#fgSvgSaturateFilter_" + this.svgId;
              break;
            case "edgeDetection":
              effectId = "#fgSvgEdgeDetectionFilter_" + this.svgId;
              break;
            case "colorOverlay":
              effectId = "#fgSvgColorOverlayFilter_" + this.svgId;
              break;
            case "waveDistortion":
              effectId = "#fgSvgWaveDistortionFilter_" + this.svgId;
              break;
            case "crackedGlass":
              effectId = "#fgSvgCrackedGlassFilter_" + this.svgId;
              break;
            case "neonGlow":
              effectId = "#fgSvgNeonGlowFilter_" + this.svgId;
              break;
            default:
              break;
          }

          this.removeEffect(effectId);

          this.userEffects.current.svg[this.svgId][effect as SvgEffectTypes] =
            false;
        }
      }
    );
  };

  updateAllEffects = () => {
    Object.entries(this.userEffects.current.svg[this.svgId]).map(
      ([effect, value]) => {
        if (value) {
          const styles = this.userEffectsStyles.current.svg[this.svgId];

          switch (effect) {
            case "blur":
              this.applyBlurEffect(`${styles.blur.strength}`);
              break;
            case "shadow":
              this.applyShadowEffect(
                styles.shadow.shadowColor,
                `${styles.shadow.strength}`,
                `${styles.shadow.offsetX}`,
                `${styles.shadow.offsetY}`
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
                `${styles.waveDistortion.strength}`
              );
              break;
            case "crackedGlass":
              this.applyCrackedGlassEffect(
                `${styles.crackedGlass.density}`,
                `${styles.crackedGlass.detail}`,
                `${styles.crackedGlass.strength}`
              );
              break;
            case "neonGlow":
              this.applyNeonGlowEffect(styles.neonGlow.neonColor);
              break;
            default:
              break;
          }
        }
      }
    );
  };

  applyShadowEffect(
    shadowColor: string,
    strength: string,
    offsetX: string,
    offsetY: string
  ) {
    if (!this.svg) return;

    let filter = this.svg.querySelector("#fgSvgShadowFilter_" + this.svgId);

    if (!filter) {
      filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute("id", "fgSvgShadowFilter_" + this.svgId);

      const feGaussianBlur = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feGaussianBlur"
      );
      feGaussianBlur.setAttribute("in", "SourceAlpha");
      feGaussianBlur.setAttribute("stdDeviation", strength);
      feGaussianBlur.setAttribute("result", "blur");

      const feOffset = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feOffset"
      );
      feOffset.setAttribute("dx", offsetX);
      feOffset.setAttribute("dy", offsetY);
      feOffset.setAttribute("result", "offsetBlur");

      const feFlood = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feFlood"
      );
      feFlood.setAttribute("flood-color", shadowColor);
      feFlood.setAttribute("result", "colorBlur");

      const feComposite = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feComposite"
      );
      feComposite.setAttribute("in", "colorBlur");
      feComposite.setAttribute("in2", "offsetBlur");
      feComposite.setAttribute("operator", "in");
      feComposite.setAttribute("result", "coloredBlur");

      const feMerge = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feMerge"
      );
      const feMergeNode1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feMergeNode"
      );
      feMergeNode1.setAttribute("in", "coloredBlur");

      const feMergeNode2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feMergeNode"
      );
      feMergeNode2.setAttribute("in", "SourceGraphic");

      feMerge.appendChild(feMergeNode1);
      feMerge.appendChild(feMergeNode2);

      filter.appendChild(feGaussianBlur);
      filter.appendChild(feOffset);
      filter.appendChild(feFlood);
      filter.appendChild(feComposite);
      filter.appendChild(feMerge);

      this.svg.appendChild(filter);
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

    const filterList = this.svg.style.filter.split(/\s+/);
    const filterString = `url(#fgSvgShadowFilter_${this.svgId})`;
    if (filterList && !filterList.includes(filterString)) {
      this.svg.style.filter += ` ${filterString}`;
    } else if (!filterList) {
      this.svg.style.filter = filterString;
    }
  }

  applyBlurEffect(strength: string) {
    if (!this.svg) return;

    let filter = this.svg.querySelector("#fgSvgBlurFilter_" + this.svgId);

    if (!filter) {
      filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute("id", "fgSvgBlurFilter_" + this.svgId);

      const feGaussianBlur = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feGaussianBlur"
      );
      feGaussianBlur.setAttribute("in", "SourceGraphic");
      feGaussianBlur.setAttribute("stdDeviation", strength);

      filter.appendChild(feGaussianBlur);
      this.svg.appendChild(filter);
    } else {
      const feGaussianBlur = filter.querySelector("feGaussianBlur");
      if (feGaussianBlur) feGaussianBlur.setAttribute("stdDeviation", strength);
    }

    const filterList = this.svg.style.filter.split(/\s+/);
    const filterString = `url(#fgSvgBlurFilter_${this.svgId})`;
    if (filterList && !filterList.includes(filterString)) {
      this.svg.style.filter += ` ${filterString}`;
    } else if (!filterList) {
      this.svg.style.filter = filterString;
    }
  }

  applyGrayscaleEffect(scale: string) {
    if (!this.svg) return;

    let filter = this.svg.querySelector("#fgSvgGrayscaleFilter_" + this.svgId);

    if (!filter) {
      filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute("id", "fgSvgGrayscaleFilter_" + this.svgId);

      const feColorMatrix = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feColorMatrix"
      );
      feColorMatrix.setAttribute("type", "saturate");
      feColorMatrix.setAttribute("values", scale);

      filter.appendChild(feColorMatrix);
      this.svg.appendChild(filter);
    } else {
      const feColorMatrix = filter.querySelector("feColorMatrix");
      if (feColorMatrix) feColorMatrix.setAttribute("values", scale);
    }

    const filterList = this.svg.style.filter.split(/\s+/);
    const filterString = `url(#fgSvgGrayscaleFilter_${this.svgId})`;
    if (filterList && !filterList.includes(filterString)) {
      this.svg.style.filter += ` ${filterString}`;
    } else if (!filterList) {
      this.svg.style.filter = filterString;
    }
  }

  applySaturateEffect(saturation: string) {
    if (!this.svg) return;

    let filter = this.svg.querySelector("#fgSvgSaturateFilter_" + this.svgId);

    if (!filter) {
      filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute("id", "fgSvgSaturateFilter_" + this.svgId);

      const feColorMatrix = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feColorMatrix"
      );
      feColorMatrix.setAttribute("type", "saturate");
      feColorMatrix.setAttribute("values", saturation);

      filter.appendChild(feColorMatrix);
      this.svg.appendChild(filter);
    } else {
      const feColorMatrix = filter.querySelector("feColorMatrix");
      if (feColorMatrix) feColorMatrix.setAttribute("values", saturation);
    }

    const filterList = this.svg.style.filter.split(/\s+/);
    const filterString = `url(#fgSvgSaturateFilter_${this.svgId})`;
    if (filterList && !filterList.includes(filterString)) {
      this.svg.style.filter += ` ${filterString}`;
    } else if (!filterList) {
      this.svg.style.filter = filterString;
    }
  }

  applyEdgeDetectionEffect() {
    if (!this.svg) return;

    let filter = this.svg.querySelector(
      "#fgSvgEdgeDetectionFilter_" + this.svgId
    );
    if (!filter) {
      filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute("id", "fgSvgEdgeDetectionFilter_" + this.svgId);

      const feConvolveMatrix = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feConvolveMatrix"
      );
      feConvolveMatrix.setAttribute("order", "3");
      feConvolveMatrix.setAttribute(
        "kernelMatrix",
        "-1 -1 -1 -1 8 -1 -1 -1 -1"
      );
      feConvolveMatrix.setAttribute("result", "edgeDetected");

      filter.appendChild(feConvolveMatrix);
      this.svg.appendChild(filter);
    }

    const filterList = this.svg.style.filter.split(/\s+/);
    const filterString = `url(#fgSvgEdgeDetectionFilter_${this.svgId})`;
    if (filterList && !filterList.includes(filterString)) {
      this.svg.style.filter += ` ${filterString}`;
    } else if (!filterList) {
      this.svg.style.filter = filterString;
    }
  }

  applyColorOverlayEffect(overlayColor: string) {
    if (!this.svg) return;

    let filter = this.svg.querySelector(
      "#fgSvgColorOverlayFilter_" + this.svgId
    );
    if (!filter) {
      filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute("id", "fgSvgColorOverlayFilter_" + this.svgId);

      const feFlood = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feFlood"
      );
      feFlood.setAttribute("flood-color", overlayColor);
      feFlood.setAttribute("result", "flood");
      feFlood.setAttribute("id", "fgSvgFeFlood_" + this.svgId);

      const feComposite1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feComposite"
      );
      feComposite1.setAttribute("in2", "SourceAlpha");
      feComposite1.setAttribute("operator", "in");
      feComposite1.setAttribute("result", "overlay");

      const feComposite2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feComposite"
      );
      feComposite2.setAttribute("in", "overlay");
      feComposite2.setAttribute("in2", "SourceGraphic");
      feComposite2.setAttribute("operator", "over");

      filter.appendChild(feFlood);
      filter.appendChild(feComposite1);
      filter.appendChild(feComposite2);
      this.svg.appendChild(filter);
    } else {
      // Update existing filter
      const feFlood = filter.querySelector("#fgSvgFeFlood_" + this.svgId);
      if (feFlood) {
        feFlood.setAttribute("flood-color", overlayColor);
      }
    }

    const filterList = this.svg.style.filter.split(/\s+/);
    const filterString = `url(#fgSvgColorOverlayFilter_${this.svgId})`;
    if (filterList && !filterList.includes(filterString)) {
      this.svg.style.filter += ` ${filterString}`;
    } else if (!filterList) {
      this.svg.style.filter = filterString;
    }
  }

  applyNeonGlowEffect(neonColor: string) {
    if (!this.svg) return;

    let filter = this.svg.querySelector("#fgSvgNeonGlowFilter_" + this.svgId);
    if (!filter) {
      filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute("id", "fgSvgNeonGlowFilter_" + this.svgId);

      const feGaussianBlur = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feGaussianBlur"
      );
      feGaussianBlur.setAttribute("in", "SourceAlpha");
      feGaussianBlur.setAttribute("stdDeviation", "3");
      feGaussianBlur.setAttribute("result", "blurred");

      const feFlood = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feFlood"
      );
      feFlood.setAttribute("flood-color", neonColor);
      feFlood.setAttribute("result", "glowColor");
      feFlood.setAttribute("id", "fgSvgFeNeonFlood_" + this.svgId);

      const feComposite1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feComposite"
      );
      feComposite1.setAttribute("in", "glowColor");
      feComposite1.setAttribute("in2", "blurred");
      feComposite1.setAttribute("operator", "in");
      feComposite1.setAttribute("result", "glow");

      const feComposite2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feComposite"
      );
      feComposite2.setAttribute("in", "SourceGraphic");
      feComposite2.setAttribute("in2", "glow");
      feComposite2.setAttribute("operator", "over");

      filter.appendChild(feGaussianBlur);
      filter.appendChild(feFlood);
      filter.appendChild(feComposite1);
      filter.appendChild(feComposite2);

      this.svg.appendChild(filter);
    } else {
      // Update existing filter
      const feFlood = filter.querySelector("#fgSvgFeNeonFlood_" + this.svgId);
      if (feFlood) {
        feFlood.setAttribute("flood-color", neonColor);
      }
    }

    const filterList = this.svg.style.filter.split(/\s+/);
    const filterString = `url(#fgSvgNeonGlowFilter_${this.svgId})`;
    if (filterList && !filterList.includes(filterString)) {
      this.svg.style.filter += ` ${filterString}`;
    } else if (!filterList) {
      this.svg.style.filter = filterString;
    }
  }

  applyCrackedGlassEffect(density: string, detail: string, strength: string) {
    if (!this.svg) return;

    let filter = this.svg.querySelector(
      "#fgSvgCrackedGlassFilter_" + this.svgId
    );
    if (!filter) {
      filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute("id", "fgSvgCrackedGlassFilter_" + this.svgId);

      const feTurbulence = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feTurbulence"
      );
      feTurbulence.setAttribute("type", "fractalNoise");
      feTurbulence.setAttribute("baseFrequency", density);
      feTurbulence.setAttribute("numOctaves", `${parseInt(detail)}`);
      feTurbulence.setAttribute("result", "turbulence");
      feTurbulence.setAttribute("id", "fgSvgFeCrackedTurbulence_" + this.svgId);

      const feDisplacementMap = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feDisplacementMap"
      );
      feDisplacementMap.setAttribute("in", "SourceGraphic");
      feDisplacementMap.setAttribute("in2", "turbulence");
      feDisplacementMap.setAttribute("scale", strength);
      feDisplacementMap.setAttribute(
        "id",
        "fgSvgFeCrackedDisplacement_" + this.svgId
      );

      filter.appendChild(feTurbulence);
      filter.appendChild(feDisplacementMap);

      this.svg.appendChild(filter);
    } else {
      // Update existing filter
      const feTurbulence = filter.querySelector(
        "#fgSvgFeCrackedTurbulence_" + this.svgId
      );
      if (feTurbulence) {
        feTurbulence.setAttribute("baseFrequency", density);
        feTurbulence.setAttribute("numOctaves", `${parseInt(detail)}`);
      }
      const feDisplacementMap = filter.querySelector(
        "#fgSvgFeCrackedDisplacement_" + this.svgId
      );
      if (feDisplacementMap) {
        feDisplacementMap.setAttribute("scale", strength);
      }
    }

    const filterList = this.svg.style.filter.split(/\s+/);
    const filterString = `url(#fgSvgCrackedGlassFilter_${this.svgId})`;
    if (filterList && !filterList.includes(filterString)) {
      this.svg.style.filter += ` ${filterString}`;
    } else if (!filterList) {
      this.svg.style.filter = filterString;
    }
  }

  applyWaveDistortionEffect(frequency: string, strength: string) {
    if (!this.svg) return;

    let filter = this.svg.querySelector(
      "#fgSvgWaveDistortionFilter_" + this.svgId
    );

    if (!filter) {
      filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute("id", "fgSvgWaveDistortionFilter_" + this.svgId);

      const feTurbulence = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feTurbulence"
      );
      feTurbulence.setAttribute("type", "fractalNoise");
      feTurbulence.setAttribute("baseFrequency", frequency);
      feTurbulence.setAttribute("result", "turbulence");

      const feDisplacementMap = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feDisplacementMap"
      );
      feDisplacementMap.setAttribute("in", "SourceGraphic");
      feDisplacementMap.setAttribute("in2", "turbulence");
      feDisplacementMap.setAttribute("scale", strength);

      filter.appendChild(feTurbulence);
      filter.appendChild(feDisplacementMap);

      this.svg.appendChild(filter);
    } else {
      const feTurbulence = filter.querySelector("feTurbulence");
      const feDisplacementMap = filter.querySelector("feDisplacementMap");

      if (feTurbulence) feTurbulence.setAttribute("baseFrequency", frequency);
      if (feDisplacementMap) feDisplacementMap.setAttribute("scale", strength);
    }

    let filterList = this.svg.style.filter.split(/\s+/);
    const filterString = `url(#fgSvgWaveDistortionFilter_${this.svgId})`;
    if (filterList && !filterList.includes(filterString)) {
      this.svg.style.filter += ` ${filterString}`;
    } else if (!filterList) {
      this.svg.style.filter = filterString;
    }
  }

  removeEffect(id: string) {
    if (!this.svg) return;

    let filter = this.svg.querySelector(id);
    if (filter) {
      filter.remove();
    }

    let currentFilter = this.svg.style.filter;
    if (currentFilter && currentFilter.includes(`url("${id}")`)) {
      this.svg.style.filter = currentFilter
        .split(/\s+/)
        .filter((filter) => filter !== `url("${id}")`)
        .join(" ")
        .trim();
    }
  }

  setPathColor = (color: string) => {
    if (!this.svg) return;
    const paths = this.svg.querySelectorAll("path");
    paths.forEach((path) => {
      path.setAttribute("fill", color);
      path.setAttribute("stroke", color);
    });
  };

  setBackgroundColor = (color: string) => {
    if (this.svg) this.svg.style.backgroundColor = color;
  };

  getPathColor = () => {
    if (!this.svg) return undefined;

    const paths = this.svg.querySelectorAll("path");
    for (let path of paths) {
      const strokeColor = path.getAttribute("stroke");
      const fillColor = path.getAttribute("fill");

      if (strokeColor) {
        return strokeColor;
      }
      if (fillColor) {
        return fillColor;
      }
    }
    return undefined;
  };

  getBackgroundColor = () => {
    return this.svg?.style.backgroundColor;
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
    compression: DownloadCompressionTypes
  ) => {
    if (!this.svg) {
      console.error("SVG element is not available.");
      return;
    }

    // Serialize SVG to a string
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(this.svg);

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
            `downloaded-vector-image.${mimeType}.zip`
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
    if (!this.svg) {
      console.error("SVG element is not available.");
      return;
    }

    // Serialize the SVG to a string
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(this.svg);

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

  private getSvgAspectRatio = () => {
    if (!this.svg) {
      return undefined;
    }

    const viewBox = this.svg.getAttribute("viewBox");
    if (viewBox) {
      const [, , width, height] = viewBox.split(" ").map(Number);
      if (width > 0 && height > 0) {
        return width / height; // Aspect ratio (width / height)
      }
    }

    const width = parseFloat(this.svg.getAttribute("width") || "0");
    const height = parseFloat(this.svg.getAttribute("height") || "0");
    if (width > 0 && height > 0) {
      return width / height;
    }

    try {
      const bbox = this.svg.getBBox();
      if (bbox.width > 0 && bbox.height > 0) {
        return bbox.width / bbox.height;
      }
    } catch (e) {}

    return undefined;
  };

  setSvgfromString = (svgString: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const svgElement = doc.querySelector("svg");

    if (svgElement) {
      this.svg = svgElement;
    }
  };
}

export default SvgMedia;
