let graph_2_svg = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_2_width)
    .attr("height", graph_2_height)
    .append("g")
    .attr("transform", `translate(${graph_2_width / 2}, ${graph_2_height / 2})`);


let graph_2_radius = Math.min(graph_2_width, graph_2_height) / 2 - margin.top - 10;

let graph_2_setData = region => {
    d3.csv("/data/video_games.csv").then(data => {
        data = graph_2_cleanData(data, region);

        let color = d3.scaleOrdinal()
            .domain(data.map(d => d.Genre))
            .range(d3.quantize(d3.interpolateHcl(START_SHADE, END_SHADE), 5));

        let pie = d3.pie()
            .value(d => d.value.Sales)
            .sort((x, y) => d3.ascending(x.value.Genre, y.value.Genre));

        let pie_data = pie(d3.entries(data));

        let pie_svg = graph_2_svg.selectAll("path").data(pie_data);

        pie_svg.enter()
            .append("path")
            .merge(pie_svg)
            .transition()
            .duration(1000)
            .attr("d", d3.arc()
                .innerRadius(0)
                .outerRadius(graph_2_radius)
            )
            .attr("fill", d => color(d.data.value.Genre))
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .style("opacity", 1);

        let counts = graph_2_svg.selectAll("text").data(pie_data);

        counts.enter()
            .append("text")
            .merge(counts)
            .transition()
            .duration(1000)
            .text(d => `${d.data.value.Genre}: ${d.data.value.Sales.toFixed(0)}`)
            .attr("transform", d => `translate(${d3.arc().innerRadius(0).outerRadius(graph_2_radius).centroid(d)})`)
            .style("text-anchor", "middle")
            .style("font-size", 14);

        graph_2_svg.append("text")
            .attr("transform", `translate(0, ${-graph_2_height / 2 + margin.top})`)
            .style("text-anchor", "middle")
            .style("font-size", 15)
            .text(`Top 5 Best-Selling Genres (${region.replace("_", " ")}) (millions)`);

        pie_svg.exit().remove();
        counts.exit().remove();
    })
}

let graph_2_cleanData = (data, region) => {
    data = data
        .map(
            x => {
                return {
                    Genre: x.Genre,
                    Sales: parseFloat(x[region])
                };
            }
        )
        .reduce(
            (x, y) => {
                if (!x[y.Genre]) {
                    x[y.Genre] = {
                        Genre: y.Genre,
                        Sales: y.Sales
                    }
                }
                else {
                    x[y.Genre].Sales += y.Sales;
                }
                return x;
            },
            {}
        );

    return Object.values(data)
        .sort((x, y) => y.Sales - x.Sales)
        .slice(0, 5);
}

graph_2_setData("Global_Sales");