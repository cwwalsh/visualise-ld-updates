<template>
  <v-container>
    <v-row align="start">
      <v-switch label="Labels" class="mt-0"></v-switch>
      <v-spacer></v-spacer>
      <v-btn>Back</v-btn>
    </v-row>
    <v-row>
      <div
        ref="graph-area"
        max-height="100%"
        max-width="100%"
        overflow="hidden"
      ></div>
    </v-row>
  </v-container>
</template>

<script>
import ForceGraph from "force-graph";
export default {
  name: "PropGraph",
  props: ["subject", "changes", "graph"],
  data: () => {
    return {
      RDFGraph: ForceGraph()
    };
  },
  watch: {
    graph: function() {
      this.$emit("loading", true);
      const graphNodes = this.formatTriplesForGraph();

      //5150000 to 16777215 represent numbers on this scale and convert
      //for each link, find corresponding value in changes and change colour corresponding to this

      this.RDFGraph(this.$refs["graph-area"])
        .width(window.innerWidth / 2)
        .height(window.innerHeight * 0.8)
        .graphData(graphNodes)
        .enableNodeDrag(false)
        .cooldownTime(500)
        .nodeId("id")
        .nodeVal("val")
        .nodeLabel("name")
        .linkSource("source")
        .linkTarget("target")
        .linkLabel("label")
        .nodeColor("color")
        .backgroundColor("#2b2d2f")
        // .linkColor("color")
        // eslint-disable-next-line no-unused-vars
        .onNodeClick((node, _) => {
          this.$emit("selectedProp", node.name.match(/.+?(?= =>)/)[0]);
        });

      this.RDFGraph.d3Force("center", null);

      this.RDFGraph.onEngineStop(() => {
        this.RDFGraph.zoomToFit(300);
        this.$emit("loading", false);
      });
    }
  },
  methods: {
    // generate a common node for the subject property
    formatTriplesForGraph: function() {
      this.versionCountsToColorValue(this.changes);
      const formattedGraph = {
        nodes: [
          {
            id: "subject",
            name: this.subject,
            val: 10
          }
        ],
        links: []
      };

      //for each triple in graph, create a node and link and link it back to the subject node
      for (const t in this.graph) {
        const triple = this.graph[t];
        formattedGraph.nodes.push({
          id: t,
          name: `${triple.p.value} => ${triple.o.value}`,
          val: 0.2,
          color: triple.color
        });
        formattedGraph.links.push({
          source: "subject",
          target: t,
          label: triple.p.value
          // color: triple.color
        });
      }

      return formattedGraph;
    },
    versionCountsToColorValue: function() {
      //get highest number of changes for a property
      const versionCounts = [];
      let highestCount = 0;
      for (const p in this.changes) {
        const prop = this.changes[p];
        versionCounts.push({
          prop: p,
          count: prop.relevantVersions.length
        });

        if (prop.relevantVersions.length > highestCount) {
          highestCount = prop.relevantVersions.length;
        }
      }

      const gradientStep = 100 / highestCount;

      // get hsv values of colour scale for each prop
      for (const ver of versionCounts) {
        const colourval = (ver.count - 1) * gradientStep;
        const h = Math.floor(((100 - colourval) * 120) / 100);
        const s = Math.abs(colourval - 50) / 50;
        const v = 1;
        ver.code = this.HSVToRGB(h, s, v);

        //apply colour value to each property in this.graph
        for (const t in this.graph) {
          if (this.graph[t].p.value == ver.prop) {
            this.graph[t].color = ver.code;
          }
        }
      }
    },
    HSVToRGB: function(h, s, v) {
      let rgb,
        i,
        data = [];
      if (s === 0) {
        rgb = [v, v, v];
      } else {
        h = h / 60;
        i = Math.floor(h);
        data = [
          v * (1 - s),
          v * (1 - s * (h - i)),
          v * (1 - s * (1 - (h - i)))
        ];
        switch (i) {
          case 0:
            rgb = [v, data[2], data[0]];
            break;
          case 1:
            rgb = [data[1], v, data[0]];
            break;
          case 2:
            rgb = [data[0], v, data[2]];
            break;
          case 3:
            rgb = [data[0], data[1], v];
            break;
          case 4:
            rgb = [data[2], data[0], v];
            break;
          default:
            rgb = [v, data[0], data[1]];
            break;
        }
      }
      return (
        "#" +
        rgb
          .map(function(x) {
            return ("0" + Math.round(x * 255).toString(16)).slice(-2);
          })
          .join("")
      );
    }
  }
};
</script>
