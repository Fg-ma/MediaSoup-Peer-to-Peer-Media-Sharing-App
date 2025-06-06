// reload-tracker.js
import fs from "fs";
const FILE = "./.reloadCount";
const LIMIT = 40;

let count = 0;
if (fs.existsSync(FILE)) {
  count = parseInt(fs.readFileSync(FILE, "utf8"), 10) || 0;
}

count++;

if (count >= LIMIT) {
  console.log(`🔁 Reload count reached ${count}. Restarting dev server...`);
  fs.writeFileSync(FILE, "0");
  process.exit(100); // special exit code
} else {
  fs.writeFileSync(FILE, count.toString());
}
