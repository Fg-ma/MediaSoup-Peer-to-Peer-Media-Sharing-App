import { Collection } from "mongodb";
import { TableApplicationsType } from "./typeConstant";

class Deletes {
  constructor(
    private tableApplicationsCollection: Collection<TableApplicationsType>
  ) {}

  deleteMetaDataBy_TID_AID = async (tableId: string, applicationId: string) => {
    try {
      await this.tableApplicationsCollection.deleteOne({
        tid: tableId,
        aid: applicationId,
      });
    } catch (err) {
      console.log(err);
    }
  };

  deleteInstanceBy_TID_AID_AIID = async (
    tableId: string,
    applicationId: string,
    applicationInstanceId: string
  ): Promise<null | TableApplicationsType> => {
    try {
      const result = await this.tableApplicationsCollection.findOneAndUpdate(
        {
          tid: tableId,
          aid: applicationId,
        },
        {
          $pull: {
            i: {
              aiid: applicationInstanceId,
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

      return result as TableApplicationsType;
    } catch (err) {
      console.log(err);
      return null;
    }
  };
}

export default Deletes;
