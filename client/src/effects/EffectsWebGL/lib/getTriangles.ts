import { Delaunay } from "d3-delaunay";
import { Point2D, Point3D } from "./drawFaceMesh";
import { uvPoints } from "./uvPoints";

export const getTriangles = (livePoints: Point3D[]) => {
  const liveDelaunay = Delaunay.from(
    livePoints,
    (p) => p.x,
    (p) => p.y
  );
  const liveTrianglesIndices = liveDelaunay.triangles;

  const overlayTriangles: [Point2D, Point2D, Point2D][] = [];
  const liveTriangles: [Point3D, Point3D, Point3D][] = [];

  for (let i = 0; i < liveTrianglesIndices.length; i += 3) {
    if (
      uvPoints[liveTrianglesIndices[i]] &&
      uvPoints[liveTrianglesIndices[i + 1]] &&
      uvPoints[liveTrianglesIndices[i + 2]]
    ) {
      const overlayTriangle: [Point2D, Point2D, Point2D] = [
        {
          x: uvPoints[liveTrianglesIndices[i]].u,
          y: uvPoints[liveTrianglesIndices[i]].v,
        },
        {
          x: uvPoints[liveTrianglesIndices[i + 1]].u,
          y: uvPoints[liveTrianglesIndices[i + 1]].v,
        },
        {
          x: uvPoints[liveTrianglesIndices[i + 2]].u,
          y: uvPoints[liveTrianglesIndices[i + 2]].v,
        },
      ];
      overlayTriangles.push(overlayTriangle);
    }
    if (
      livePoints[liveTrianglesIndices[i]] &&
      livePoints[liveTrianglesIndices[i + 1]] &&
      livePoints[liveTrianglesIndices[i + 2]]
    ) {
      const liveTriangle: [Point3D, Point3D, Point3D] = [
        livePoints[liveTrianglesIndices[i]],
        livePoints[liveTrianglesIndices[i + 1]],
        livePoints[liveTrianglesIndices[i + 2]],
      ];
      liveTriangles.push(liveTriangle);
    }
  }

  return { overlayTriangles, liveTriangles };
};
