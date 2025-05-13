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
import ChunkedUploader from "../../../../uploader/lib/chunkUploader/ChunkUploader";

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

export default function MoreInfoSection({
  upload,
}: {
  upload: ChunkedUploader;
}) {
  const { mimeType, fileSize, uploadSpeed } = upload.getFileInfo();
  const speedData = uploadSpeed;

  // Apply simple moving average smoothing over last 3 points
  const SMOOTH_WINDOW = 3;
  const smoothedData = speedData.map((d, idx, arr) => {
    const start = Math.max(0, idx - (SMOOTH_WINDOW - 1));
    const window = arr.slice(start, idx + 1);
    const avg = window.reduce((sum, w) => sum + w.speedKBps, 0) / window.length;
    return { time: d.time, speedKBps: avg };
  });

  // Window and tick settings
  const WINDOW_MS = 20_000; // 20 seconds window
  const TICK_MS = 5_000; // ticks every 5 seconds

  // Compute X-domain for sliding window based on raw times
  const lastTime = speedData.length ? speedData[speedData.length - 1].time : 0;
  const domainEnd = Math.ceil(lastTime / TICK_MS) * TICK_MS;
  const domainStart = Math.max(0, domainEnd - WINDOW_MS);

  // Slice points in current window from smoothed data
  const windowData = smoothedData.filter(
    (d) => d.time >= domainStart && d.time <= domainEnd,
  );

  // Explicit X-axis ticks every 5 seconds
  const xTicks = [];
  for (let t = domainStart; t <= domainEnd; t += TICK_MS) xTicks.push(t);

  // Filter valid smoothed speeds for Y-axis calculation
  const validSpeeds = smoothedData
    .map((d) => d.speedKBps)
    .filter((v) => Number.isFinite(v) && v >= 0);

  // Track lifetime maximum of smoothed speeds
  const maxRef = useRef(0);
  useEffect(() => {
    const currentMax = validSpeeds.length ? Math.max(...validSpeeds) : 0;
    if (currentMax > maxRef.current) maxRef.current = currentMax;
  }, [validSpeeds]);

  // Determine Y-axis top, add 10% headroom and round nicely
  const rawTop = maxRef.current * 1.1;
  const yTop = niceCeil(rawTop);

  return (
    <div className="w-full space-y-2 rounded-xl p-4 font-K2D">
      <div className="space-y-1 text-white">
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
            data={windowData}
            margin={{ top: 10, right: 20, bottom: 30, left: 40 }}
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
                  fontSize: 14,
                },
              }}
              stroke="#f2f2f2"
            />

            <YAxis
              type="number"
              domain={[0, yTop]}
              allowDecimals={false}
              label={{
                value: "KB/s",
                angle: -90,
                position: "insideLeft",
                dx: -20,
                style: {
                  fill: "#f2f2f2",
                  fontFamily: "K2D, sans",
                  fontSize: 18,
                },
              }}
              stroke="#f2f2f2"
            />

            <Tooltip
              formatter={(v) => `${parseFloat(v.toString()).toFixed(1)} KB/s`}
              labelFormatter={(l) => `${(l / 1000).toFixed(1)}s`}
            />

            <defs>
              <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e62833" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#e62833" stopOpacity={0} />
              </linearGradient>
            </defs>

            <Area
              type="linear"
              dataKey="speedKBps"
              stroke="#e62833"
              fill="url(#speedGradient)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
