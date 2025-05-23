import React, { useRef, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import ChunkedUploader from "../../../../tools/uploader/lib/chunkUploader/ChunkUploader";

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

export default function MoreInfoSection({
  upload,
}: {
  upload: ChunkedUploader;
}) {
  const { mimeType, fileSize, uploadSpeed, ETA } = upload.getFileInfo();

  // Window and tick settings
  const WINDOW_MS = 20_000; // 20 seconds window
  const TICK_MS = 5_000; // ticks every 5 seconds

  // Compute X-domain for sliding window based on raw times
  const lastTime = uploadSpeed.length
    ? uploadSpeed[uploadSpeed.length - 1].time
    : 0;
  const domainEnd = Math.ceil(lastTime / TICK_MS) * TICK_MS;
  const domainStart = Math.max(0, domainEnd - WINDOW_MS);

  // Slice points in current window from smoothed data
  const windowData = uploadSpeed.filter(
    (d) => d.time >= domainStart && d.time <= domainEnd,
  );

  // Explicit X-axis ticks every 5 seconds
  const xTicks = [];
  for (let t = domainStart; t <= domainEnd; t += TICK_MS) xTicks.push(t);

  const windowSpeeds = windowData.map((d) => d.speedKBps);
  const maxSpeed = windowSpeeds.length ? Math.max(...windowSpeeds) : 0;

  const { unitLabel, scaleFactor } = chooseUnit(maxSpeed);

  // Determine Y-axis top, add 10% headroom and round nicely
  const yTop = niceCeil(maxSpeed * 1.1 * scaleFactor);

  return (
    <div className="w-full space-y-2 rounded-xl p-4 font-K2D">
      <div className="space-y-1 text-white">
        <p>
          <strong>ETA:</strong> {ETA}
        </p>
        <p>
          <strong>MIME type:</strong> {mimeType}
        </p>
        <p>
          <strong>File size:</strong> {fileSize}
        </p>
      </div>
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={windowData.map((d) => ({
              time: d.time,
              speed: d.speedKBps * scaleFactor,
            }))}
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
              tickFormatter={(t) => `${Math.round(t / 1000)}s`}
              label={{
                value: "s",
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
              formatter={(v) =>
                `${parseFloat(v.toString()).toFixed(1)} ${unitLabel}`
              }
              labelFormatter={(l) => `${(l / 1000).toFixed(1)}s`}
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

            <defs>
              <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e62833" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#e62833" stopOpacity={0} />
              </linearGradient>
            </defs>

            <Area
              type="linear"
              dataKey="speed"
              stroke="#e62833"
              fill="url(#speedGradient)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
