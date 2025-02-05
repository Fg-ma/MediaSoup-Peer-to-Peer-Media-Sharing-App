import uWS from "uWebSockets.js";
import fs from "fs";
import { tableTopCeph } from "../index";

const handleGets = (app: uWS.TemplatedApp) => {
  app.get("/stream/:key", async (res, req) => {
    const key = req.getParameter(0);

    if (!key) return;

    res.cork(() => {
      res.writeHeader("Access-Control-Allow-Origin", "https://localhost:8080");
      res.writeHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.writeHeader("Access-Control-Allow-Headers", "Content-Type");
    });

    try {
      await tableTopCeph.streamFileToClient("mybucket", key, res);
    } catch (error) {
      res
        .writeStatus("500 Internal Server Error")
        .end("Failed to stream file.");
    }
  });
};

export default handleGets;
