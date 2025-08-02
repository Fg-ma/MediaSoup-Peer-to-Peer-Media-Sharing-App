import { Collection } from "mongodb";
import { TableSoundClipsType } from "./typeConstant";

class Deletes {
  constructor(
    private tableSoundClipsCollection: Collection<TableSoundClipsType>
  ) {}

  deleteMetadataBy_TID_SID = async (tableId: string, soundClipId: string) => {
    try {
      await this.tableSoundClipsCollection.deleteOne({
        tid: tableId,
        sid: soundClipId,
      });
    } catch (err) {
      console.log(err);
    }
  };

  deleteInstanceBy_TID_SID_SIID = async (
    tableId: string,
    soundClipId: string,
    soundClipInstanceId: string
  ): Promise<null | TableSoundClipsType> => {
    try {
      const result = await this.tableSoundClipsCollection.findOneAndUpdate(
        {
          tid: tableId,
          sid: soundClipId,
        },
        {
          $pull: {
            i: {
              siid: soundClipInstanceId,
            },
          },
        },
        {
          returnDocument: "after",
        }
      );

      if (!result) {
        return null;
      }

      return result as TableSoundClipsType;
    } catch (err) {
      console.log(err);
      return null;
    }
  };
}

export default Deletes;
