import {
  IncomingTableMessages,
  onKickedFromTableType,
  onSeatsMovedType,
  onSeatsSwapedType,
  onUserJoinedTableType,
  onUserLeftTableType,
  TableColors,
} from "../../serverControllers/tableServer/lib/typeConstant";
import { GroupSignals } from "../../context/signalContext/lib/typeConstant";

class TableController {
  constructor(
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
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private setTableSidePanelActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private sendGroupSignal: (signal: GroupSignals) => void,
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

  handleKeyDown = (event: KeyboardEvent) => {
    const tagName = document.activeElement?.tagName.toLowerCase();
    if (tagName === "input" || tagName === "textarea") return;

    switch (event.key.toLowerCase()) {
      case "s":
        if (event.shiftKey) {
          event.preventDefault();
          event.stopPropagation;

          this.setTableSidePanelActive((prev) => !prev);
          setTimeout(() => {
            this.sendGroupSignal({ type: "groupUpdate" });
            this.getAspectDir();
          }, 0);
        }
        break;
      default:
        break;
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
      case "seatsMoved":
        this.onSeatsMoved(event);
        break;
      case "seatsSwaped":
        this.onSeatsSwaped(event);
        break;
      case "kickedFromTable":
        this.onKickedFromTableType(event);
        break;
      default:
        break;
    }
  };

  private onUserJoinedTable = (event: onUserJoinedTableType) => {
    const { userData } = event.data;

    this.setUserData(userData);
  };

  private onUserLeftTable = (event: onUserLeftTableType) => {
    const { userData } = event.data;

    this.setUserData(userData);
  };

  private onSeatsMoved = (event: onSeatsMovedType) => {
    const { userData } = event.data;

    this.setUserData(userData);
  };

  private onSeatsSwaped = (event: onSeatsSwapedType) => {
    const { userData } = event.data;

    this.setUserData(userData);
  };

  private onKickedFromTableType = (event: onKickedFromTableType) => {
    const { userData } = event.data;

    this.setUserData(userData);
  };
}

export default TableController;
