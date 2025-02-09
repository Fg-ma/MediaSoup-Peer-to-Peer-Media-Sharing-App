import {
  tableContent,
  TableContentTypes,
  TableTopStaticMimeType,
} from "../typeConstant";
import { unlinkSync } from "fs";

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
    properties: (
      | {
          property: "url" | "dashURL";
          value: string;
        }
      | { property: "mimeType"; value: TableTopStaticMimeType }
    )[]
  ) => {
    if (!tableContent[table_id]) {
      tableContent[table_id] = {};
    }
    if (!tableContent[table_id][type]) {
      tableContent[table_id][type] = {};
    }
    if (!tableContent[table_id][type][contentId]) {
      tableContent[table_id][type][contentId] = {};
    }
    const tableContentData = tableContent[table_id][type][contentId];
    for (const property of properties) {
      tableContentData[property.property] = property.value as any;
    }
  };

  deleteContent = (
    table_id: string,
    type: TableContentTypes,
    contentId: string
  ) => {
    if (tableContent[table_id]?.[type]?.[contentId]) {
      const tableContentData = tableContent[table_id][type][contentId];

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
