<template>
  <v-app id="main">
    <v-app-bar color="primary" app>
      <v-toolbar-title class="white--text">
        Visualise Linked Data Updates
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn @click="sendMail">
        Contact
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-row>
        <v-col cols="4">
          <v-text-field
            v-model="subject"
            label="Subject Search"
            placeholder="http://dbpedia.org/resource/Donald_Trump"
            solo
            clearable
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-range-slider
            v-model="selectedVersions"
            label="Versions"
            ticks="always"
            :min="0"
            :max="19"
          >
            <template v-slot:prepend>
              <v-text-field
                :value="selectedVersions[0]"
                class="mt-0 pt-0"
                hide-details
                single-line
                type="number"
                style="width: 60px"
                @change="$set(selectedVersions, 0, $event)"
              ></v-text-field>
            </template>
            <template v-slot:append>
              <v-text-field
                :value="selectedVersions[1]"
                class="mt-0 pt-0"
                hide-details
                single-line
                type="number"
                style="width: 60px"
                @change="$set(selectedVersions, 1, $event)"
              ></v-text-field>
            </template>
          </v-range-slider>
        </v-col>
        <v-col cols="1">
          <v-btn
            id="search-button"
            @click="getChanges(subject, populateVersions(selectedVersions))"
          >
            Search for Subject
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <Graph
            v-bind:changes="changes"
            v-bind:subject="subject"
            v-bind:graph="finalVersion"
            v-on:selectedProp="searchForSelected"
          />
        </v-col>
        <v-col overflow="scroll">
          <PropertiesTable
            v-bind:changes="changes"
            v-bind:search="searchParameter"
          />
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script>
import Graph from "./components/Graph";
import PropertiesTable from "./components/PropertiesTable";

export default {
  data: () => {
    return {
      changes: {},
      finalVersion: {},
      subject: "http://dbpedia.org/resource/Donald_Trump",
      selectedVersions: [0, 5],
      // eslint-disable-next-line prettier/prettier
      availableVersions: [ 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19 ],
      searchParameter: ""
    };
  },
  computed: {
    minVersion: function() {
      return this.availableVersions[0];
    },
    maxVersion: function() {
      return this.availableVersions[-1];
    }
  },
  mounted() {
    this.getChanges(this.subject, this.populateVersions(this.selectedVersions));
  },
  methods: {
    sendMail: function() {
      window.location.href = "mailto:walshc67@tcd.ie";
    },
    getChanges: function(subject, versions) {
      this.$api
        .get("changes", {
          params: {
            subject: subject,
            versions: versions
          }
        })
        .then(response => {
          this.changes = response.data.changes;
          this.finalVersion = response.data.finalVersion;
        });
    },
    populateVersions: function([start, end]) {
      const versions = [];
      for (let i = start; i <= end; i++) {
        versions.push(i);
      }
      return versions;
    },
    searchForSelected: function(val) {
      console.log(val);
      this.searchParameter = val;
    }
  },
  components: {
    Graph,
    PropertiesTable
  }
};
</script>
