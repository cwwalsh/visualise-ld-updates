/*
the functions in this file are intended to be edited to obtain a full query for the subject in the base "version 0" graph,
as well as delta materialiation queries in between each version after
*/

const { default: Axios, default: axios } = require("axios");

const QUERY_URL = "http://localhost:3030/data/sparql";

/**
 * Get triples added and deleted in each version
 * This function can be edited to reflect delta materialisation queries in other archiving tools and strategies, as long as the arguments
 * and returned output remains the same.
 * @param {string} subject - The subject to seach for - the s in an {s,p,o} query
 * @param {Array<int>} versions - array of version to return triples for
 * @returns {Array<Object>} object array in the form [{version: x, added: [added triples in version x], deleted: [deleted triples in version x]}]
 */
async function getChangesForSubject(subject, versions) {
  //construct query to obtain added and deleted versions of each version
  let fromConstruction = "";
  let result = [];
  for (const v of versions) {
    fromConstruction += `from named <http://example.org/added_${v}> from named <http://example.org/deleted_${v}>`;
    result.push({ version: v, added: [], deleted: [] });
  }
  const query = `select ?p ?o ?g ${fromConstruction} where { graph ?g { <${subject}> ?p ?o . } }`;
  const request = await Axios.get(`${QUERY_URL}?query=${encodeURI(query)}`);
  for (const triple of request.data.results.bindings) {
    const version = triple.g.value.match(/\d+$/);
    const versionObject = result.find(o => {
      return o.version == version[0];
    });
    if (triple.g.value.includes("added")) {
      versionObject.added.push({
        s: subject,
        p: triple.p.value,
        o: triple.o
      });
    } else {
      versionObject.deleted.push({
        s: subject,
        p: triple.p.value,
        o: triple.o
      });
    }
  }

  return result;
}

/**
 * Get full set of triples relating to a subject at a given version
 * This function can be edited to reflect version materialisation queries in other archiving tools and strategies, as long as the arguments
 * and returned output remains the same.
 * @param {string} subject - The subject to search for - s in an {s,p,o} query
 * @param {int} version - The version to get triples for
 * @returns {Array<Object>} - object array in the form [{s: subject, p: property, o: object}]
 */
async function getSubjectAtVersion(subject, version) {
  const query = `select ?p ?o from <http://example.org/${version}> where {<${subject}> ?p ?o .}`;
  const request = await axios.get(`${QUERY_URL}?query=${encodeURI(query)}`);
  const triples = request.data.results.bindings;

  for (const t of triples) {
    t.s = subject;
  }

  return triples;
}

module.exports = { getChangesForSubject, getSubjectAtVersion };
