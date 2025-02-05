import { tableContent, TableContentTypes } from "../typeConstant";
import { unlinkSync } from "fs";
import { processedDir, uploadsDir } from "../posts/posts";

class TableContentController {
  constructor() {}

  private getFilename = (input: string): string => {
    const lastSlashIndex = input.lastIndexOf("/");
    if (lastSlashIndex === -1) {
      return input;
    }
    return input.substring(lastSlashIndex + 1);
  };

  setContent = (
    table_id: string,
    type: TableContentTypes,
    contentId: string,
    properties: {
      property: "originalURL" | "dashURL";
      value: string;
    }[]
  ) => {
    if (!tableContent[table_id]) {
      tableContent[table_id] = {};
    }
    if (!tableContent[table_id][type]) {
      tableContent[table_id][type] = {};
    }
    if (!tableContent[table_id][type][contentId]) {
      tableContent[table_id][type][contentId] = {
        originalURL: undefined,
        dashURL: undefined,
      };
    }
    const tableContentData = tableContent[table_id][type][contentId];
    for (const property of properties) {
      tableContentData[property.property] = property.value;
    }
  };

  deleteContent = (
    table_id: string,
    type: TableContentTypes,
    contentId: string
  ) => {
    if (tableContent[table_id]?.[type]?.[contentId]) {
      const tableContentData = tableContent[table_id][type][contentId];
      if (tableContentData.originalURL) {
        const filename = this.getFilename(tableContentData.originalURL);
        unlinkSync(`${uploadsDir}/${filename}`);
      }
      if (tableContentData.dashURL) {
        const filename = this.getFilename(tableContentData.dashURL).slice(
          0,
          -4
        );
        unlinkSync(`${processedDir}/${filename}.mpd`);
        unlinkSync(`${processedDir}/${filename}_500k.mp4`);
        unlinkSync(`${processedDir}/${filename}_1M.mp4`);
        unlinkSync(`${processedDir}/${filename}_2M.mp4`);
        unlinkSync(`${processedDir}/${filename}_audio.mp4`);
      }

      delete tableContent[table_id][type][contentId];

      if (Object.keys(tableContent[table_id][type]).length === 0) {
        delete tableContent[table_id][type];

        if (Object.keys(tableContent[table_id]).length === 0) {
          delete tableContent[table_id];
        }
      }
    }
  };
}

export default TableContentController;
