const express = require("express");
const router = express.Router();

const { groupTriplesByProperty } = require("./dataHandler");
const { getSubjectAtVersion } = require("./TDBInterface");

router.get("/hello", (req, res) => {
  res.status(200).send("hello world");
});

//TODO implement
//get information about what versions are stored in database, and any prefixes used
router.get("/storeInfo", (req, res) => {});

//get versional materialisation at version

//get changes grouped by property for each version
router.get("/changes", async (req, res) => {
  try {
    const subject = req.query.subject;
    const versions = req.query.versions;

    //get changes for version range
    const changes = await groupTriplesByProperty(subject, versions);

    //get full triples for last version
    const finalVersion = await getSubjectAtVersion(
      subject,
      versions.slice(-1)[0]
    );

    res.status(200).send({ changes, finalVersion });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

module.exports = router;
