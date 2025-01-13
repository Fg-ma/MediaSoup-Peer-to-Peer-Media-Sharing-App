import {
  IncomingTableMessages,
  onUserJoinedTableType,
  onUserLeftTableType,
  TableColors,
} from "../../lib/TableSocketController";

class FgTableController {
  constructor(
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,
    private tableRef: React.RefObject<HTMLDivElement>,
    private setUserData: React.Dispatch<
      React.SetStateAction<{
        [username: string]: {
          color: TableColors;
          seat: number;
          online: boolean;
        };
      }>
    >,
    private aspectDir: React.MutableRefObject<"width" | "height">,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  getAspectDir = () => {
    if (!this.tableRef.current) {
      return;
    }

    if (
      this.tableRef.current.clientWidth >= this.tableRef.current.clientHeight
    ) {
      if (this.aspectDir.current !== "width") {
        this.aspectDir.current = "width";
        this.setRerender((prev) => !prev);
      }
    } else {
      if (this.aspectDir.current !== "height") {
        this.aspectDir.current = "height";
        this.setRerender((prev) => !prev);
      }
    }
  };

  handleTableMessage = (event: IncomingTableMessages) => {
    switch (event.type) {
      case "userJoinedTable":
        this.onUserJoinedTable(event);
        break;
      case "userLeftTable":
        this.onUserLeftTable(event);
        break;
      default:
        break;
    }
  };

  onUserJoinedTable = (event: onUserJoinedTableType) => {
    const { userData } = event.data;

    this.setUserData(userData);
  };

  onUserLeftTable = (event: onUserLeftTableType) => {
    const { userData } = event.data;

    this.setUserData(userData);
  };
}

export default FgTableController;
