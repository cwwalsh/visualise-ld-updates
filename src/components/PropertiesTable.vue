<template>
  <v-data-table
    id="changes-table"
    :headers="headers"
    :search="search"
    :items="tableChanges"
    height="65vh"
    fixed-header
    :item-class="rowBackgroundColor"
  >
    <template v-slot:top>
      <v-text-field v-model="search" label="Search" class="mx-4"></v-text-field>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: "PropertiesTable",
  data() {
    return {
      headers: [
        {
          text: "Property",
          align: "start",
          value: "property"
        },
        { text: "Object", value: "object" },
        { text: "Status", value: "status" },
        { text: "Version", value: "version" }
      ]
    };
  },
  props: ["changes", "search"],
  computed: {
    tableChanges: function() {
      let formattedChanges = [];
      for (const p in this.changes) {
        const prop = this.changes[p];

        for (const val of prop.values) {
          formattedChanges.push({
            property: p,
            object: val.object.value,
            status: val.status,
            version: val.version
          });
        }
      }
      return formattedChanges;
    },
    searchQuery: function() {
      return this.search;
    }
  },
  methods: {
    rowBackgroundColor: function(row) {
      return row.status == "added" ? "prop-added" : "prop-deleted";
    }
  }
};
</script>

<style>
.prop-added {
  background-color: #b3ffcc;
}
.prop-deleted {
  background-color: #ff8080;
}
</style>
