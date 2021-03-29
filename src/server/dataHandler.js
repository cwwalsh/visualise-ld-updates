const { getChangesForSubject } = require("./TDBInterface");

/**
 * Group triples by version and generate relative "heatmap" for rendering frontend
 */
async function groupTriplesByProperty(subject, versionNumbers) {
  try {
    const versions = await getChangesForSubject(subject, versionNumbers);
    if (versions.error) {
      return versions;
    }

    let propertyGroups = {};
    //group triples by property
    for (const v of versions) {
      const versionNumber = v.version;
      for (const triple of v.added) {
        if (!propertyGroups[triple.p]) {
          propertyGroups[triple.p] = {
            relevantVersions: [versionNumber],
            values: [
              { version: versionNumber, object: triple.o, status: "Added" }
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
            status: "Added"
          });
        }
      }

      for (const triple of v.deleted) {
        if (!propertyGroups[triple.p]) {
          propertyGroups[triple.p] = {
            relevantVersions: [versionNumber],
            values: [
              { version: versionNumber, object: triple.o, status: "Deleted" }
            ]
          };
        } else {
          if (
            !propertyGroups[triple.p].relevantVersions.includes(versionNumber)
          ) {
            propertyGroups[triple.p].relevantVersions.push(versionNumber);
          }
          
          //check if any rather than deleted
          const addedValue = propertyGroups[triple.p].values.findIndex(
            value => {
              return (
                value.status === "Added" && value.version === versionNumber
              );
            }
          );

          let newStatus;
          if (addedValue === -1) {
            newStatus = "Deleted";
          } else {
            propertyGroups[triple.p].values.splice(addedValue, 1);
            newStatus = "Modified";
          }
          propertyGroups[triple.p].values.push({
            version: versionNumber,
            object: triple.o,
            status: newStatus
          });
        }
      }
    }

    return propertyGroups;
  } catch (e) {
    return { error: true, message: e };
  }
}

module.exports = { groupTriplesByProperty };
