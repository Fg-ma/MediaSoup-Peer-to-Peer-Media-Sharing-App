// ReloadTrackerPlugin.js
import { execSync } from "child_process";
import path from "path";

export default class ReloadTrackerPlugin {
  apply(compiler) {
    compiler.hooks.done.tap("ReloadTrackerPlugin", () => {
      try {
        execSync("node ./reload-tracker.js", {
          stdio: "inherit",
          cwd: path.resolve(process.cwd()),
        });
      } catch (err) {
        if (err.status === 100) {
          console.log("💥 Exiting dev server (will auto-restart)");
          process.exit(0);
        }
      }
    });
  }
}
