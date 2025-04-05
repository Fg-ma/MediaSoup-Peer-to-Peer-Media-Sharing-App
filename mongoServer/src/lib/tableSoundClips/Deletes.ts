import { Collection } from "mongodb";
import { TableSoundClipsType } from "./typeConstant";

class Deletes {
  constructor(
    private tableSoundClipsCollection: Collection<TableSoundClipsType>
  ) {}

  deleteMetaDataBy_TID_SID = async (table_id: string, soundClipId: string) => {
    try {
      await this.tableSoundClipsCollection.deleteOne({
        tid: table_id,
        sid: soundClipId,
      });
    } catch (err) {
      console.log(err);
    }
  };

  deleteInstanceBy_TID_SID_SIID = async (
    table_id: string,
    soundClipId: string,
    soundClipInstanceId: string
  ): Promise<null | TableSoundClipsType> => {
    try {
      const result = await this.tableSoundClipsCollection.findOneAndUpdate(
        {
          tid: table_id,
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
