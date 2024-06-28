import * as THREE from "three";
import { Point2D, Point3D } from "./overlayImageOnLiveVideo";
import textureUrl from "../../../../public/assets/james2.png";

// const drawTriangles = (
//   srcTrianglesArray: [Point2D, Point2D, Point2D][],
//   destTrianglesArray: [Point3D, Point3D, Point3D][],
//   canvasWidth: number,
//   canvasHeight: number,
//   scene: THREE.Scene,
//   camera: THREE.OrthographicCamera,
//   renderer: THREE.WebGLRenderer,
//   texture: THREE.Texture
// ) => {
//   // Dispose of previous mesh if exists
//   cleanupScene(scene);

//   const positions: number[] = [];
//   const uvs: number[] = [];
//   const indices: number[] = [];

//   let indexOffset = 0;

//   srcTrianglesArray.forEach((triangle, triangleIndex) => {
//     const srcVertices: number[] = [];
//     const uv: number[] = [];

//     triangle.forEach((point) => {
//       srcVertices.push(point.x * canvasWidth, (1 - point.y) * canvasHeight, 0);
//       uv.push(point.x, point.y);
//     });

//     const destTriangle = destTrianglesArray[triangleIndex];
//     if (!destTriangle) {
//       return;
//     }
//     const destVertices: number[] = [];
//     destTriangle.forEach((point) => {
//       destVertices.push(
//         point.x * canvasWidth,
//         (1 - point.y) * canvasHeight,
//         point.z
//       );
//     });

//     positions.push(...destVertices);
//     uvs.push(...uv);
//     indices.push(indexOffset, indexOffset + 1, indexOffset + 2);
//     indexOffset += 3;
//   });

//   const geometry = new THREE.BufferGeometry();
//   geometry.setAttribute(
//     "position",
//     new THREE.Float32BufferAttribute(positions, 3)
//   );
//   geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
//   geometry.setIndex(indices);

//   const material = new THREE.MeshBasicMaterial({
//     map: texture,
//     side: THREE.FrontSide,
//     depthTest: true,
//     depthWrite: true,
//   });

//   const mesh = new THREE.Mesh(geometry, material);
//   scene.add(mesh);

//   // Render function
//   const render = () => {
//     renderer.render(scene, camera);
//   };

//   render(); // Initial render
// };

// // Function to dispose of previous mesh and associated resources
// function cleanupScene(scene: THREE.Scene) {
//   scene.traverse((object) => {
//     if (object instanceof THREE.Mesh) {
//       if (object.geometry) {
//         object.geometry.dispose();
//       }

//       if (object.material) {
//         if (Array.isArray(object.material)) {
//           object.material.forEach((material) => material.dispose());
//         } else {
//           object.material.dispose();
//         }
//       }

//       scene.remove(object);
//     }
//   });
// }

const drawTriangles = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  srcTrianglesArray: [Point2D, Point2D, Point2D][],
  destTrianglesArray: [Point3D, Point3D, Point3D][],
  canvas: HTMLCanvasElement,
  triangleTexture: WebGLTexture,
  triangleProgram: WebGLProgram,
  trianglePositionBuffer: WebGLBuffer,
  triangleTexCoordBuffer: WebGLBuffer,
  uniformLocations: Record<string, WebGLUniformLocation>
) => {
  // Clear the canvas
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Use the triangle program for drawing triangles
  gl.useProgram(triangleProgram);

  // Bind triangle buffers and set attributes
  gl.bindBuffer(gl.ARRAY_BUFFER, trianglePositionBuffer);
  gl.enableVertexAttribArray(uniformLocations.a_position);
  gl.vertexAttribPointer(uniformLocations.a_position, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, triangleTexCoordBuffer);
  gl.enableVertexAttribArray(uniformLocations.a_texCoord);
  gl.vertexAttribPointer(uniformLocations.a_texCoord, 2, gl.FLOAT, false, 0, 0);

  // Update uniforms for triangles
  gl.uniform1i(uniformLocations.u_useTriangleTexture, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, triangleTexture);
  gl.uniform1i(uniformLocations.u_triangleTexture, 0);

  // Draw triangles
  srcTrianglesArray.forEach((triangle, triangleIndex) => {
    const destTriangle = destTrianglesArray[triangleIndex];
    if (!destTriangle) {
      return;
    }

    const destVertices: number[] = [];
    triangle.forEach((point) => {
      destVertices.push(
        point.x * canvas.width,
        (1 - point.y) * canvas.height,
        0
      );
    });

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(destVertices),
      gl.STATIC_DRAW
    );
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  });

  // Swap buffers if using double buffering
  gl.flush();
};

export default drawTriangles;
