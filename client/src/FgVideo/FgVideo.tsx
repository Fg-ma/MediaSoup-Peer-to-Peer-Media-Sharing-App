import React, { useEffect, useRef, useState } from "react";
import "./FgVideoStyles.css";
import VolumeSection from "./VolumeSection";

export default function FgVideo({
  videoStream,
  audioStream,
  isStream = false,
  id,
  videoStyles,
  autoPlay = true,
  muted = false,
  flipVideo = false,
  primaryVolumeSliderColor,
  secondaryVolumeSliderColor,
  skipIncrement = 10,
  initialProgressPosition = 0,
  controlsVanishTime = 1250,
  timelineBackgroundColor = "rgba(150, 150, 150, 0.5)",
  closedCaptionsCecoratorColor = "rgba(30, 30, 30, 0.6)",
  timelinePrimaryBackgroundColor = "#f56114",
  timelineSecondaryBackgroundColor = "rgb(150, 150, 150)",
  primaryVideoColor = "#f56114",
  isPlayPause = true,
  isVolume = true,
  isCurrentTime = true,
  isTotalTime = true,
  isPlaybackSpeed = true,
  isClosedCaptions = true,
  isPictureInPicture = true,
  isTheater = true,
  isFullScreen = true,
  isTimeLine = true,
  isSkip = true,
  isThumbnail = true,
  isPreview = true,
}: {
  videoStream?: MediaStream;
  audioStream?: MediaStream;
  isStream?: boolean;
  id?: string;
  videoStyles?: {};
  autoPlay?: boolean;
  muted?: boolean;
  flipVideo?: boolean;
  primaryVolumeSliderColor?: string;
  secondaryVolumeSliderColor?: string;
  skipIncrement?: number;
  initialProgressPosition?: number;
  controlsVanishTime?: number;
  timelineBackgroundColor?: string;
  closedCaptionsCecoratorColor?: string;
  timelinePrimaryBackgroundColor?: string;
  timelineSecondaryBackgroundColor?: string;
  primaryVideoColor?: string;
  isPlayPause?: boolean;
  isVolume?: boolean;
  isCurrentTime?: boolean;
  isTotalTime?: boolean;
  isPlaybackSpeed?: boolean;
  isClosedCaptions?: boolean;
  isPictureInPicture?: boolean;
  isTheater?: boolean;
  isFullScreen?: boolean;
  isTimeLine?: boolean;
  isSkip?: boolean;
  isThumbnail?: boolean;
  isPreview?: boolean;
}) {
  const paused = useRef(!autoPlay);
  const theater = useRef(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentTimeRef = useRef<HTMLDivElement>(null);
  const volumeSliderRef = useRef<HTMLInputElement>(null);
  const totalTimeRef = useRef<HTMLDivElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const previewImgRef = useRef<HTMLImageElement>(null);
  const thumbnailImgRef = useRef<HTMLImageElement>(null);
  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);
  const isScrubbing = useRef(false);
  const wasPaused = useRef(false);
  const leaveVideoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playbackSpeedButtonRef = useRef<HTMLButtonElement>(null);
  const captions = useRef<TextTrack | undefined>();
  const thumbnails = useRef<string[]>([]);

  const init = () => {
    if (videoRef.current && isStream) {
      const combinedStream = new MediaStream();

      if (videoStream) {
        videoStream
          .getVideoTracks()
          .forEach((track) => combinedStream.addTrack(track));
      }

      if (audioStream && !muted) {
        audioStream
          .getAudioTracks()
          .forEach((track) => combinedStream.addTrack(track));
      }

      videoRef.current.srcObject = combinedStream;
    }

    // Get captions and set them to hidden initially
    if (videoRef.current && videoRef.current.textTracks[0]) {
      captions.current = videoRef.current.textTracks[0];
      captions.current.mode = "hidden";
    }

    // Set the initial progress position
    if (timelineContainerRef.current) {
      timelineContainerRef.current.style.setProperty(
        "--progress-position",
        `${initialProgressPosition}`
      );
    }

    // Set the initial current time
    if (currentTimeRef.current) {
      currentTimeRef.current.textContent = formatDuration(
        initialProgressPosition
      );
    }

    // Set the video current time
    if (videoRef.current) {
      videoRef.current.currentTime = initialProgressPosition;
    }

    videoContainerRef.current?.style.setProperty(
      "--timeline-background-color",
      `${timelineBackgroundColor}`
    );
    videoContainerRef.current?.style.setProperty(
      "--closed-captions-decorator-color",
      `${closedCaptionsCecoratorColor}`
    );
    videoContainerRef.current?.style.setProperty(
      "--timeline-primary-background-color",
      `${timelinePrimaryBackgroundColor}`
    );
    videoContainerRef.current?.style.setProperty(
      "--timeline-secondary-background-color",
      `${timelineSecondaryBackgroundColor}`
    );
    videoContainerRef.current?.style.setProperty(
      "--primary-video-color",
      `${primaryVideoColor}`
    );
    videoContainerRef.current?.style.setProperty(
      "--flip-video",
      `${flipVideo ? -1 : 1}`
    );
  };

  useEffect(() => {
    // Set up initial conditions
    init();

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    document.addEventListener("keydown", handleKeyDown);

    document.addEventListener("keyup", handleKeyUp);

    videoRef.current?.addEventListener("loadeddata", loadedData);

    videoRef.current?.addEventListener("timeupdate", timeUpdate);

    videoContainerRef.current?.addEventListener("mouseenter", handleMouseEnter);

    videoContainerRef.current?.addEventListener("mouseleave", handleMouseLeave);

    timelineContainerRef.current?.addEventListener(
      "mousemove",
      handleTimelineUpdate
    );

    timelineContainerRef.current?.addEventListener(
      "mousedown",
      handleScrubbing
    );

    document.addEventListener("mouseup", (e) => {
      if (isScrubbing.current) handleScrubbing(e);
    });

    document.addEventListener("mousemove", (e) => {
      if (isScrubbing.current) handleTimelineUpdate(e);
    });

    videoRef.current?.addEventListener("enterpictureinpicture", () =>
      handlePictureInPicture("enter")
    );

    videoRef.current?.addEventListener("leavepictureinpicture", () =>
      handlePictureInPicture("leave")
    );

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
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
      timelineContainerRef.current?.removeEventListener(
        "mousemove",
        handleTimelineUpdate
      );
      timelineContainerRef.current?.removeEventListener(
        "mousedown",
        handleScrubbing
      );

      document.removeEventListener("mouseup", (e) => {
        if (isScrubbing.current) handleScrubbing(e);
      });

      document.removeEventListener("mousemove", (e) => {
        if (isScrubbing.current) handleTimelineUpdate(e);
      });
      videoRef.current?.removeEventListener("enterpictureinpicture", () =>
        handlePictureInPicture("enter")
      );
      videoRef.current?.removeEventListener("leavepictureinpicture", () =>
        handlePictureInPicture("leave")
      );
    };
  }, [videoStream, audioStream]);

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
      case "shift":
        shiftPressed.current = true;
        break;
      case "control":
        controlPressed.current = true;
        break;
      case " ":
        if (tagName === "button") return;
        if (isPlayPause) {
          handlePausePlay();
        }
        break;
      case "mediaplaypause":
        if (isPlayPause) {
          handlePausePlay();
        }
        break;
      case "k":
        if (isPlayPause) {
          handlePausePlay();
        }
        break;
      case "f":
        if (isFullScreen) {
          handleFullScreen();
        }
        break;
      case "t":
        if (isTheater) {
          handleTheater();
        }
        break;
      case "i":
        if (isPictureInPicture) {
          handleMiniPlayer();
        }
        break;
      case "m":
        if (isVolume) {
          handleMute();
        }
        break;
      case "arrowleft":
        if (isSkip) {
          skip(-skipIncrement);
        }
        break;
      case "j":
        if (isSkip) {
          skip(-skipIncrement);
        }
        break;
      case "arrowright":
        if (isSkip) {
          skip(skipIncrement);
        }
        break;
      case "k":
        if (isSkip) {
          skip(skipIncrement);
        }
        break;
      case "c":
        if (isClosedCaptions) {
          handleClosedCaptions();
        }
        break;
      default:
        break;
    }
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.classList.remove("full-screen");
    }
  };

  const handlePictureInPicture = (action: string) => {
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
    if (!videoRef.current) return;

    if (totalTimeRef.current) {
      totalTimeRef.current.textContent = formatDuration(
        videoRef.current.duration
      );
    }

    const loadThumbnails = async () => {
      if (videoRef.current) {
        const videoSrc = videoRef.current.src;
        const generatedThumbnails = await extractThumbnails(
          videoRef.current,
          videoSrc,
          10,
          5
        );
        thumbnails.current = generatedThumbnails;
      }
    };

    if (isTimeLine && (isPreview || isThumbnail)) {
      loadThumbnails();
    }
  };

  const timeUpdate = () => {
    if (!videoRef.current) return;

    if (currentTimeRef.current) {
      currentTimeRef.current.textContent = formatDuration(
        videoRef.current.currentTime
      );
    }
    const percent = videoRef.current.currentTime / videoRef.current.duration;
    if (timelineContainerRef.current) {
      timelineContainerRef.current.style.setProperty(
        "--progress-position",
        `${percent}`
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
    }, controlsVanishTime);
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
      document
        .exitFullscreen()
        .then(() => {
          videoContainerRef.current?.classList.remove("full-screen");
        })
        .catch((error) => {
          console.error("Failed to exit full screen:", error);
        });
    } else {
      videoContainerRef.current
        ?.requestFullscreen()
        .then(() => {
          videoContainerRef.current?.classList.add("full-screen");
        })
        .catch((error) => {
          console.error("Failed to request full screen:", error);
        });
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
      document.exitPictureInPicture().catch((error) => {
        console.error("Failed to exit picture in picture:", error);
      });
    } else {
      videoRef.current?.requestPictureInPicture().catch((error) => {
        console.error("Failed to request picture in picture:", error);
      });
    }
  };

  const skip = (duration: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += duration;
    }
  };

  const handleMute = () => {
    if (!videoRef.current) {
      return;
    }

    videoRef.current.muted = !videoRef.current.muted;
    if (videoRef.current.muted && volumeSliderRef.current) {
      volumeSliderRef.current.value = "0";
    }
  };

  const handleClosedCaptions = () => {
    if (captions.current) {
      const isHidden = captions.current.mode === "hidden";
      captions.current.mode = isHidden ? "showing" : "hidden";
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

  const handleScrubbing = (e: MouseEvent) => {
    if (
      !timelineContainerRef.current ||
      !videoRef.current ||
      !currentTimeRef.current
    )
      return;

    const rect = timelineContainerRef.current.getBoundingClientRect();
    const percent =
      Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;

    isScrubbing.current = (e.buttons & 1) === 1;
    videoContainerRef.current?.classList.toggle(
      "scrubbing",
      isScrubbing.current
    );
    if (isScrubbing.current) {
      videoContainerRef.current?.classList.add("scrubbing");
      wasPaused.current = videoRef.current.paused;
      videoRef.current.pause();
    } else {
      videoContainerRef.current?.classList.remove("scrubbing");
      videoRef.current.currentTime = percent * videoRef.current.duration;
      if (!wasPaused) videoRef.current.play();
    }

    handleTimelineUpdate(e);
  };

  const handleTimelineUpdate = (e: MouseEvent) => {
    if (
      !timelineContainerRef.current ||
      !videoRef.current ||
      !previewImgRef.current
    )
      return;

    const rect = timelineContainerRef.current.getBoundingClientRect();
    const percent =
      Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
    const previewImgIndex = Math.max(
      1,
      Math.floor((percent * videoRef.current.duration) / 10)
    );
    const previewImgSrc = thumbnails.current[previewImgIndex];
    previewImgRef.current.src = previewImgSrc;
    timelineContainerRef.current.style.setProperty(
      "--preview-position",
      `${percent}`
    );

    if (
      isScrubbing.current &&
      thumbnailImgRef.current &&
      currentTimeRef.current
    ) {
      e.preventDefault();
      thumbnailImgRef.current.src = previewImgSrc;
      timelineContainerRef.current.style.setProperty(
        "--progress-position",
        `${percent}`
      );

      currentTimeRef.current.textContent = formatDuration(
        percent * videoRef.current.duration
      );
    }
  };

  const extractThumbnails = async (
    video: HTMLVideoElement,
    videoSrc: string,
    interval: number,
    thumbnailClarity = 5
  ): Promise<string[]> => {
    const thumbnails: string[] = [];
    const offscreenVideo = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const videoAspectRatio = video.videoWidth / video.videoHeight;

    if (!ctx) throw new Error("Failed to get 2D context");

    offscreenVideo.src = videoSrc;
    offscreenVideo.crossOrigin = "anonymous";

    await new Promise<void>((resolve) => {
      offscreenVideo.onloadedmetadata = () => {
        resolve();
      };
    });

    const duration = offscreenVideo.duration;
    const thumbnailHeight = Math.max(video.videoHeight / thumbnailClarity, 90);
    const thumbnailWidth = Math.max(
      video.videoWidth / thumbnailClarity,
      90 * videoAspectRatio
    );

    for (let time = 0; time < duration; time += interval) {
      offscreenVideo.currentTime = time;

      await new Promise<void>((resolve) => {
        offscreenVideo.onseeked = () => {
          canvas.width = thumbnailWidth;
          canvas.height = thumbnailHeight;
          ctx.drawImage(offscreenVideo, 0, 0, thumbnailWidth, thumbnailHeight);
          const thumbnail = canvas.toDataURL("image/png");
          thumbnails.push(thumbnail);
          resolve();
        };
      });
    }

    return thumbnails;
  };

  return (
    <div
      ref={videoContainerRef}
      id={id}
      className={`video-container ${
        autoPlay ? "" : "paused"
      } relative overflow-hidden flex items-center justify-center text-white font-K2D rounded-md`}
    >
      {videoStream && (
        <>
          <video
            ref={videoRef}
            onClick={isPlayPause ? handlePausePlay : () => {}}
            className='main-video w-full z-0'
            controls={false}
            autoPlay={autoPlay}
            style={videoStyles}
          >
            {isClosedCaptions && (
              <track
                kind='captions'
                srcLang='eng'
                src='./subtitles.vtt'
                default
              ></track>
            )}
          </video>
          {isTimeLine && isThumbnail && (
            <img ref={thumbnailImgRef} className='thumbnail-img' />
          )}
          {isTimeLine && (
            <div ref={timelineContainerRef} className='timeline-container z-20'>
              <div className='timeline'>
                {isPreview && (
                  <img ref={previewImgRef} className='preview-img shadow-md' />
                )}
                <div className='thumb-indicator'></div>
              </div>
            </div>
          )}
          <div className='video-controls-container absolute bottom-0 w-full h-max flex-col items-end justify-center z-20'>
            <div className='video-controls w-full h-10 flex items-center space-x-2'>
              {isPlayPause && (
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
              )}
              {isVolume && (
                <VolumeSection
                  videoRef={videoRef}
                  volumeSliderRef={volumeSliderRef}
                  handleMute={handleMute}
                  primaryVolumeSliderColor={primaryVolumeSliderColor}
                  secondaryVolumeSliderColor={secondaryVolumeSliderColor}
                  isSlider={audioStream ? false : true}
                />
              )}
              <div className='duration-container flex items-center gap-1 grow'>
                {isCurrentTime && (
                  <div ref={currentTimeRef} className='current-time'></div>
                )}
                {isCurrentTime && isTotalTime && "/"}
                {isTotalTime && (
                  <div ref={totalTimeRef} className='total-time'></div>
                )}
              </div>
              {isPlaybackSpeed && (
                <button
                  ref={playbackSpeedButtonRef}
                  onClick={handlePlaybackSpeed}
                  className='playback-speed-button wide-button text-lg'
                >
                  1x
                </button>
              )}
              {isClosedCaptions && (
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
              )}
              {isPictureInPicture && (
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
              )}
              {isTheater && (
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
              )}
              {isFullScreen && (
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
              )}
            </div>
          </div>
          <div
            className='controls-gradient absolute bottom-0 w-full h-14 z-10'
            style={{
              background: `linear-gradient(to top, rgba(0, 0, 0, .75) -10%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 0, 0, 0) 100%)`,
            }}
          ></div>
        </>
      )}
      {!videoStream && audioStream && (
        <div>
          <video
            ref={videoRef}
            onClick={isPlayPause ? handlePausePlay : () => {}}
            className='main-video w-0 z-0'
            controls={false}
            autoPlay={autoPlay}
            style={videoStyles}
          >
            {isClosedCaptions && (
              <track
                kind='captions'
                srcLang='eng'
                src='./subtitles.vtt'
                default
              ></track>
            )}
          </video>
          <VolumeSection
            videoRef={videoRef}
            volumeSliderRef={volumeSliderRef}
            iconSize='5rem'
            handleMute={handleMute}
            primaryColor={"black"}
            primaryVolumeSliderColor={primaryVolumeSliderColor}
            secondaryVolumeSliderColor={secondaryVolumeSliderColor}
            isSlider={false}
          />
        </div>
      )}
    </div>
  );
}
