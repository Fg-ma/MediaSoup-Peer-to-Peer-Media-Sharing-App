import * as faceapi from "face-api.js";

const updateFaceLandmarks = async (
  gl: WebGLRenderingContext,
  video: HTMLVideoElement,
  program: WebGLProgram
) => {
  // Perform face detection
  const detections = await faceapi
    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks();

  if (detections.length > 0) {
    const landmarks = detections[0].landmarks;
    const leftEarPosition = landmarks.getLeftEye();
    const rightEarPosition = landmarks.getRightEye();

    // Convert positions to WebGL coordinate system (-1 to 1 range)
    const normalizedLeftEarPosition = [
      (leftEarPosition[0].x / video.videoWidth) * 2 - 1,
      -((leftEarPosition[0].y / video.videoHeight) * 2 - 1),
    ];

    const normalizedRightEarPosition = [
      (rightEarPosition[3].x / video.videoWidth) * 2 - 1,
      -((rightEarPosition[3].y / video.videoHeight) * 2 - 1),
    ];

    // Set uniforms in the fragment shader
    const leftEarPositionLocation = gl.getUniformLocation(
      program,
      "u_leftEarPosition"
    );
    const rightEarPositionLocation = gl.getUniformLocation(
      program,
      "u_rightEarPosition"
    );

    if (leftEarPositionLocation && rightEarPositionLocation) {
      gl.uniform2fv(leftEarPositionLocation, normalizedLeftEarPosition);
      gl.uniform2fv(rightEarPositionLocation, normalizedRightEarPosition);
    }
  }
};

export default updateFaceLandmarks;
