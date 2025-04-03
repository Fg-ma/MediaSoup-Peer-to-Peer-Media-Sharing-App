import { MongoClient, Db } from "mongodb";
import TableImages from "./lib/tableImages/TableImages";
import TableVideos from "./lib/tableVideos/TableVideos";
import TableSoundClips from "./lib/tableSoundClips/TableSoundClips";
import TableApplications from "./lib/tableApplications/TableApplications";
import TableText from "./lib/tableText/TableText";
import {
  onUpdateContentEffectsType,
  onUpdateContentPositioningType,
  onUpdateVideoPositionType,
} from "./typeConstant";
import TablesMeta from "./lib/tableMeta/TablesMeta";
import { StaticContentTypes } from "../../universal/typeConstant";
import UserImages from "./lib/userImages/UserImages";
import UserVideos from "./lib/userVideos/UserVideos";
import UserSoundClips from "./lib/userSoundClips/UserSoundClips";
import UserApplications from "./lib/userApplications/UserApplications";
import UserText from "./lib/userText/UserText";
import TableSvgs from "./lib/tableSvgs/TableSvgs";
import UserSvgs from "./lib/userSvgs/UserSvgs";
import {
  ApplicationEffectStylesType,
  ImageEffectStylesType,
  SvgEffectStylesType,
  VideoEffectStylesType,
} from "../../universal/effectsTypeConstant";

const uri = "mongodb://localhost:27017";
const dbName = "tableTopMongo";

class TableTopMongo {
  private client: MongoClient | undefined;
  private db: Db | undefined;

  tablesMeta: TablesMeta | undefined;
  tableImages: TableImages | undefined;
  tableVideos: TableVideos | undefined;
  tableSoundClips: TableSoundClips | undefined;
  tableApplications: TableApplications | undefined;
  tableText: TableText | undefined;
  tableSvgs: TableSvgs | undefined;
  userImages: UserImages | undefined;
  userVideos: UserVideos | undefined;
  userSoundClips: UserSoundClips | undefined;
  userApplications: UserApplications | undefined;
  userText: UserText | undefined;
  userSvgs: UserSvgs | undefined;

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

    this.tablesMeta = new TablesMeta(this.db);
    this.tableImages = new TableImages(this.db);
    this.tableVideos = new TableVideos(this.db);
    this.tableSoundClips = new TableSoundClips(this.db);
    this.tableApplications = new TableApplications(this.db);
    this.tableText = new TableText(this.db);
    this.tableSvgs = new TableSvgs(this.db);
    this.userImages = new UserImages(this.db);
    this.userVideos = new UserVideos(this.db);
    this.userSoundClips = new UserSoundClips(this.db);
    this.userApplications = new UserApplications(this.db);
    this.userText = new UserText(this.db);
    this.userSvgs = new UserSvgs(this.db);
  };

  deleteTableDocument = async (
    table_id: string,
    contentType: StaticContentTypes,
    contentId: string
  ) => {
    if (contentType === "image") {
      await this.tableImages?.deletes.deleteMetaDataBy_TID_IID(
        table_id,
        contentId
      );
    } else if (contentType === "svg") {
      await this.tableSvgs?.deletes.deleteMetaDataBy_TID_SID(
        table_id,
        contentId
      );
    } else if (contentType === "video") {
      await this.tableVideos?.deletes.deleteMetaDataBy_TID_VID(
        table_id,
        contentId
      );
    } else if (contentType === "application") {
      await this.tableApplications?.deletes.deleteMetaDataBy_TID_AID(
        table_id,
        contentId
      );
    } else if (contentType === "text") {
      await this.tableText?.deletes.deleteMetaDataBy_TID_XID(
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

  deleteUserDocument = async (
    user_id: string,
    contentType: StaticContentTypes,
    contentId: string
  ) => {
    if (contentType === "image") {
      await this.userImages?.deletes.deleteMetaDataBy_UID_IID(
        user_id,
        contentId
      );
    } else if (contentType === "video") {
      await this.userVideos?.deletes.deleteMetaDataBy_UID_VID(
        user_id,
        contentId
      );
    } else if (contentType === "application") {
      await this.userApplications?.deletes.deleteMetaDataBy_UID_AID(
        user_id,
        contentId
      );
    } else if (contentType === "text") {
      await this.userText?.deletes.deleteMetaDataBy_UID_XID(user_id, contentId);
    } else if (contentType === "soundClip") {
      await this.userSoundClips?.deletes.deleteMetaDataBy_UID_AID(
        user_id,
        contentId
      );
    } else if (contentType === "svg") {
      await this.userSvgs?.deletes.deleteMetaDataBy_UID_SID(user_id, contentId);
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
      case "svg":
        this.tableSvgs?.uploads.editMetaData(
          { table_id, svgId: contentId },
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
            effectStyles: effectStyles as ApplicationEffectStylesType,
          }
        );
        break;
      case "svg":
        this.tableSvgs?.uploads.editMetaData(
          { table_id, svgId: contentId },
          {
            effects,
            effectStyles: effectStyles as SvgEffectStylesType,
          }
        );
        break;
      default:
        break;
    }
  };

  updateVideoPosition = async (event: onUpdateVideoPositionType) => {
    const { table_id, contentId } = event.header;

    this.tableVideos?.uploads.editMetaData(
      { table_id, videoId: contentId },
      {
        videoPosition: event.data.videoPosition,
      }
    );
  };
}

export default TableTopMongo;
