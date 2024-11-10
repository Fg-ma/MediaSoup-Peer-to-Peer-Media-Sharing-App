import {
  SceneLoader,
  AbstractMesh,
  StandardMaterial,
  MeshBuilder,
  Texture,
  Material,
  Scene,
} from "@babylonjs/core";
import "@babylonjs/loaders";

class MeshLoaders {
  constructor(private scene: Scene) {}

  loadGLTF = (
    meshLabel: string,
    meshName: string,
    meshPath: string,
    meshFile: string
  ) => {
    return new Promise<AbstractMesh[]>((resolve, reject) => {
      // Load the GLTF file
      SceneLoader.ImportMesh(
        meshName,
        meshPath,
        meshFile,
        this.scene,
        (meshes, _particleSystems, _skeletons, animationGroups) => {
          if (meshes.length > 0) {
            animationGroups.forEach((animationGroup) => {
              animationGroup.pause(); // Pause the animation by default

              animationGroup.metadata = {
                meshLabel,
              };
            });

            const parentMesh = MeshBuilder.CreateBox(
              meshLabel,
              { size: 0.1 },
              this.scene
            );
            parentMesh.isVisible = false; // Optionally make the parent mesh invisible
            parentMesh.isPickable = false; // Prevent direct interaction with the parent

            // Set each loaded mesh as a child of the parent
            meshes.forEach((mesh) => {
              mesh.parent = parentMesh; // Set the parent
              mesh.isPickable = true; // Ensure the mesh is pickable
            });

            // Store the parent mesh in the meshes collection
            resolve([parentMesh, ...meshes]); // Resolve the promise when the mesh is loaded
          } else {
            reject(new Error(`No meshes found for ${meshLabel}`));
          }
        },
        null,
        (_scene, message, exception) => {
          console.error(`Error loading mesh: ${message}`, exception);
          reject(exception); // Reject the promise on error
        }
      );
    });
  };

  load2D = async (meshLabel: string, meshPath: string, meshFile: string) => {
    return new Promise<AbstractMesh>((resolve) => {
      // Create a plane for the 2D texture
      const plane = MeshBuilder.CreatePlane(
        meshLabel,
        { width: 1, height: 1 },
        this.scene
      );

      // Create the material with alpha
      const material = new StandardMaterial(
        `${meshLabel}-material`,
        this.scene
      );

      // Load the texture with transparency
      const texture = new Texture(`${meshPath}${meshFile}`, this.scene);
      texture.hasAlpha = true;

      material.diffuseTexture = texture;

      // Enable alpha blending
      material.useAlphaFromDiffuseTexture = true; // Use the alpha channel from the diffuse texture
      material.transparencyMode = Material.MATERIAL_ALPHABLEND; // Set transparency mode to alpha test

      // Assign material to the plane
      plane.material = material;

      resolve(plane); // Resolve when the 2D mesh is created
    });
  };
}

export default MeshLoaders;
