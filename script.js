// Selecting the SVG element and define dimensions and margins
const svg = d3.select("svg");
const margin = { top: 40, right: 20, bottom: 120, left: 60 };  // bottom was 80
const width = +svg.attr("width") - margin.left - margin.right;
const height = +svg.attr("height") - margin.top - margin.bottom;

// Appending group to contain the chart within margins
const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

// Setting up scales for X and Y axes
let x = d3.scaleBand().padding(0.1).range([0, width]);
let y = d3.scaleLinear().range([height, 0]);

// Appending axis groups
let xAxis = g.append("g").attr("transform", `translate(0,${height})`);
let yAxis = g.append("g");

// Adding Y-axis label (rotated)
svg.append("text")
  .attr("text-anchor", "middle")
  .attr("transform", `translate(${margin.left - 40}, ${height / 2 + margin.top}) rotate(-90)`)
  .text("Median Rent (AUD)");

// Adding X-axis label
svg.append("text")
  .attr("text-anchor", "middle")
  .attr("x", width / 2 + margin.left)
  .attr("y", height + margin.top + 100) // push lower
  .text("Suburb");

// Main function to update the graph based on selected quarter
function update(data, quarter) {
  const filtered = data.filter(d => d.Quarter === quarter);
  filtered.sort((a, b) => b.MedianRent - a.MedianRent); // Sort for better bar order

  // Top 20 suburbs only for readability
  x.domain(filtered.map(d => d.Suburb).slice(0, 20));  // limit to top 20 for readability
  y.domain([0, d3.max(filtered, d => d.MedianRent)]);

  // Rendering X Axis with rotated labels
  xAxis.transition().duration(750)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  // Rendering Y Axis
  yAxis.transition().duration(750).call(d3.axisLeft(y));

  // Binding data to bars
  const bars = g.selectAll(".bar").data(filtered.slice(0, 20), d => d.Suburb);

  // Exiting old elements
  bars.exit()
    .transition().duration(500)
    .attr("y", height)
    .attr("height", 0)
    .remove();

  // Updating existing elements
  bars.transition().duration(750)
    .attr("x", d => x(d.Suburb))
    .attr("y", d => y(d.MedianRent))
    .attr("height", d => height - y(d.MedianRent))
    .attr("width", x.bandwidth());

  // Entering new elements
  bars.enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.Suburb))
    .attr("y", height)
    .attr("height", 0)
    .attr("width", x.bandwidth())
    .attr("fill", "#69b3a2")
    .transition().duration(750)
    .attr("y", d => y(d.MedianRent))
    .attr("height", d => height - y(d.MedianRent));
}

// Loading external JSON and initializing the chart
d3.json("rental_data_2024.json").then(data => {
  data.forEach(d => d.MedianRent = +d.MedianRent); // Ensure numeric

  const select = d3.select("#quarterSelect");
  update(data, select.property("value"));

  // Event listener for the dropdown 
  select.on("change", () => {
    update(data, select.property("value"));
  });
});