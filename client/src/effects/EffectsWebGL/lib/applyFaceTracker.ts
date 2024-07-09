import {
  NormalizedLandmarkList,
  NormalizedLandmarkListList,
} from "@mediapipe/face_mesh";
import { Point2D } from "./drawFaceMesh";
import {
  OneDimensionalVariableTypes,
  smoothedOneDimensionalVariables,
} from "./updateFaceLandmarks";

let faceTrackers: {
  [id: string]: { position: Point2D; lastSeen: number };
} = {};
const maxFaceTrackerAge = 5;

const generateUniqueFaceId = (existingIds: Set<string>, baseId: number) => {
  let newId = baseId.toString();
  while (existingIds.has(newId)) {
    baseId++;
    newId = baseId.toString();
  }
  return newId;
};

const applyFaceTracker = (multiFaceLandmarks: NormalizedLandmarkListList) => {
  const faceIdLandmarksPairs: {
    faceId: string;
    landmarks: NormalizedLandmarkList;
  }[] = [];
  const newFaceTrackers: {
    [id: string]: { position: Point2D; lastSeen: number };
  } = {};

  const existingIds = new Set(Object.keys(faceTrackers));

  multiFaceLandmarks.forEach((landmarks, faceIndex) => {
    if (!landmarks[1]) {
      return;
    }
    const nosePosition = { x: landmarks[1].x, y: landmarks[1].y };

    let closestTrackerId: string | null = null;
    let closestDistance = Infinity;

    for (const [id, tracker] of Object.entries(faceTrackers)) {
      const distance = Math.sqrt(
        Math.pow(nosePosition.x - tracker.position.x, 2) +
          Math.pow(nosePosition.y - tracker.position.y, 2)
      );
      if (distance < closestDistance) {
        closestDistance = distance;
        closestTrackerId = id;
      }
    }

    let faceId: string;
    if (closestDistance < 0.075 && closestTrackerId) {
      faceId = closestTrackerId;
    } else {
      faceId = generateUniqueFaceId(existingIds, faceIndex);
      existingIds.add(faceId);
    }

    newFaceTrackers[faceId] = {
      position: nosePosition as Point2D,
      lastSeen: 0,
    };
    faceIdLandmarksPairs.push({ faceId, landmarks });
  });

  // Clean up old face trackers
  for (const [id, tracker] of Object.entries(faceTrackers)) {
    if (!newFaceTrackers[id]) {
      tracker.lastSeen++;
      if (tracker.lastSeen > maxFaceTrackerAge) {
        Object.keys(smoothedOneDimensionalVariables).forEach((featureType) => {
          const feature = featureType as OneDimensionalVariableTypes;
          delete smoothedOneDimensionalVariables[feature][id];
        });
      } else {
        newFaceTrackers[id] = tracker;
      }
    }
  }
  faceTrackers = newFaceTrackers;

  return faceIdLandmarksPairs;
};

export default applyFaceTracker;
