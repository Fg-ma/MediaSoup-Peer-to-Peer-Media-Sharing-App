import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useUploadDownloadContext } from "../../../../../context/uploadDownloadContext/UploadDownloadContext";
import Downloader from "../../../../../tools/downloader/Downloader";
import LiveTextDownloader from "../../../../../tools/liveTextDownloader/LiveTextDownloader";
import { ChunkedUploadListenerTypes } from "src/tools/uploader/lib/chunkUploader/ChunkUploader";

// Rounds up to a "nice" number: 1, 2, 5, or 10 × power of 10
function niceCeil(value: number) {
  if (value <= 0) return 0;
  const exp = Math.floor(Math.log10(value));
  const base = Math.pow(10, exp);
  const n = value / base;
  let nice;
  if (n <= 1) nice = 1;
  else if (n <= 2) nice = 2;
  else if (n <= 5) nice = 5;
  else nice = 10;
  return nice * base;
}

function getLineColor(idx: number, type: "download" | "upload") {
  if (type === "download") {
    // first download always your brand color
    if (idx === 0) return "#d40213";

    // warm hues from 0° (red) → 60° (yellow)
    const hueStart = 0;
    const hueRange = 60;
    // skip first slot, then spread the rest evenly
    const hue = hueStart + (((idx - 1) * 17) % hueRange);
    return `hsl(${hue}, 75%, 50%)`;
  } else {
    // cool hues from 180° (cyan) → 260° (blue‑violet)
    const hueStart = 180;
    const hueRange = 80;
    const hue = hueStart + ((idx * 17) % hueRange);
    return `hsl(${hue}, 75%, 50%)`;
  }
}

const WINDOW_MS = 20_000;

const UNITS = ["b/s", "B/s", "KB/s", "MB/s", "GB/s", "TB/s"];

function chooseUnit(KB: number) {
  let idx = 2;
  let scaleFactor = 1;
  if (KB > 1000000000) {
    idx = 5;
    scaleFactor = 1 / 1000000000;
  } else if (KB > 1000000) {
    idx = 4;
    scaleFactor = 1 / 1000000;
  } else if (KB > 125) {
    idx = 3;
    scaleFactor = 1 / 125;
  } else if (KB > 0.001) {
    idx = 1;
    scaleFactor = 1 * 1000;
  } else if (KB > 0.000125) {
    idx = 0;
    scaleFactor = 1 * 8000;
  }

  return {
    unitLabel: UNITS[idx],
    scaleFactor,
  };
}

