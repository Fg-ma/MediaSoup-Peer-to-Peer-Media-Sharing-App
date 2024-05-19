import React, { useEffect, useRef } from "react";
import "./FgVideoStyles.css";
import VolumeSection from "./VolumeSection";

export default function FgVideo({
  autoPlay = false,
  primaryVolumeSliderColor,
  secondaryVolumeSliderColor,
}: {
  autoPlay?: boolean;
  primaryVolumeSliderColor?: string;
  secondaryVolumeSliderColor?: string;
}) {
  const paused = useRef(!autoPlay);
  const theater = useRef(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentTimeRef = useRef<HTMLDivElement>(null);
  const volumeSliderRef = useRef<HTMLInputElement>(null);
  const totalTimeRef = useRef<HTMLDivElement>(null);
  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);
  const leaveVideoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playbackSpeedButtonRef = useRef<HTMLButtonElement>(null);
  let captions: TextTrack | undefined;

  useEffect(() => {
    // Set initial time
    timeUpdate();

    // Get captions and set them to hidden initially
    if (videoRef.current) {
      captions = videoRef.current.textTracks[0];
      captions.mode = "hidden";
    }

    document.addEventListener("fullscreenchange", handlerFullscreenChange);

    document.addEventListener("keydown", handleKeyDown);

    document.addEventListener("keyup", handleKeyUp);

    videoRef.current?.addEventListener("loadeddata", loadedData);

    videoRef.current?.addEventListener("timeupdate", timeUpdate);

    videoContainerRef.current?.addEventListener("mouseenter", handleMouseEnter);

    videoContainerRef.current?.addEventListener("mouseleave", handleMouseLeave);

    videoRef.current?.addEventListener("enterpictureinpicture", () =>
      handlerPictureInPicture("enter")
    );

    videoRef.current?.addEventListener("leavepictureinpicture", () =>
      handlerPictureInPicture("leave")
    );

    return () => {
      document.removeEventListener("fullscreenchange", handlerFullscreenChange);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      videoRef.current?.removeEventListener("loadeddata", loadedData);
      videoRef.current?.removeEventListener("timeupdate", timeUpdate);
      videoContainerRef.current?.removeEventListener(
        "mouseenter",
        handleMouseEnter
      );
      videoContainerRef.current?.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );
      videoRef.current?.removeEventListener("enterpictureinpicture", () =>
        handlerPictureInPicture("enter")
      );
      videoRef.current?.removeEventListener("leavepictureinpicture", () =>
        handlerPictureInPicture("leave")
      );
    };
  }, []);

  const handleKeyUp = (event: any) => {
    switch (event.key.toLowerCase()) {
      case "shift":
        shiftPressed.current = false;
        break;
      case "control":
        controlPressed.current = false;
        break;
    }
  };

  const handleKeyDown = (event: any) => {
    if (!videoContainerRef.current?.classList.contains("in-video")) return;
    const tagName = document.activeElement?.tagName.toLowerCase();
    if (tagName === "input") return;
    if (controlPressed.current || shiftPressed.current) return;

    switch (event.key.toLowerCase()) {
      case " ":
        if (tagName === "button") return;
        handlePausePlay();
        break;
      case "mediaplaypause":
        handlePausePlay();
        break;
      case "k":
        handlePausePlay();
        break;
      case "f":
        handleFullScreen();
        break;
      case "t":
        handleTheater();
        break;
      case "i":
        handleMiniPlayer();
        break;
      case "m":
        handleMute();
        break;
      case "arrowleft":
        skip(-10);
        break;
      case "j":
        skip(-10);
        break;
      case "arrowright":
        skip(10);
        break;
      case "k":
        skip(10);
        break;
      case "c":
        handleClosedCaptions();
        break;
      case "shift":
        shiftPressed.current = true;
        break;
      case "control":
        controlPressed.current = true;
        break;
      default:
        break;
    }
  };

  const handlerFullscreenChange = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.classList.remove("full-screen");
    }
  };

  const handlerPictureInPicture = (action: string) => {
    if (action === "enter") {
      videoContainerRef.current?.classList.add("mini-player");
    } else if (action === "leave") {
      videoContainerRef.current?.classList.remove("mini-player");
    }
  };

  const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
  });

  const formatDuration = (time: number) => {
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor(time / 3600);
    if (hours === 0) {
      return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
    } else {
      return `${hours}:${leadingZeroFormatter.format(
        minutes
      )}:${leadingZeroFormatter.format(seconds)}`;
    }
  };

  const loadedData = () => {
    if (totalTimeRef.current && videoRef.current) {
      totalTimeRef.current.textContent = formatDuration(
        videoRef.current.duration
      );
    }
  };

  const timeUpdate = () => {
    if (currentTimeRef.current && videoRef.current) {
      currentTimeRef.current.textContent = formatDuration(
        videoRef.current.currentTime
      );
    }
  };

  const handleMouseEnter = () => {
    videoContainerRef.current?.classList.add("in-video");
    if (leaveVideoTimer.current) {
      clearTimeout(leaveVideoTimer.current);
      leaveVideoTimer.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (videoContainerRef.current?.classList.contains("paused")) return;
    leaveVideoTimer.current = setTimeout(() => {
      videoContainerRef.current?.classList.remove("in-video");
    }, 1250);
  };

  const handlePausePlay = () => {
    paused.current = !paused.current;
    if (paused.current) {
      videoRef.current?.pause();
      videoContainerRef.current?.classList.add("paused");
    } else {
      videoRef.current?.play();
      videoContainerRef.current?.classList.remove("paused");
    }
  };

  const handleFullScreen = () => {
    if (videoContainerRef.current?.classList.contains("full-screen")) {
      videoContainerRef.current?.classList.remove("full-screen");
      document.exitFullscreen();
    } else {
      videoContainerRef.current?.classList.add("full-screen");
      videoContainerRef.current?.requestFullscreen();
    }
  };

  const handleTheater = () => {
    theater.current = !theater.current;
    if (theater.current) {
      videoContainerRef.current?.classList.add("theater");
    } else {
      videoContainerRef.current?.classList.remove("theater");
    }
  };

  const handleMiniPlayer = () => {
    if (videoContainerRef.current?.classList.contains("mini-player")) {
      document.exitPictureInPicture();
    } else {
      videoRef.current?.requestPictureInPicture();
    }
  };

  const skip = (duration: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += duration;
    }
  };

  const handleMute = () => {
    if (videoRef.current && volumeSliderRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      if (videoRef.current.muted) {
        volumeSliderRef.current.value = "0";
      }
    }
  };

  const handleClosedCaptions = () => {
    if (captions) {
      const isHidden = captions.mode === "hidden";
      captions.mode = isHidden ? "showing" : "hidden";
      videoContainerRef.current?.classList.toggle("captions", isHidden);
    }
  };

  const handlePlaybackSpeed = () => {
    if (!videoRef.current || !playbackSpeedButtonRef.current) return;

    const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
    const currentPlaybackRateIndex = playbackRates.findIndex(
      (rate) => rate === videoRef.current?.playbackRate
    );

    const nextPlaybackRateIndex =
      (currentPlaybackRateIndex + 1) % playbackRates.length;

    videoRef.current.playbackRate = playbackRates[nextPlaybackRateIndex];
    playbackSpeedButtonRef.current.textContent = `${playbackRates[nextPlaybackRateIndex]}x`;
  };

  return (
    <div
      ref={videoContainerRef}
      className={`video-container ${
        autoPlay ? "" : "paused"
      } relative overflow-hidden flex items-center justify-center text-white font-K2D rounded-md`}
    >
      <video
        ref={videoRef}
        onClick={handlePausePlay}
        className='main-video w-full z-0'
        src='./24.mp4'
        controls={false}
        autoPlay={autoPlay}
      >
        <track
          kind='captions'
          srcLang='eng'
          src='./subtitles.vtt'
          default
        ></track>
      </video>
      <div className='timeline-container absolute bottom-11 w-full z-20'>
        <img className='thumbnail-img' />
        <div className='timeline'>
          <img className='preview-img' />
          <div className='thumb-indicator'></div>
        </div>
      </div>
      <div className='video-controls-container absolute bottom-0 w-full h-max flex-col items-end justify-center z-20'>
        <div className='video-controls w-full h-10 flex items-center pl-2 pr-4 pb-3 space-x-2'>
          <button
            onClick={handlePausePlay}
            className='flex items-center justify-center w-10 aspect-square'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              height='36px'
              viewBox='0 -960 960 960'
              width='36px'
              fill='white'
              className='play-icon'
            >
              <path d='M320-273v-414q0-17 12-28.5t28-11.5q5 0 10.5 1.5T381-721l326 207q9 6 13.5 15t4.5 19q0 10-4.5 19T707-446L381-239q-5 3-10.5 4.5T360-233q-16 0-28-11.5T320-273Z' />
            </svg>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              height='36px'
              viewBox='0 -960 960 960'
              width='36px'
              fill='white'
              className='pause-icon'
            >
              <path d='M640-200q-33 0-56.5-23.5T560-280v-400q0-33 23.5-56.5T640-760q33 0 56.5 23.5T720-680v400q0 33-23.5 56.5T640-200Zm-320 0q-33 0-56.5-23.5T240-280v-400q0-33 23.5-56.5T320-760q33 0 56.5 23.5T400-680v400q0 33-23.5 56.5T320-200Z' />
            </svg>
          </button>
          <VolumeSection
            videoRef={videoRef}
            volumeSliderRef={volumeSliderRef}
            handleMute={handleMute}
            primaryVolumeSliderColor={primaryVolumeSliderColor}
            secondaryVolumeSliderColor={secondaryVolumeSliderColor}
          />
          <div className='duration-container flex items-center gap-1 grow'>
            <div ref={currentTimeRef} className='current-time'></div>/
            <div ref={totalTimeRef} className='total-time'></div>
          </div>
          <button
            ref={playbackSpeedButtonRef}
            onClick={handlePlaybackSpeed}
            className='playback-speed-button wide-button text-lg'
          >
            1x
          </button>
          <button
            onClick={handleClosedCaptions}
            className='caption-button flex-col items-center justify-center'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              height='36px'
              viewBox='0 -960 960 960'
              width='36px'
              fill='white'
            >
              <path d='M200-160q-33 0-56.5-23.5T120-240v-480q0-33 23.5-56.5T200-800h560q33 0 56.5 23.5T840-720v480q0 33-23.5 56.5T760-160H200Zm80-200h120q17 0 28.5-11.5T440-400v-20q0-9-6-15t-15-6h-18q-9 0-15 6t-6 15h-80v-120h80q0 9 6 15t15 6h18q9 0 15-6t6-15v-20q0-17-11.5-28.5T400-600H280q-17 0-28.5 11.5T240-560v160q0 17 11.5 28.5T280-360Zm400-240H560q-17 0-28.5 11.5T520-560v160q0 17 11.5 28.5T560-360h120q17 0 28.5-11.5T720-400v-20q0-9-6-15t-15-6h-18q-9 0-15 6t-6 15h-80v-120h80q0 9 6 15t15 6h18q9 0 15-6t6-15v-20q0-17-11.5-28.5T680-600Z' />
            </svg>
            <div className='caption-button-underline'></div>
          </button>
          <button
            onClick={handleMiniPlayer}
            className='flex items-center justify-center'
          >
            <div className='mini-player-icon h-9 w-9 flex items-center justify-center'>
              <div className='border-3 border-white w-8 h-6.5 rounded-md flex justify-end items-end'>
                <div className='bg-white w-3 h-2 rounded-sm mr-0.5 mb-0.5'></div>
              </div>
            </div>
            <div className='exit-mini-player-icon h-9 w-9 flex items-center justify-center'>
              <div className='border-3 border-white w-8 h-6.5 rounded-md flex justify-start items-start'>
                <div className='bg-white w-3 h-2 rounded-sm ml-0.5 mt-0.5'></div>
              </div>
            </div>
          </button>
          <button
            onClick={handleTheater}
            className='flex items-center justify-center'
          >
            <div className='theater-icon h-9 w-9 flex items-center justify-center'>
              <div className='border-3 border-white w-8 h-6 rounded-md'></div>
            </div>
            <div className='exit-theater-icon h-9 w-9 flex items-center justify-center'>
              <div className='border-3 border-white w-8 h-4 rounded-md'></div>
            </div>
          </button>
          <button
            onClick={handleFullScreen}
            className='flex items-center justify-center'
          >
            <svg
              className='full-screen-icon'
              xmlns='http://www.w3.org/2000/svg'
              height='36px'
              viewBox='0 -960 960 960'
              width='36px'
              fill='white'
            >
              <path d='M200-200h80q17 0 28.5 11.5T320-160q0 17-11.5 28.5T280-120H160q-17 0-28.5-11.5T120-160v-120q0-17 11.5-28.5T160-320q17 0 28.5 11.5T200-280v80Zm560 0v-80q0-17 11.5-28.5T800-320q17 0 28.5 11.5T840-280v120q0 17-11.5 28.5T800-120H680q-17 0-28.5-11.5T640-160q0-17 11.5-28.5T680-200h80ZM200-760v80q0 17-11.5 28.5T160-640q-17 0-28.5-11.5T120-680v-120q0-17 11.5-28.5T160-840h120q17 0 28.5 11.5T320-800q0 17-11.5 28.5T280-760h-80Zm560 0h-80q-17 0-28.5-11.5T640-800q0-17 11.5-28.5T680-840h120q17 0 28.5 11.5T840-800v120q0 17-11.5 28.5T800-640q-17 0-28.5-11.5T760-680v-80Z' />
            </svg>
            <svg
              className='exit-full-screen-icon'
              xmlns='http://www.w3.org/2000/svg'
              height='36px'
              viewBox='0 -960 960 960'
              width='36px'
              fill='white'
            >
              <path d='M240-240h-80q-17 0-28.5-11.5T120-280q0-17 11.5-28.5T160-320h120q17 0 28.5 11.5T320-280v120q0 17-11.5 28.5T280-120q-17 0-28.5-11.5T240-160v-80Zm480 0v80q0 17-11.5 28.5T680-120q-17 0-28.5-11.5T640-160v-120q0-17 11.5-28.5T680-320h120q17 0 28.5 11.5T840-280q0 17-11.5 28.5T800-240h-80ZM240-720v-80q0-17 11.5-28.5T280-840q17 0 28.5 11.5T320-800v120q0 17-11.5 28.5T280-640H160q-17 0-28.5-11.5T120-680q0-17 11.5-28.5T160-720h80Zm480 0h80q17 0 28.5 11.5T840-680q0 17-11.5 28.5T800-640H680q-17 0-28.5-11.5T640-680v-120q0-17 11.5-28.5T680-840q17 0 28.5 11.5T720-800v80Z' />
            </svg>
          </button>
        </div>
      </div>
      <div
        className='controls-gradient absolute bottom-0 w-full h-14 z-10'
        style={{
          background: `linear-gradient(to top, rgba(0, 0, 0, .75) -10%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 0, 0, 0) 100%)`,
        }}
      ></div>
    </div>
  );
}
