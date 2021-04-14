<template>
  <v-container>
    <v-row align="start">
      <v-btn @click="redrawGraph()" class="mb-1">Reset</v-btn>
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
  data() {
    return {
      RDFGraph: ForceGraph(),
      graphNodes: []
    };
  },
  watch: {
    graph: function() {
      this.graphNodes = this.formatTriplesForGraph();
      this.drawGraph();
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
            val: 10,
            color: "#1976D2"
          }
        ],
        links: []
      };

      //for each triple in graph, create a node and link and link it back to the subject node
      for (const t in this.graph) {
        const triple = this.graph[t];

        //check through changes and add sub properties to graph object with version and object
        const changesForTriple = this.changes[triple.prop];
        if (changesForTriple) {
          if (changesForTriple.relevantVersions.length > 0) {
            triple.childNodes = [];
            triple.childLinks = [];

            for (const v in changesForTriple.values) {
              const currentVal = changesForTriple.values[v];
              const childId = `${t}-${v}`;
              const objectName = currentVal.object.value.split("/").slice(-1);
              let color = "";
              switch (currentVal.status) {
                case "Added":
                  color = "#b3ffcc";
                  break;
                case "Deleted":
                  color = "#ff8080";
                  break;
                case "Modified":
                  color = "#78faf4";
                  break;
                default:
                  color = "#1976d2";
                  break;
              }
              triple.childNodes.push({
                id: childId,
                name: `V${currentVal.version} - ${objectName[0]}`,
                val: 0.2,
                color: color,
                isChild: true
              });
              triple.childLinks.push({
                source: t,
                target: childId,
                color: "white"
              });
            }
          }
        }

        //get just name of property cutting off the prefix
        const propertyName = triple.prop.split("/").slice(-1);
        formattedGraph.nodes.push({
          id: t,
          name: propertyName,
          val: 0.2,
          color: triple.color ? triple.color : "#1976D2",
          collapsed: true,
          childNodes: triple.childNodes,
          childLinks: triple.childLinks,
          fullProperty: triple.prop
        });

        formattedGraph.links.push({
          source: "subject",
          target: t
        });
      }

      return formattedGraph;
    },
    versionCountsToColorValue: function() {
      //5150000 to 16777215 represent numbers on this scale and convert
      //for each link, find corresponding value in changes and change colour corresponding to this

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
          if (this.graph[t].prop == ver.prop) {
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
    },
    redrawGraph: async function() {
      this.graphNodes = this.formatTriplesForGraph();
      this.drawGraph();
    },
    drawGraph: function() {
      this.$emit("loading", true);

      this.RDFGraph(this.$refs["graph-area"])
        .width(window.innerWidth / 2)
        .height(window.innerHeight * 0.74)
        .graphData(this.graphNodes)
        .enableNodeDrag(false)
        .cooldownTime(500)
        .nodeId("id")
        .nodeColor("color")
        .nodeLabel("name")
        .nodeCanvasObject((node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(
            n => n + fontSize * 0.2
          );

          ctx.fillStyle = "rgba(43, 45, 47, 1)";
          ctx.fillRect(
            node.x - bckgDimensions[0] / 2,
            node.y - bckgDimensions[1] / 2,
            ...bckgDimensions
          );

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = node.color;
          ctx.fillText(label, node.x, node.y);

          node.__bckgDimensions = bckgDimensions;
        })
        .nodePointerAreaPaint((node, color, ctx) => {
          ctx.fillStyle = color;
          const bckgDimensions = node.__bckgDimensions;
          bckgDimensions &&
            ctx.fillRect(
              node.x - bckgDimensions[0] / 2,
              node.y - bckgDimensions[1] / 2,
              ...bckgDimensions
            );
        })
        .nodeVal("val")
        .linkSource("source")
        .linkTarget("target")
        .linkLabel("label")
        .backgroundColor("#2b2d2f")
        // .linkVisibility(false)
        // eslint-disable-next-line no-unused-vars
        .onNodeClick((node, _) => {
          console.log(node);
          node.collapsed = !node.collapsed;
          if (!node.isChild) {
            this.$emit("selectedProp", node.fullProperty);
          }
          this.getVisibleNodes(node);
        });

      this.RDFGraph.d3Force("center", null);

      setTimeout(() => {
        this.RDFGraph.zoomToFit(300);
      }, 2000);

      this.$emit("loading", false);
    },
    getVisibleNodes: function(node) {
      if (node.childNodes) {
        if (!node.collapsed && node.childNodes) {
          //add child nodes to visualisation
          this.graphNodes.nodes = this.graphNodes.nodes.concat(node.childNodes);
          this.graphNodes.links = this.graphNodes.links.concat(node.childLinks);

          //zoom to selected node
          this.RDFGraph.graphData(this.graphNodes);
          setTimeout(() => {
            this.RDFGraph.centerAt(node.x, node.y, 3000);
            this.RDFGraph.zoom(4, 1000);
          }, 1000);
        } else {
          //remove child nodes from visualisation
          this.graphNodes.nodes = this.graphNodes.nodes.filter(
            n => !node.childNodes.includes(n)
          );
          this.graphNodes.links = this.graphNodes.links.filter(
            l => !node.childLinks.includes(l)
          );

          //zoom to centre
          this.RDFGraph.graphData(this.graphNodes);
          setTimeout(() => {
            this.RDFGraph.zoomToFit(300);
          }, 1000);
        }
      }
    }
  }
};
</script>
