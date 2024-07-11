const triangleVertexShaderSource = `
  attribute vec3 a_position;
  attribute vec2 a_texCoord;

  varying vec2 v_texCoord;

  // Function to rotate a 3D vector by angles in radians
  vec3 rotate(vec3 v, float angleX, float angleY) {
      float cosX = cos(angleX);
      float sinX = sin(angleX);
      float cosY = cos(angleY);
      float sinY = sin(angleY);

      // Rotate around x-axis
      vec3 rotatedX = vec3(v.x,
                           v.y * cosX - v.z * sinX,
                           v.y * sinX + v.z * cosX);

      // Rotate around y-axis
      vec3 rotatedXY = vec3(rotatedX.x * cosY + rotatedX.z * sinY,
                            rotatedX.y,
                            -rotatedX.x * sinY + rotatedX.z * cosY);

      return rotatedXY;
  }

  void main() {
      v_texCoord = a_texCoord;

      // Convert angles from degrees to radians
      float angleXRadians = radians(0.0); 
      float angleYRadians = radians(0.0);

      // Rotate the position a_position
      vec3 rotatedPosition = rotate(a_position, angleXRadians, angleYRadians);

      // Apply uniform scaling
      rotatedPosition *= 1.0;

      gl_Position = vec4(rotatedPosition, 1.0);
  }
`;

export default triangleVertexShaderSource;
