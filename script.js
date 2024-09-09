var url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

var req = new XMLHttpRequest();

/* converting JSON into js object */
req.open("GET", url, true);
req.onload = () => {
  var obj = JSON.parse(req.responseText);
  baseTemperature = obj["baseTemperature"];
  values = obj["monthlyVariance"];
  console.log(baseTemperature);
  console.log(values);

  scales();
  cells();
  axes();
};

req.send();

var baseTemperature;
var data;
var values = [];
var xAxis;
var yAxis;
var xScale;
var yScale;
var minYear;
var maxYear;

var height = 500;
var width = 1200;
var padding = 80;

var svgContainer = d3.select("svg");
svgContainer.attr("width", width);
svgContainer.attr("height", height);

var scales = () => {
  minYear = d3.min(values, (item) => {
    return item["year"];
  });
  maxYear = d3.max(values, (item) => {
    return item["year"];
  });

  xScale = d3
    .scaleLinear()
    .domain([minYear, maxYear])
    .range([padding, width - padding]);
  yScale = d3
    .scaleTime()
    .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
    .range([padding, height - padding]);
};

var cells = () => {
  var tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("width", "auto")
    .style("height", "auto")
    .style("visibility", "hidden");

  svgContainer
    .selectAll("rect")
    .data(values)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("fill", (item) => {
      variance = item["variance"];
      if (variance <= -1) {
        return "SteelBlue";
      } else if (variance <= 0) {
        return "PowderBlue";
      } else if (variance <= 1) {
        return "Orange";
      } else {
        return "Tomato";
      }
    })
    .attr("data-year", (item) => {
      return item["year"];
    })
    .attr("data-month", (item) => {
      /* converting months, start count from 0 */
      return item["month"] - 1;
    })
    .attr("data-temp", (item) => {
      return item["variance"] + baseTemperature;
    })
    .attr("height", (height - 2 * padding) / 12)
    .attr("y", (item) => {
      return yScale(new Date(0, item["month"] - 1, 0, 0, 0, 0, 0));
    })
    .attr("width", (item) => {
      var numYear = maxYear - minYear;
      return (width - 2 * padding) / numYear;
    })
    .attr("x", (item) => {
      return xScale(item["year"]);
    })
    .on("mouseover", (value, item) => {
      tooltip
        .transition()
        .style("visibility", "visible")
        .style("left", event.pageX + 30 + "px")
        .style("top", event.pageY - 50 + "px");

      tooltip.text(
        item["year"] +
          "/" +
          item["month"] +
          " - " +
          "Temp: " +
          (item["variance"] + baseTemperature) +
          " (" +
          item["variance"] +
          ") "
      );
      tooltip.attr("data-year", item["year"]);
    })
    .on("mouseout", (item) => {
      tooltip.transition().style("visibility", "hidden");
    });
};

var axes = () => {
  xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  svgContainer
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", "translate(0, " + (height - padding) + ")");

  yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%B"));
  svgContainer
    .append("g")
    .call(yAxis)
    .attr("id", "y-axis")
    .attr("transform", "translate(" + padding + ", 0)");
};
