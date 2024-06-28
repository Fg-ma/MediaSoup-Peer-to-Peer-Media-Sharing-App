import * as THREE from "three";
import textureUrl from "../../../../public/assets/james2.png";

// Store references to previously created objects
let previousScene: THREE.Scene | null = null;
let previousRenderer: THREE.WebGLRenderer | null = null;
let previousTexture: THREE.Texture | null = null;

const threeInit = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement
) => {
  if (gl instanceof WebGLRenderingContext) {
    return;
  }

  const canvasWidth = video.videoWidth;
  const canvasHeight = video.videoHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    0,
    canvasWidth,
    canvasHeight,
    0,
    -1,
    1
  );

  const renderer = new THREE.WebGLRenderer({
    canvas,
    context: gl,
    depth: true,
  });
  return;
  renderer.setSize(canvasWidth, canvasHeight);

  const textureLoader = new THREE.TextureLoader();

  // Create a promise for loading the texture
  const texturePromise = new Promise<THREE.Texture>((resolve, reject) => {
    textureLoader.load(
      textureUrl,
      (loadedTexture) => {
        loadedTexture.flipY = false;
        loadedTexture.premultiplyAlpha = false;
        resolve(loadedTexture);
      },
      undefined,
      reject
    );
  });

  return texturePromise.then((texture) => {
    // Cleanup previous resources if they exist
    if (previousScene) disposeScene(previousScene);
    if (previousRenderer) disposeRenderer(previousRenderer);
    if (previousTexture) disposeTexture(previousTexture);

    // Store references to current objects
    previousScene = scene;
    previousRenderer = renderer;
    previousTexture = texture;
    return { canvasWidth, canvasHeight, scene, camera, renderer, texture };
  });
};

// Dispose functions for various Three.js objects
const disposeScene = (scene: THREE.Scene) => {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    }
  });
  scene.clear();
};

function disposeRenderer(renderer: THREE.WebGLRenderer) {
  renderer.dispose();
}

function disposeTexture(texture: THREE.Texture) {
  texture.dispose();
}

export default threeInit;
