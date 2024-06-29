import { NormalizedLandmarkList } from "@mediapipe/face_mesh";

const smoothedLandmarks: {
  [faceId: string]: NormalizedLandmarkList;
} = {};

const deadbandThreshold = 0.001;

const adaptiveSmoothingFactor = (distance: number) => {
  const minFactor = 0.7;
  const maxFactor = 0.3;
  const threshold = 0.001;

  if (distance < threshold) {
    return maxFactor;
  } else {
    return minFactor;
  }
};

const applyDeadband = (
  newValue: number,
  oldValue: number,
  threshold: number
) => {
  return Math.abs(newValue - oldValue) < threshold ? oldValue : newValue;
};

const smoothLandmark = (
  newLandmark: { x: number; y: number; z: number },
  oldLandmark: { x: number; y: number; z: number }
) => {
  const smoothingFactor = adaptiveSmoothingFactor(
    Math.abs(newLandmark.x - oldLandmark.x)
  );

  return {
    x: applyDeadband(
      newLandmark.x * smoothingFactor + oldLandmark.x * (1 - smoothingFactor),
      oldLandmark.x,
      deadbandThreshold
    ),
    y: applyDeadband(
      newLandmark.y * smoothingFactor + oldLandmark.y * (1 - smoothingFactor),
      oldLandmark.y,
      deadbandThreshold
    ),
    z: applyDeadband(
      newLandmark.z * smoothingFactor + oldLandmark.z * (1 - smoothingFactor),
      oldLandmark.z,
      deadbandThreshold
    ),
  };
};

const landmarksSmoothWithDeadbanding = (
  faceIdLandmarksPairs: {
    faceId: string;
    landmarks: NormalizedLandmarkList;
  }[]
) => {
  const newSmoothedLandmarks: {
    faceId: string;
    landmarks: NormalizedLandmarkList;
  }[] = [];

  faceIdLandmarksPairs.forEach(({ faceId, landmarks }) => {
    if (!smoothedLandmarks[faceId]) {
      // Initialize with the first set of landmarks if not already present
      smoothedLandmarks[faceId] = landmarks;
    } else {
      // Smooth each landmark
      landmarks.forEach((landmark, index) => {
        smoothedLandmarks[faceId][index] = smoothLandmark(
          landmark,
          smoothedLandmarks[faceId][index]
        );
      });
    }

    // Store the new smoothed landmarks
    newSmoothedLandmarks.push({
      faceId,
      landmarks: smoothedLandmarks[faceId],
    });
  });

  return newSmoothedLandmarks;
};

export default landmarksSmoothWithDeadbanding;
