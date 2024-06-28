import * as THREE from "three";
import { NormalizedLandmarkList } from "@mediapipe/face_mesh";
import drawTriangles from "./drawTriangles";
import { getTriangles } from "./getTriangles";

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export const overlayImageOnLiveVideo = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  triangleProgram: WebGLProgram,
  liveLandmarks: NormalizedLandmarkList,
  canvas: HTMLCanvasElement
) => {
  // Get the triangles
  const { overlayTriangles, liveTriangles } = getTriangles(liveLandmarks);

  // Draw the triangles
  drawTriangles(
    gl,
    overlayTriangles,
    liveTriangles,
    canvas,
    triangleTexture,
    triangleProgram,
    trianglePositionBufferr,
    triangleTexCoordBuffer,
    uniformLocations
  );
};

export default overlayImageOnLiveVideo;

// const drawColorfulTriangles = (
//   ctx: CanvasRenderingContext2D,
//   trianglesArray: Point2D[][],
//   rgb: number[]
// ) => {
//   for (let i = 0; i < trianglesArray.length; i++) {
//     const triangle = trianglesArray[i];

//     // Define a unique color for each triangle (e.g., random colors)
//     const color = `rgb(${rgb[0] * 255}, ${rgb[1] * 255}, ${rgb[2] * 255})`;
//     ctx.fillStyle = color;

//     // Draw the triangle
//     ctx.beginPath();
//     ctx.moveTo(
//       triangle[0].x * ctx.canvas.width,
//       triangle[0].y * ctx.canvas.height
//     );
//     ctx.lineTo(
//       triangle[1].x * ctx.canvas.width,
//       triangle[1].y * ctx.canvas.height
//     );
//     ctx.lineTo(
//       triangle[2].x * ctx.canvas.width,
//       triangle[2].y * ctx.canvas.height
//     );
//     ctx.closePath();
//     ctx.fill();

//     // Label the triangle with its index (i + 1)
//     ctx.font = "12px Arial";
//     ctx.fillStyle = "white";
//     ctx.fillText(`${i + 1}`, triangle[0].x, triangle[0].y);
//   }
// };

// const triangles = [
//   [50, 123, 187],
//   [187, 123, 147],
//   [123, 137, 147],
//   [137, 177, 147],
//   [137, 93, 177],
//   [93, 132, 177],
//   [345, 346, 352],
//   [346, 280, 352],
//   [447, 345, 352],
//   [447, 352, 366],
//   [447, 366, 454],
//   [454, 366, 323],
// ];

// const getUVMap = (uvImage: HTMLImageElement) => {
//   // Step 1: Get image dimensions
//   const width = uvImage.width;
//   const height = uvImage.height;

//   // Step 2: Prepare canvas for image manipulation
//   const canvas = document.createElement("canvas");
//   canvas.width = width;
//   canvas.height = height;
//   const tempCtx = canvas.getContext("2d");
//   if (!tempCtx) {
//     console.error("Failed to get 2D context of the canvas");
//     return;
//   }

//   // Step 3: Draw overlay image onto the canvas
//   tempCtx.drawImage(uvImage, 0, 0, width, height);

//   // Step 4: Get image data
//   const imageData = tempCtx.getImageData(0, 0, width, height);
//   const data = imageData.data;

//   // Step 5: Define a function to check if a pixel is green
//   const isGreen = (r: number, g: number, b: number) => {
//     const threshold = 254;
//     return g > r + threshold && g > b + threshold;
//   };

//   // Step 6: Loop through pixels to find centers of green blobs
//   const uvPoints2 = [];
//   const visited = new Array(width * height).fill(false); // Track visited pixels

//   for (let y = 0; y < height; y++) {
//     for (let x = 0; x < width; x++) {
//       const index = (y * width + x) * 4; // Get index in the RGBA array
//       const r = data[index];
//       const g = data[index + 1];
//       const b = data[index + 2];
//       // Check if the pixel is green and hasn't been visited
//       if (isGreen(r, g, b) && !visited[y * width + x]) {
//         // Perform a flood fill to find all connected green pixels (blob)
//         const blobPixels = []; // Array to store all pixels in the current blob
//         const queue = [{ x, y }];
//         while (queue.length > 0) {
//           const shift = queue.shift();
//           if (!shift) {
//             return;
//           }
//           const { x, y } = shift;
//           const pixelIndex = y * width + x;
//           if (visited[pixelIndex]) continue;
//           visited[pixelIndex] = true;
//           blobPixels.push({ x, y });
//           // Check neighboring pixels
//           for (let dy = -1; dy <= 1; dy++) {
//             for (let dx = -1; dx <= 1; dx++) {
//               const nx = x + dx;
//               const ny = y + dy;
//               if (
//                 nx >= 0 &&
//                 nx < width &&
//                 ny >= 0 &&
//                 ny < height &&
//                 !visited[ny * width + nx] &&
//                 isGreen(
//                   data[(ny * width + nx) * 4],
//                   data[(ny * width + nx) * 4 + 1],
//                   data[(ny * width + nx) * 4 + 2]
//                 )
//               ) {
//                 queue.push({ x: nx, y: ny });
//               }
//             }
//           }
//         }
//         // Calculate the center of the blob
//         let sumX = 0;
//         let sumY = 0;
//         for (const { x, y } of blobPixels) {
//           sumX += x;
//           sumY += y;
//         }
//         const centerX = sumX / blobPixels.length;
//         const centerY = sumY / blobPixels.length;
//         // Convert to UV coordinates
//         const u = centerX / width;
//         const v = centerY / height;
//         uvPoints2.push({ u, v });
//       }
//     }
//   }

//   // Step 7: Use UV points as needed
// };
// const overlayTriangles: [Point2D, Point2D, Point2D][] = [];
// const liveTriangles: [Point3D, Point3D, Point3D][] = [];
// for (let i = 0; i < triangles.length; i++) {
//   const matchingEntry1 = uvMap.find((entry) => entry.ai === triangles[i][0]);
//   const matchingEntry2 = uvMap.find((entry) => entry.ai === triangles[i][1]);
//   const matchingEntry3 = uvMap.find((entry) => entry.ai === triangles[i][2]);

//   if (matchingEntry1 && matchingEntry2 && matchingEntry3) {
//     overlayTriangles.push([
//       {
//         x: olduvPoints[`${matchingEntry1.uv}`].u,
//         y: olduvPoints[`${matchingEntry1.uv}`].v,
//       },
//       {
//         x: olduvPoints[`${matchingEntry2.uv}`].u,
//         y: olduvPoints[`${matchingEntry2.uv}`].v,
//       },
//       {
//         x: olduvPoints[`${matchingEntry3.uv}`].u,
//         y: olduvPoints[`${matchingEntry3.uv}`].v,
//       },
//     ]);
//   }

//   // If a matching entry is found, push its 'ai' value to liveTriangles
//   liveTriangles.push([
//     livePoints[triangles[i][0]],
//     livePoints[triangles[i][1]],
//     livePoints[triangles[i][2]],
//   ]);
// }

// drawColorfulTriangles(ctx, overlayTriangles, [0, 0, 1]);
// drawTexturedTriangles(overlayTriangles, liveTriangles, canvas);
// drawColorfulTriangles(ctx, liveTriangles, [1, 0, 0]);
