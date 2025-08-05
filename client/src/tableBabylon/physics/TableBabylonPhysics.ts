import {
  AbstractMesh,
  Vector3,
  CannonJSPlugin,
  PhysicsImpostor,
  StandardMaterial,
  Color3,
  MeshBuilder,
} from "@babylonjs/core";
import TableBabylonScene from "../TableBabylonScene";

import * as CANNON from "cannon-es";
(window as any).CANNON = CANNON;

class TableBabylonMouse {
  wallCannonMat: CANNON.Material;
  objectCannonMat: CANNON.Material;

  constructor(private tableBabylonScene: TableBabylonScene) {
    this.tableBabylonScene.scene.enablePhysics(
      new Vector3(0, 0, 0),
      new CannonJSPlugin(),
    );

    const world = (
      this.tableBabylonScene.scene.getPhysicsEngine()?.getPhysicsPlugin() as any
    ).world as CANNON.World;

    this.wallCannonMat = new CANNON.Material("stiffWall");
    this.objectCannonMat = new CANNON.Material("dynamicObject");

    world.addContactMaterial(
      new CANNON.ContactMaterial(this.wallCannonMat, this.objectCannonMat, {
        friction: 1.0, // Max grip
        restitution: 0.0, // No bounce
        contactEquationStiffness: 1e9,
        contactEquationRelaxation: 3,
        frictionEquationStiffness: 1e9,
        frictionEquationRelaxation: 3,
      }),
    );
    world.addContactMaterial(
      new CANNON.ContactMaterial(this.objectCannonMat, this.objectCannonMat, {
        friction: 1.0,
        restitution: 0.0,
        contactEquationStiffness: 1e9,
        contactEquationRelaxation: 3,
        frictionEquationStiffness: 1e9,
        frictionEquationRelaxation: 3,
      }),
    );

    this.createCollisionWalls();
  }

  addMeshCollision = (mesh: AbstractMesh) => {
    mesh.computeWorldMatrix(true);
    mesh.refreshBoundingInfo(false, true);

    mesh.physicsImpostor = new PhysicsImpostor(
      mesh,
      PhysicsImpostor.BoxImpostor,
      {
        mass: 1,
        restitution: 0.2,
        friction: 0.1,
        nativeOptions: { material: this.objectCannonMat },
      },
      this.tableBabylonScene.scene,
    );

    const body = mesh.physicsImpostor.physicsBody;

    // Lock Z movement
    body.linearFactor.set(1, 1, 0);

    // Lock all rotation
    body.angularFactor.set(0, 0, 0);

    // Damp motion quickly
    body.linearDamping = 0.99;
    body.angularDamping = 1.0;

    // Reset velocity
    mesh.physicsImpostor.setLinearVelocity(Vector3.Zero());
    mesh.physicsImpostor.setAngularVelocity(Vector3.Zero());

    mesh.showBoundingBox = true;
  };

  private createAngledWall = (
    name: string,
    size: { w: number; h: number },
    position: Vector3,
    rotation: Vector3,
  ) => {
    const wall = MeshBuilder.CreateBox(
      name,
      {
        width: size.w,
        height: size.h,
        depth: 1,
      },
      this.tableBabylonScene.scene,
    );

    wall.position = position;
    wall.rotation = rotation;

    // Add semi-transparent material to see it
    const mat = new StandardMaterial(
      `${name}-mat`,
      this.tableBabylonScene.scene,
    );
    mat.diffuseColor = new Color3(1, 0, 0);
    mat.alpha = 1;
    wall.material = mat;

    wall.physicsImpostor = new PhysicsImpostor(
      wall,
      PhysicsImpostor.BoxImpostor,
      {
        mass: 0,
        restitution: 0,
        friction: 1.0,
        nativeOptions: { material: this.wallCannonMat },
      },
      this.tableBabylonScene.scene,
    );

    this.tableBabylonScene.ambientLightThreeDimMeshes?.includedOnlyMeshes.push(
      wall,
    );

    return wall;
  };

  private createCollisionWalls = () => {
    const depth = 10000;
    const angle = Math.atan(Math.tan(this.tableBabylonScene.camera.fov / 2));

    // Left
    this.createAngledWall(
      "leftWall",
      { w: depth, h: 10000 },
      new Vector3(0, 0, -5),
      new Vector3(0, angle + 0.78, 0),
    );

    // Right
    this.createAngledWall(
      "rightWall",
      { w: depth, h: 10000 },
      new Vector3(0, 0, -5),
      new Vector3(0, -angle - 0.78, 0),
    );

    // Top
    this.createAngledWall(
      "topWall",
      { w: 10000, h: depth },
      new Vector3(0, 0, -5),
      new Vector3(angle + 0.78, 0, 0),
    );

    // Bottom
    this.createAngledWall(
      "bottomWall",
      { w: 10000, h: depth },
      new Vector3(0, 0, -5),
      new Vector3(-angle - 0.78, 0, 0),
    );
  };
}

export default TableBabylonMouse;
