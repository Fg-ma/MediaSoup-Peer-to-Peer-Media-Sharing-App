import { MongoClient, Db } from "mongodb";
import TableImages from "./lib/images/TableImages";
import TableVideos from "./lib/videos/TableVideos";
import TableSoundClips from "./lib/soundClips/TableSoundClips";
import TableApplications from "./lib/applications/TableApplications";
import TableText from "./lib/text/TableText";
import {
  onUpdateContentEffectsType,
  onUpdateContentPositioningType,
  TableContentTypes,
} from "../typeConstant";
import { ImageEffectStylesType } from "./lib/images/typeConstant";
import { VideoEffectStylesType } from "./lib/videos/typeConstant";

const uri = "mongodb://localhost:27017";
const dbName = "tableTopMongo";

class TableTopMongo {
  private client: MongoClient | undefined;
  private db: Db | undefined;

  tableImages: TableImages | undefined;
  tableVideos: TableVideos | undefined;
  tableSoundClips: TableSoundClips | undefined;
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
    this.tableSoundClips = new TableSoundClips(this.db);
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
    } else if (contentType === "soundClip") {
      await this.tableSoundClips?.deletes.deleteMetaDataBy_TID_AID(
        table_id,
        contentId
      );
    }
  };

  updateContentPositioning = async (event: onUpdateContentPositioningType) => {
    const { table_id, contentType, contentId } = event.header;
    const { positioning } = event.data;

    switch (contentType) {
      case "image":
        this.tableImages?.uploads.editMetaData(
          { table_id, imageId: contentId },
          {
            positioning,
          }
        );
        break;
      case "video":
        this.tableVideos?.uploads.editMetaData(
          { table_id, videoId: contentId },
          {
            positioning,
          }
        );
        break;
      case "text":
        this.tableText?.uploads.editMetaData(
          { table_id, textId: contentId },
          {
            positioning,
          }
        );
        break;
      case "soundClip":
        this.tableSoundClips?.uploads.editMetaData(
          { table_id, soundClipId: contentId },
          {
            positioning,
          }
        );
        break;
      case "application":
        this.tableApplications?.uploads.editMetaData(
          { table_id, applicationId: contentId },
          {
            positioning,
          }
        );
        break;
      default:
        break;
    }
  };

  updateContentEffects = async (event: onUpdateContentEffectsType) => {
    const { table_id, contentType, contentId } = event.header;
    const { effects, effectStyles } = event.data;

    switch (contentType) {
      case "image":
        this.tableImages?.uploads.editMetaData(
          { table_id, imageId: contentId },
          {
            effects,
            effectStyles: effectStyles as ImageEffectStylesType,
          }
        );
        break;
      case "video":
        this.tableVideos?.uploads.editMetaData(
          { table_id, videoId: contentId },
          {
            effects,
            effectStyles: effectStyles as VideoEffectStylesType,
          }
        );
        break;
      case "text":
        this.tableText?.uploads.editMetaData(
          { table_id, textId: contentId },
          {
            effects,
            effectStyles,
          }
        );
        break;
      case "soundClip":
        this.tableSoundClips?.uploads.editMetaData(
          { table_id, soundClipId: contentId },
          {
            effects,
          }
        );
        break;
      case "application":
        this.tableApplications?.uploads.editMetaData(
          { table_id, applicationId: contentId },
          {
            effects,
            effectStyles,
          }
        );
        break;
      default:
        break;
    }
  };
}

export default TableTopMongo;
