import {
  Vector3,
  AbstractMesh,
  GizmoManager,
  Color3,
  PointerDragBehavior,
} from "@babylonjs/core";
import { GizmoStateTypes } from "../../../../universal/babylonTypeContant";
import TableBabylonScene from "../TableBabylonScene";

class TableBabylonGizmo {
  constructor(private tableBabylonScene: TableBabylonScene) {}

  // Helper function to determine the next gizmo state
  getNextGizmoState = (currentState?: GizmoStateTypes): GizmoStateTypes => {
    switch (currentState) {
      case "none":
        return "position";
      case "position":
        return "rotation";
      case "rotation":
        return "scale";
      case "scale":
        return "none";
      case undefined:
        return "position";
      default:
        return "none";
    }
  };

  // Function to enable the position gizmo for a mesh
  enableGizmo = (gizmoType: GizmoStateTypes, mesh: AbstractMesh) => {
    const meshMetadata = mesh.metadata;

    // Create a GizmoManager to manage gizmos in the scene
    const gizmoManager = new GizmoManager(this.tableBabylonScene.scene);

    switch (gizmoType) {
      case "position": {
        gizmoManager.positionGizmoEnabled = true;

        const positionGizmo = gizmoManager.gizmos.positionGizmo;
        if (positionGizmo) {
          positionGizmo.xGizmo.coloredMaterial.diffuseColor = new Color3(
            0.96078431,
            0.38039215,
            0.0784313725490196,
          ); // Red for X axis
          positionGizmo.yGizmo.coloredMaterial.diffuseColor = new Color3(
            0.17254901,
            0.57254901,
            0.9607843137254902,
          ); // Green for Y axis
          positionGizmo.zGizmo.coloredMaterial.diffuseColor = new Color3(
            0.30980392,
            0.6666666666666666,
            0.5333333333333333,
          ); // Blue for Z axis
        }

        // Set the gizmo to use world space (fixed axes) instead of local space
        gizmoManager.gizmos.positionGizmo!.updateGizmoRotationToMatchAttachedMesh =
          false;
        gizmoManager.usePointerToAttachGizmos = false; // Disable auto attaching

        // Add dragging behavior along a specific plane (Y-axis constrained)
        const dragBehavior = new PointerDragBehavior({
          dragPlaneNormal: new Vector3(0, 0, 1),
        });

        // Attach the drag behavior to the mesh
        mesh.addBehavior(dragBehavior);

        // Store the drag behavior in the mesh's metadata for later access
        meshMetadata.dragBehavior = dragBehavior;
        break;
      }
      case "rotation": {
        gizmoManager.rotationGizmoEnabled = true;

        const rotationGizmo = gizmoManager.gizmos.rotationGizmo;
        if (rotationGizmo) {
          rotationGizmo.xGizmo.coloredMaterial.diffuseColor = new Color3(
            0.96078431,
            0.38039215,
            0.0784313725490196,
          ); // Red for X axis
          rotationGizmo.yGizmo.coloredMaterial.diffuseColor = new Color3(
            0.17254901,
            0.57254901,
            0.9607843137254902,
          ); // Green for Y axis
          rotationGizmo.zGizmo.coloredMaterial.diffuseColor = new Color3(
            0.30980392,
            0.6666666666666666,
            0.5333333333333333,
          ); // Blue for Z axis
        }

        // Set the gizmo to use world space (fixed axes) instead of local space
        gizmoManager.gizmos.rotationGizmo!.updateGizmoRotationToMatchAttachedMesh =
          false;
        gizmoManager.usePointerToAttachGizmos = false; // Disable auto attaching
        break;
      }
      case "scale": {
        gizmoManager.scaleGizmoEnabled = true;

        const scaleGizmo = gizmoManager.gizmos.scaleGizmo;
        if (scaleGizmo) {
          scaleGizmo.xGizmo.coloredMaterial.diffuseColor = new Color3(
            0.96078431,
            0.38039215,
            0.0784313725490196,
          ); // Red for X axis
          scaleGizmo.yGizmo.coloredMaterial.diffuseColor = new Color3(
            0.17254901,
            0.57254901,
            0.9607843137254902,
          ); // Green for Y axis
          scaleGizmo.zGizmo.coloredMaterial.diffuseColor = new Color3(
            0.30980392,
            0.6666666666666666,
            0.5333333333333333,
          ); // Blue for Z axis
        }
        break;
      }
    }

    // Attach the gizmo to the selected mesh
    gizmoManager.attachToMesh(mesh);

    // Store the gizmo manager in the mesh's metadata for later access
    mesh.metadata.gizmoManager = gizmoManager;
  };

  // Function to disable the position gizmo for a mesh
  disableGizmo = (mesh: AbstractMesh) => {
    const meshMetadata = mesh.metadata;

    if (!meshMetadata) {
      return;
    }

    // Remove the drag behavior
    const dragBehavior = meshMetadata.dragBehavior;
    if (dragBehavior) {
      mesh.removeBehavior(dragBehavior);
    }

    const gizmoManager = meshMetadata.gizmoManager;

    const gizmos = ["xGizmo", "yGizmo", "zGizmo"];
    for (const gizmo of gizmos) {
      const currentGizmo =
        meshMetadata?.gizmoManager?.gizmos?.positionGizmo?.[gizmo];
      if (currentGizmo) {
        currentGizmo.dragBehavior?.onDragObservable.clear();
        currentGizmo.dragBehavior?.onDragStartObservable.clear();
        currentGizmo.dragBehavior?.onDragEndObservable.clear();
      }
    }

    if (gizmoManager) {
      // Detach the gizmo from the mesh and disable it
      gizmoManager.attachToMesh(null);
      gizmoManager.dispose(); // Clean up the gizmo manager
    }

    // Remove gizmo metadata to avoid memory leaks
    meshMetadata.gizmoManager = undefined;
    meshMetadata.dragBehavior = undefined;
  };
}

export default TableBabylonGizmo;
