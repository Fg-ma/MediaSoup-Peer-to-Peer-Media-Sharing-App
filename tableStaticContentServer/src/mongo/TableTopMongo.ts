import { MongoClient, Db } from "mongodb";
import TableImages from "./lib/images/TableImages";
import { TableContentTypes } from "src/typeConstant";
import TableVideos from "./lib/videos/TableVideos";
import TableAudio from "./lib/audio/TableAudio";
import TableApplications from "./lib/applications/TableApplications";
import TableText from "./lib/text/TableText";

const uri = "mongodb://localhost:27017";
const dbName = "tableTopMongo";

class TableTopMongo {
  private client: MongoClient | undefined;
  private db: Db | undefined;

  tableImages: TableImages | undefined;
  tableVideos: TableVideos | undefined;
  tableAudio: TableAudio | undefined;
  tableApplications: TableApplications | undefined;
  tableText: TableText | undefined;

  constructor() {
    this.getDbConnection();
  }

  destructor = () => {
    this.client?.close();
  };

  private getDbConnection = async () => {
    this.client = new MongoClient(uri);

    await this.client.connect();

    this.db = this.client.db(dbName);

    this.tableImages = new TableImages(this.db);
    this.tableVideos = new TableVideos(this.db);
    this.tableAudio = new TableAudio(this.db);
    this.tableApplications = new TableApplications(this.db);
    this.tableText = new TableText(this.db);
  };

  deleteDocument = async (
    table_id: string,
    contentType: TableContentTypes,
    contentId: string
  ) => {
    if (contentType === "image") {
      await this.tableImages?.deletes.deleteMetaDataBy_TID_IID(
        table_id,
        contentId
      );
    } else if (contentType === "video") {
      await this.tableVideos?.deletes.deleteMetaDataBy_TID_VID(
        table_id,
        contentId
      );
    } else if (contentType === "audio") {
      await this.tableAudio?.deletes.deleteMetaDataBy_TID_AID(
        table_id,
        contentId
      );
    }
  };
}

export default TableTopMongo;
