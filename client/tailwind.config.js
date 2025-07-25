export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  media: false,
  mode: "jit",
  purge: ["./public/**/*.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "fg-white-95": "#F3F3F3",
        "fg-white-90": "#E6E6E6",
        "fg-white-85": "#D9D9D9",
        "fg-white-80": "#CCCCCC",
        "fg-white-75": "#BFBFBF",
        "fg-white-70": "#B3B3B3",
        "fg-white-65": "#A6A6A6",
        "fg-white-60": "#999999",
        "fg-white-55": "#8C8C8C",
        "fg-black-50": "#808080",
        "fg-black-45": "#737373",
        "fg-black-40": "#666666",
        "fg-black-35": "#595959",
        "fg-black-30": "#4D4D4D",
        "fg-black-25": "#404040",
        "fg-black-20": "#333333",
        "fg-black-15": "#262626",
        "fg-black-10": "#1A1A1A",
        "fg-black-5": "#0D0D0D",

        "fg-red-dark": "#b20203",
        "fg-red": "#d40213",
        "fg-red-light": "#e62833",

        "fg-orange-dark": "#e75707",
        "fg-orange": "#f6630f",
        "fg-orange-light": "#f97c02",

        "fg-white": "#f2f2f2",
        "fg-off-white": "#d6d6d6",

        "fg-tone-black-1": "#090909",
        "fg-tone-black-2": "#161616",
        "fg-tone-black-3": "#1a1a1a",
        "fg-tone-black-4": "#212121",
        "fg-tone-black-5": "#313131",
        "fg-tone-black-6": "#3e3e3e",
        "fg-tone-black-6.5": "#474747",
        "fg-tone-black-7": "#515151",
        "fg-tone-black-8": "#696969",

        "fg-table-table-top": "#d40213",
        "fg-table-pink": "#f77cf7",
        "fg-table-coral": "#f28a85",
        "fg-table-orange": "#f78528",
        "fg-table-yellow": "#e0c240",
        "fg-table-green": "#00763a",
        "fg-table-lime": "#bad95f",
        "fg-table-cyan": "#1a8ca2",
        "fg-table-light-blue": "#88c3e7",
        "fg-table-blue": "#1d69ca",
        "fg-table-navy": "#252c48",
        "fg-table-purple": "#d4afdc",
        "fg-table-black": "#221d1e",
        "fg-table-brown": "#5c423b",
        "fg-table-gray": "#6a5d5e",
        "fg-table-white": "#f6eded",
      },
      fontFamily: {
        Josefin: ["Josefin", "sans"],
        K2D: ["K2D", "sans"],
        B612Mono: ["B612Mono, monospace"],
      },
      backgroundSize: {
        125: "125%",
        150: "150%",
        175: "175%",
        200: "200%",
        225: "225%",
        250: "250%",
        350: "350%",
      },
      rotate: {
        225: "225deg",
        220: "220deg",
        20: "20deg",
      },
      spacing: {
        "-3.25": "-0.8125rem",
        0.125: "0.03125rem",
        0.25: "0.0625rem",
        1.25: "0.3125rem",
        3.5: "0.875rem",
        4.5: "1.125rem",
        6.5: "1.625rem",
      },
      maxWidth: {
        "1/4": "25%",
      },
      borderWidth: {
        3: "3px",
      },
      padding: {
        0.75: "0.1875rem",
        30: "6.5rem",
      },
      lineHeight: {
        3.5: "0.875rem",
        4.5: "1.125rem",
      },
      textUnderlineOffset: {
        6: "6px",
      },
      borderRadius: {
        1.5: "0.09375rem",
      },
      boxShadow: {
        FgSlider: "inset 0 0 2.5px rgba(0, 0, 0, 0.3)",
      },
      zIndex: {
        /* table layers before content (99000 - 100000) */
        "grid-overlay": 99200,
        "background-content": 99250,
        "table-babylon": 99275,
        "select-layer": 99300,
        "little-buddies-layer": 99400,
        /* table content (101000 - 200000) */
        /* table content formula (111000 + priority + (20000 - last-interaction)) */
        "base-content": 111000,
        /* table layers after content (200001 - 201000) */
        "new-instances-layer": 200700,
        "upload-layer": 200720,
        /* top level content (400000 - 500000) */
        scrollbar: 460000,
        "upload-tab": 460100,
        "panel-unfocused": 469800,
        "panel-focused-hover": 469900,
        "panel-focused-clicked": 470000,
        "table-info": 480000,
        modals: 490000,
        "settings-panel": 490100,
        "selection-button-panel": 490110,
        "hold-content": 499900,
        "popup-labels": 500000,
      },
      backgroundImage: {
        "table-top-gradient":
          "linear-gradient(135deg, #d40213 0%, #F56114 100%)",
      },
    },
  },
};
