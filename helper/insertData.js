const fs = require("fs");
const { promisify } = require("util");
const axios = require("axios");

const DIR = "/home/cwalsh/cb/current";

async function loadFiles(path) {
  const readdir = promisify(fs.readdir);
  const readFile = promisify(fs.readFile);
  const headers = { "Content-Type": "text/plain;charset=utf-8" };
  try {
    const contents = await readdir(path);
    for await (const file of contents) {
      // get graph name based on length and whether it is added or deleted
      let graphName;
      if (file.includes("added")) {
        if (file.length == 17) {
          graphName = file.slice(5, -5);
        } else {
          graphName = file.slice(5, -6);
        }
      }
      // graph is deleted
      else if (file.includes("deleted")) {
        if (file.length == 19) {
          graphName = file.slice(5, -5);
        } else {
          graphName = file.slice(5, -6);
        }
      }
      //else graph is a full version
      else {
        graphName = file.slice(0, -3);
      }
      const fileContents = await readFile(`${DIR}/${file}`, "utf-8");
      await axios.post(
        `http://localhost:3030/data?graph=http://example.org/${graphName}`,
        fileContents,
        { headers: headers }
      );
      console.log(`uploaded ${file}`);
    }

    return contents;
  } catch (e) {
    console.error(e);
    return "";
  }
}

loadFiles(DIR);
