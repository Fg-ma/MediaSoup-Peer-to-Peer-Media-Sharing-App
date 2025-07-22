import { Scene } from "@babylonjs/core";
import LittleBuddy from "./lib/LittleBuddy";
import { LittleBuddiesTypes } from "./lib/typeConstant";

class LittleBuddies {
  littleBuddies: {
    [username: string]: { [littleBuddyId: string]: LittleBuddy };
  } = {};

  constructor(private scene: Scene) {}

  createLittleBuddy = (
    username: string,
    littleBuddyId: string,
    littleBuddy: LittleBuddiesTypes,
  ) => {
    if (!this.littleBuddies[username]) {
      this.littleBuddies[username] = {};
    }

    this.littleBuddies[username][littleBuddyId] = new LittleBuddy(
      littleBuddyId,
      littleBuddy,
      this.scene,
    );
  };

  destroyLittleBuddy = (username: string, littleBuddyId: string) => {
    if (
      this.littleBuddies[username] &&
      this.littleBuddies[username][littleBuddyId]
    ) {
      delete this.littleBuddies[username][littleBuddyId];

      if (Object.keys(this.littleBuddies[username]).length === 0) {
        delete this.littleBuddies[username];
      }
    }
  };
}

export default LittleBuddies;
