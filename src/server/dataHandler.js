const { getChangesForSubject } = require("./TDBInterface");

/**
 * Group triples by version and generate relative "heatmap" for rendering frontend
 */
async function groupTriplesByProperty(subject, versionNumbers) {
  const versions = await getChangesForSubject(subject, versionNumbers);

  let propertyGroups = {};
  //group triples by property
  for (const v of versions) {
    const versionNumber = v.version;
    for (const triple of v.added) {
      if (!propertyGroups[triple.p]) {
        propertyGroups[triple.p] = {
          relevantVersions: [versionNumber],
          values: [
            { version: versionNumber, object: triple.o, status: "added" }
          ]
        };
      } else {
        if (
          !propertyGroups[triple.p].relevantVersions.includes(versionNumber)
        ) {
          propertyGroups[triple.p].relevantVersions.push(versionNumber);
        }
        propertyGroups[triple.p].count++;
        propertyGroups[triple.p].values.push({
          version: versionNumber,
          object: triple.o,
          status: "added"
        });
      }
    }

    for (const triple of v.deleted) {
      if (!propertyGroups[triple.p]) {
        propertyGroups[triple.p] = {
          relevantVersions: [versionNumber],
          values: [
            { version: versionNumber, object: triple.o, status: "deleted" }
          ]
        };
      } else {
        if (
          !propertyGroups[triple.p].relevantVersions.includes(versionNumber)
        ) {
          propertyGroups[triple.p].relevantVersions.push(versionNumber);
        }
        propertyGroups[triple.p].values.push({
          version: versionNumber,
          object: triple.o,
          status: "deleted"
        });
      }
    }
  }

  return propertyGroups;
}

module.exports = { groupTriplesByProperty };
