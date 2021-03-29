const fs = require("fs");
const { promisify } = require("util");
const axios = require("axios");

const DIR = "./current";

async function loadFiles(path) {
  const readdir = promisify(fs.readdir);
  const readFile = promisify(fs.readFile);
  const headers = { "Content-Type": "text/plain;charset=utf-8" };
  const versionList = [];
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
        versionList.push(graphName);
      }
      const fileContents = await readFile(`${DIR}/${file}`, "utf-8");
      await axios.post(
        `http://localhost:3030/data?graph=http://example.org/${graphName}`,
        fileContents,
        { headers: headers }
      );
      console.log(`uploaded ${file}`);
    }

    //push versions to a version graph
    let versionListGraph = "";
    for (const v of versionList) {
      versionListGraph = versionListGraph.concat(
        `<http://example.org/${v}> <http://example.org/versionNumber> "${v}"^^<http://www.w3.org/2001/XMLSchema#integer> .\n`
      );
    }

    await axios.post(
      `http://localhost:3030/data?graph=http://example.org/versions`,
      versionListGraph,
      { headers: headers }
    );

    return contents;
  } catch (e) {
    console.error(e);
    return "";
  }
}

loadFiles(DIR);
