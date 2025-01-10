import uWS from "uWebSockets.js";
import fs from "fs";
import path from "path";
import { processedDir } from "./posts";

const handleGets = (app: uWS.TemplatedApp) => {
  app.get("/processed/*", (res, req) => {
    const requestedFile = req.getUrl().substring("/processed/".length);
    const filePath = path.join(processedDir, requestedFile);

    res.cork(() => {
      res.writeHeader("Access-Control-Allow-Origin", "https://localhost:8080");
      res.writeHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.writeHeader("Access-Control-Allow-Headers", "Content-Type");
    });

    if (fs.existsSync(filePath)) {
      const fileStream = fs.createReadStream(filePath);
      res.writeHeader("Content-Type", "application/dash+xml"); // Set for .mpd files

      fileStream.on("data", (chunk) => res.write(chunk));
      fileStream.on("end", () => res.end());
      fileStream.on("error", (err) => {
        console.error("Error reading file:", err);
        res.writeStatus("500 Internal Server Error").end("Error reading file.");
      });
    } else {
      res.writeStatus("404 Not Found").end("File not found.");
    }
  });
};

export default handleGets;
