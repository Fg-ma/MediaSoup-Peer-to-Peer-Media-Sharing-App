import { TableColors } from "../../serverControllers/tableServer/TableSocketController";

export const tableColorMap: {
  [tableColor in TableColors]: {
    name: string;
    primary: string;
    secondary: string;
    shadowColor: string;
  };
} = {
  tableTop: {
    name: "Table Top",
    primary: "#d40213",
    secondary: "#b10203",
    shadowColor: "rgba(212, 2, 19, 0.8)",
  },
  pink: {
    name: "Pink",
    primary: "#f77cf7",
    secondary: "#ed75d0",
    shadowColor: "rgba(247, 124, 247, 0.8)",
  },
  coral: {
    name: "Coral",
    primary: "#f28a85",
    secondary: "#f7423b",
    shadowColor: "rgba(242, 138, 133, 0.8)",
  },
  orange: {
    name: "Orange",
    primary: "#f78528",
    secondary: "#ef6900",
    shadowColor: "rgba(247, 133, 40, 0.8)",
  },
  yellow: {
    name: "Yellow",
    primary: "#e0c240",
    secondary: "#f7b705",
    shadowColor: "rgba(224, 194, 64, 0.8)",
  },
  green: {
    name: "Green",
    primary: "#00763a",
    secondary: "#123324",
    shadowColor: "rgba(0, 118, 58, 0.8)",
  },
  lime: {
    name: "Lime",
    primary: "#bad95f",
    secondary: "#a0c15c",
    shadowColor: "rgba(186, 217, 95, 0.8)",
  },
  cyan: {
    name: "Cyan",
    primary: "#1a8ca2",
    secondary: "#336b7b",
    shadowColor: "rgba(26, 140, 162, 0.8)",
  },
  lightBlue: {
    name: "Light blue",
    primary: "#88c3e7",
    secondary: "#61b4dd",
    shadowColor: "rgba(136, 195, 231, 0.8)",
  },
  blue: {
    name: "Blue",
    primary: "#1d69ca",
    secondary: "#1a1f6b",
    shadowColor: "rgba(29, 105, 202, 0.8)",
  },
  navy: {
    name: "Navy",
    primary: "#252c48",
    secondary: "#313246",
    shadowColor: "rgba(37, 44, 72, 0.8)",
  },
  purple: {
    name: "Purple",
    primary: "#d4afdc",
    secondary: "#987fdd",
    shadowColor: "rgba(212, 175, 220, 0.8)",
  },
  black: {
    name: "Black",
    primary: "#221d1e",
    secondary: "#0c0001",
    shadowColor: "rgba(34, 29, 30, 0.8)",
  },
  brown: {
    name: "Brown",
    primary: "#5c423b",
    secondary: "#372b27",
    shadowColor: "rgba(92, 66, 59, 0.8)",
  },
  gray: {
    name: "Gray",
    primary: "#6a5d5e",
    secondary: "#483f40",
    shadowColor: "rgba(106, 93, 94, 0.8)",
  },
  white: {
    name: "White",
    primary: "#f6eded",
    secondary: "#e0d8d8",
    shadowColor: "rgba(246, 237, 237, 0.8)",
  },
};
