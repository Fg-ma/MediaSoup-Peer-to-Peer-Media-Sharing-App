import TableSocketController from "../../../serverControllers/tableServer/TableSocketController";
import {
  ContentTypes,
  TableReactions,
  TableReactionStyles,
} from "../../../../../universal/typeConstant";
import { reactionsMeta } from "./typeConstant";

class ReactController {
  constructor(
    private contentId: string,
    private contentType: ContentTypes,
    private behindEffectsContainerRef: React.RefObject<HTMLDivElement>,
    private frontEffectsContainerRef: React.RefObject<HTMLDivElement>,
    private tableSocket: React.MutableRefObject<
      TableSocketController | undefined
    >
  ) {}

  handleReaction = (
    reaction: TableReactions,
    broadcast: boolean = true,
    reactionStyle?: TableReactionStyles
  ) => {
    const reactionSrc = reactionsMeta[reaction].src;

    const actions: {
      [tableReactionStyle in TableReactionStyles]: (reaction: string) => void;
    } = {
      expand: this.expandReaction,
      expandRotate: this.expandRotateReaction,
      explodeAbove: this.explodeAboveReaction,
      explodeBelow: this.explodeBelowReaction,
      peakingAroundTheCorner: this.peakingAroundTheCornerReaction,
    };

    if (reactionStyle) {
      actions[reactionStyle].call(this, reactionSrc);

      if (broadcast) {
        this.tableSocket.current?.reaction(
          this.contentType,
          this.contentId,
          reaction,
          reactionStyle
        );
      }
    } else {
      const randomAction =
        Object.entries(actions)[
          Math.floor(Math.random() * Object.keys(actions).length)
        ];
      randomAction[1].call(this, reactionSrc);

      if (broadcast) {
        this.tableSocket.current?.reaction(
          this.contentType,
          this.contentId,
          reaction,
          randomAction[0] as TableReactionStyles
        );
      }
    }
  };

  private expandReaction = (reaction: string) => {
    if (!this.frontEffectsContainerRef.current) return;

    this.frontEffectsContainerRef.current.style.zIndex = "100";

    // Number of particles
    const particle = document.createElement("div");
    particle.classList.add("expanding-reaction-particle");
    particle.style.backgroundImage = `url(${reaction})`;

    particle.style.width = `${
      Math.min(
        this.frontEffectsContainerRef.current.clientWidth,
        this.frontEffectsContainerRef.current.clientHeight
      ) / 12
    }px`;
    this.frontEffectsContainerRef.current.appendChild(particle);

    // Remove particle after animation
    setTimeout(() => {
      particle.remove();
    }, 1250);
  };

  private expandRotateReaction = (reaction: string) => {
    if (!this.frontEffectsContainerRef.current) return;

    this.frontEffectsContainerRef.current.style.zIndex = "100";

    // Number of particles
    const particle = document.createElement("div");
    particle.classList.add("expanding-rotating-reaction-particle");
    particle.style.backgroundImage = `url(${reaction})`;

    particle.style.width = `${
      Math.min(
        this.frontEffectsContainerRef.current.clientWidth,
        this.frontEffectsContainerRef.current.clientHeight
      ) / 12
    }px`;
    this.frontEffectsContainerRef.current.appendChild(particle);

    // Remove particle after animation
    setTimeout(() => {
      particle.remove();
    }, 1250);
  };

  private explodeAboveReaction = (reaction: string) => {
    if (!this.frontEffectsContainerRef.current) return;

    for (let i = 0; i < 40; i++) {
      // Number of particles
      const particle = document.createElement("div");
      particle.classList.add("exploding-reaction-particle");
      particle.style.backgroundImage = `url(${reaction})`;

      // Random position and movement
      const angle = Math.random() * Math.PI * 2;
      const distance =
        (Math.random() *
          Math.min(
            this.frontEffectsContainerRef.current.clientWidth,
            this.frontEffectsContainerRef.current.clientHeight
          )) /
        1.5;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const size = Math.max(15, Math.random() * 50);
      const rotation = Math.random() * 360;

      particle.style.setProperty("--x", `calc(${x}px - 50%)`);
      particle.style.setProperty("--y", `calc(${y}px - 50%)`);

      particle.style.width = `${size}px`;
      particle.style.rotate = `${rotation}deg`;
      this.frontEffectsContainerRef.current.appendChild(particle);

      // Remove particle after animation
      setTimeout(() => {
        particle.remove();
      }, 1250);
    }
  };

  private explodeBelowReaction = (reaction: string) => {
    if (
      !this.frontEffectsContainerRef.current ||
      !this.behindEffectsContainerRef.current
    )
      return;

    for (let i = 0; i < 40; i++) {
      // Number of particles
      const particle = document.createElement("div");
      particle.classList.add("exploding-reaction-particle");
      particle.style.backgroundImage = `url(${reaction})`;

      // Random position and movement
      const angle = Math.random() * Math.PI * 2;
      const distance =
        Math.random() *
        Math.min(
          this.frontEffectsContainerRef.current.clientWidth,
          this.frontEffectsContainerRef.current.clientHeight
        );
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const size = Math.max(15, Math.random() * 50);
      const rotation = Math.random() * 360;

      particle.style.setProperty("--x", `calc(${x}px - 50%)`);
      particle.style.setProperty("--y", `calc(${y}px - 50%)`);

      particle.style.width = `${size}px`;
      particle.style.rotate = `${rotation}deg`;
      this.behindEffectsContainerRef.current.appendChild(particle);

      // Remove particle after animation
      setTimeout(() => {
        particle.remove();
      }, 1250);
    }
  };

  private peakingAroundTheCornerReaction = (reaction: string) => {
    if (!this.behindEffectsContainerRef.current) return;

    const particle = document.createElement("div");
    particle.classList.add("hiding-reaction-particle");
    particle.style.backgroundImage = `url(${reaction})`;

    particle.style.width = `${
      Math.min(
        this.behindEffectsContainerRef.current.clientWidth,
        this.behindEffectsContainerRef.current.clientHeight
      ) / 1.5
    }px`;
    this.behindEffectsContainerRef.current.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 1250);
  };
}

export default ReactController;