export default function MultiDownloadChart() {
  const { getCurrentDownloads, getCurrentUploads } = useUploadDownloadContext();
  const traffic = [
    ...Object.values(getCurrentDownloads()),
    ...Object.values(getCurrentUploads()),
  ];

  const [now, setNow] = useState(Date.now());
  const [_, setRerender] = useState(false);

  // Tick now every second to keep chart moving
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Process each download series
  const seriesData: {
    filename: string;
    data: {
      time: number;
      speed: number;
    }[];
    type: "download" | "upload";
  }[] = traffic.map((t) => {
    const absoluteSpeed = t.getAbsoluteSpeedHistory();

    const data = absoluteSpeed.map((s) => ({
      time: s.time,
      speed: s.speedKBps,
    }));

    return {
      filename: t.filename,
      data,
      type:
        t instanceof Downloader || t instanceof LiveTextDownloader
          ? "download"
          : "upload",
    };
  });

  // Define sliding window based on real time
  const domainEnd = now;
  const domainStart = now - WINDOW_MS;

  // Y-axis top
  const allWindowedSpeeds = seriesData.flatMap((s) =>
    s.data
      .filter((d) => d.time >= domainStart && d.time <= domainEnd)
      .map((d) => d.speed),
  );
  const maxSpeed = Math.max(...allWindowedSpeeds, 0);

  const { unitLabel, scaleFactor } = chooseUnit(maxSpeed);

  const yTop = niceCeil(maxSpeed * 1.1 * scaleFactor);

  // X-axis ticks aligned to real time window
  const xTicks = [
    domainEnd - 20_000,
    domainEnd - 15_000,
    domainEnd - 10_000,
    domainEnd - 5_000,
    domainEnd,
  ];

  const handleDownloadListener = (
    message:
      | { type: "downloadProgress" }
      | { type: "downloadPaused" }
      | { type: "downloadResumed" }
      | Record<string, any>,
  ) => {
    switch (message.type) {
      case "downloadProgress":
        setRerender((prev) => !prev);
        break;
      case "downloadPaused":
        setRerender((prev) => !prev);
        break;
      case "downloadResumed":
        setRerender((prev) => !prev);
        break;
      default:
        break;
    }
  };

  const handleUploadListener = (message: ChunkedUploadListenerTypes) => {
    switch (message.type) {
      case "uploadProgress":
        setRerender((prev) => !prev);
        break;
      case "uploadPlay":
        setRerender((prev) => !prev);
        break;
      case "uploadPaused":
        setRerender((prev) => !prev);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    traffic.forEach((t) => {
      if (t instanceof Downloader || t instanceof LiveTextDownloader) {
        t.addDownloadListener(handleDownloadListener);
      } else {
        t.addChunkedUploadListener(handleUploadListener);
      }
    });

    return () => {
      traffic.forEach((t) => {
        if (t instanceof Downloader || t instanceof LiveTextDownloader) {
          t.removeDownloadListener(handleDownloadListener);
        } else {
          t.removeChunkedUploadListener(handleUploadListener);
        }
      });
    };
  }, []);

  return (
    <>
      {traffic.length !== 0 && (
        <>
          <div className="mx-6 font-Josefin text-xl text-fg-white-95">
            Uploads and downloads
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[]}
                margin={{ top: 10, right: 30, bottom: 20, left: 18 }}
              >
                <CartesianGrid stroke="#444" strokeDasharray="3 3" />

                <XAxis
                  type="number"
                  dataKey="time"
                  scale="linear"
                  domain={[domainStart, domainEnd]}
                  ticks={xTicks}
                  interval={0}
                  tickFormatter={(t) =>
                    `${Math.round((domainEnd - t) / 1000)}s`
                  }
                  label={{
                    value: "Time ago",
                    position: "insideBottom",
                    dy: 20,
                    style: {
                      fill: "#f2f2f2",
                      fontFamily: "K2D, sans",
                      fontSize: 18,
                    },
                  }}
                  stroke="#f2f2f2"
                />

                <YAxis
                  type="number"
                  domain={[0, yTop]}
                  allowDecimals={false}
                  label={{
                    value: unitLabel,
                    angle: -90,
                    position: "insideLeft",
                    dx: 0,
                    style: {
                      fill: "#f2f2f2",
                      fontFamily: "K2D, sans",
                      fontSize: 18,
                    },
                  }}
                  stroke="#f2f2f2"
                />

                <Tooltip
                  formatter={(value, name) => [
                    name,
                    `${parseFloat(value.toString()).toFixed(1)}${unitLabel}`,
                  ]}
                  labelFormatter={(l) => `${Math.round((now - l) / 1000)}s ago`}
                  wrapperStyle={{
                    padding: 0,
                    margin: 0,
                    pointerEvents: "none",
                    maxWidth: "12rem",
                    overflow: "hidden",
                  }}
                  contentStyle={{
                    padding: 4,
                    fontSize: 12,
                    backgroundColor: "rgba(9,9,9,0.7)",
                    borderRadius: 4,
                  }}
                  itemStyle={{
                    padding: 2,
                    margin: 0,
                    fontFamily: "K2D, sans",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  labelStyle={{
                    fontSize: 16,
                    marginBottom: 2,
                    color: "rgb(242,242,242)",
                    fontFamily: "K2D, sans",
                  }}
                />

                {seriesData.map((s, i) => {
                  const data = s.data.filter(
                    (d) => d.time >= domainStart && d.time <= domainEnd,
                  );

                  return (
                    <Line
                      key={s.filename}
                      data={data.map((d) => ({
                        time: d.time,
                        speed: d.speed * scaleFactor,
                      }))}
                      dataKey="speed"
                      name={s.filename}
                      type="linear"
                      stroke={getLineColor(i, s.type)}
                      dot={false}
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </>
  );
}
