let graph_1_svg = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)
    .attr("height", graph_1_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

let graph_1_x = d3.scaleLinear()
    .range([0, graph_1_width - margin.left - margin.right]);

let graph_1_y = d3.scaleBand()
    .range([0, graph_1_height - margin.top - margin.bottom])
    .padding(0.1);

let graph_1_countRef = graph_1_svg.append("g");
let graph_1_y_axis_label = graph_1_svg.append("g");

let graph_1_y_axis_text = graph_1_svg.append("text")
    .attr("transform", `translate(-50, ${graph_1_height / 2 - margin.bottom})`)
    .style("text-anchor", "middle");

let graph_1_title = graph_1_svg.append("text")
    .attr("transform", `translate(${graph_1_width / 2 - margin.left}, -10)`)
    .style("text-anchor", "middle")
    .style("font-size", 15);

graph_1_svg.append("text")
    .attr("transform", `translate(${graph_1_width / 2 - margin.left}, ${graph_1_height - margin.bottom - 20})`)
    .style("text-anchor", "middle")
    .text("Sales (millions)");

let graph_1_setData = () => {
    d3.csv("/data/video_games.csv").then(data => {
        let year = parseInt(document.getElementById("year").value);
        data = graph_1_cleanData(
            data,
            (x, y) => parseFloat(y.Global_Sales) - parseFloat(x.Global_Sales),
            x => isNaN(year) ? true : x.Year == year,
            10
        );

        graph_1_x.domain([0, d3.max(data, d => parseFloat(d.Global_Sales))]);

        graph_1_y.domain(data.map(d => `${d.Name} (${d.Platform})`));

        graph_1_y_axis_label.transition()
            .duration(1000)
            .call(d3.axisLeft(graph_1_y).tickSize(0).tickPadding(0));

        let bars = graph_1_svg.selectAll("rect").data(data);

        let color = d3.scaleOrdinal()
            .domain(data.map(d => `${d.Name} (${d.Platform})`))
            .range(d3.quantize(d3.interpolateHcl(START_SHADE, END_SHADE), 10));

        bars.enter()
            .append("rect")
            .merge(bars)
            .attr("fill", d => color(`${d.Name} (${d.Platform})`))
            .transition()
            .delay((d, i) => i * 100)
            .duration(1000)
            .attr("x", graph_1_x(0))
            .attr("y", d => graph_1_y(`${d.Name} (${d.Platform})`))
            .attr("width", d => `${graph_1_x(d.Global_Sales)}px`)
            .attr("height", graph_1_y.bandwidth());

        let counts = graph_1_countRef.selectAll("text").data(data);

        counts.enter()
            .append("text")
            .merge(counts)
            .transition()
            .delay((d, i) => i * 100)
            .duration(1000)
            .attr("x", d => graph_1_x(d.Global_Sales) + 10)
            .attr("y", d => graph_1_y(`${d.Name} (${d.Platform})`) + 10)
            .style("text-anchor", "start")
            .text(d => d.Global_Sales);

        graph_1_title.text(`Top Video Game sales (${isNaN(year) ? "All Time" : year})`);

        counts.exit().remove();
        bars.exit().remove();
    });
}

let graph_1_cleanData = (data, comparator, filterer, numExamples) =>
    data.filter(filterer).sort(comparator).slice(0, numExamples);

graph_1_setData();

window.addEventListener("load", () => {
    document.getElementById("year-form").addEventListener("submit", e => {
        e.preventDefault();
        graph_1_setData();
    })
})