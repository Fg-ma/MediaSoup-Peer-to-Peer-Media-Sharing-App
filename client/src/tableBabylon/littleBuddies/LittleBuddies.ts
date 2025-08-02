import TableBabylonScene from "../TableBabylonScene";
import LittleBuddy from "./lib/LittleBuddy";
import { LittleBuddiesTypes } from "./lib/typeConstant";

class LittleBuddies {
  constructor(private tableBabylonScene: TableBabylonScene) {}

  createLittleBuddy = (
    userId: string,
    littleBuddyId: string,
    littleBuddy: LittleBuddiesTypes,
  ) => {
    if (!this.tableBabylonScene.littleBuddies[userId]) {
      this.tableBabylonScene.littleBuddies[userId] = {};
    }

    this.tableBabylonScene.littleBuddies[userId][littleBuddyId] =
      new LittleBuddy(
        userId,
        littleBuddyId,
        littleBuddy,
        this.tableBabylonScene,
      );
  };

  destroyLittleBuddy = (userId: string, littleBuddyId: string) => {
    if (
      this.tableBabylonScene.littleBuddies[userId] &&
      this.tableBabylonScene.littleBuddies[userId][littleBuddyId]
    ) {
      delete this.tableBabylonScene.littleBuddies[userId][littleBuddyId];

      if (
        Object.keys(this.tableBabylonScene.littleBuddies[userId]).length === 0
      ) {
        delete this.tableBabylonScene.littleBuddies[userId];
      }
    }
  };
}

export default LittleBuddies;
