const TEXT_MARGIN = 80;
let GENRE = "Sports";
let NUM = 7;

let graph_3_eheight = graph_3_height - margin.top - margin.bottom - TEXT_MARGIN;

let graph_3_svg = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width)
    .attr("height", graph_3_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

let graph_3_x = d3.scaleBand()
    .range([0, graph_3_width - margin.left - margin.right])
    .padding(0.1);

let graph_3_y = d3.scaleLinear()
    .range([graph_3_eheight, 0]);

let graph_3_x_axis = graph_3_svg.append("g")
    .attr("transform", `translate(0, ${graph_3_eheight})`);

let graph_3_y_axis = graph_3_svg.append("g")

let graph_3_title = graph_3_svg.append("text")
    .attr("transform", `translate(${graph_1_width / 2 - margin.left}, -10)`)
    .style("text-anchor", "middle")
    .style("font-size", 15);

graph_3_svg.append("text")
    .attr("transform", `translate(-50, ${graph_3_eheight / 2})rotate(-90)`)
    .style("text-anchor", "middle")
    .style("font-size", 15)
    .text("Total sales (millions)");

let graph_3_setData = (genre, num) => {
    d3.csv("/data/video_games.csv").then(data => {
        GENRE = genre, NUM = num;

        num = parseInt(num);
        num = isNaN(num) ? 7 : num;

        data = graph_3_cleanData(data, genre, num);

        graph_3_x.domain(data.map(d => d.Publisher));

        graph_3_y.domain([0, d3.max(data, d => d.Sales)]);

        graph_3_x_axis.transition()
            .duration(1000)
            .call(d3.axisBottom(graph_3_x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-30)")
            .style("text-anchor", "end");

        graph_3_y_axis.transition()
            .duration(1000)
            .call(d3.axisLeft(graph_3_y));

        let color = d3.scaleOrdinal()
            .domain(data.map(d => d.Publisher))
            .range(d3.quantize(d3.interpolateHcl(START_SHADE, END_SHADE), num));

        let tooltip = d3.select("body")
            .append("div")
            .attr("id", "tooltip")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px");

        let bars = graph_3_svg.selectAll("rect")
            .data(data);

        bars.enter()
            .append("rect")
            .on("mouseover",
                d => tooltip.style("opacity", 1)
                    .html(`${d.Publisher} sales:<br>${d.Sales.toFixed(2)} million`)
                    .style("border-color", color(d.Publisher))
            )
            .on("mousemove",
                () => tooltip.style("left", `${d3.event.pageX + 10}px`)
                    .style("top", `${d3.event.pageY + 10}px`)
            )
            .on("mouseout",
                () => tooltip.style("opacity", 0)
            )
            .merge(bars)
            .transition()
            .delay((d, i) => i * 50)
            .duration(1000)
            .attr("x", d => graph_3_x(d.Publisher))
            .attr("y", d => graph_3_y(d.Sales))
            .attr("width", graph_3_x.bandwidth())
            .attr("height", d => graph_3_eheight - graph_3_y(d.Sales))
            .attr("fill", d => color(d.Publisher));

        graph_3_title.text(`Top ${num} Video Game Publishers by Sales (${genre})`);

        bars.exit().remove();
    })
}

let graph_3_cleanData = (data, genre, num) => {
    data = data
        .filter(x => x.Genre == genre)
        .map(
            x => {
                return {
                    Publisher: x.Publisher,
                    Sales: parseFloat(x.Global_Sales)
                };
            }
        )
        .reduce(
            (x, y) => {
                if (!x[y.Publisher]) {
                    x[y.Publisher] = {
                        Publisher: y.Publisher,
                        Sales: y.Sales
                    }
                }
                else {
                    x[y.Publisher].Sales += y.Sales;
                }
                return x;
            },
            {}
        );

    return Object.values(data)
        .sort((x, y) => y.Sales - x.Sales)
        .slice(0, num);
}

graph_3_setData("Sports", 7);

window.addEventListener("load", () => {
    document.getElementById("count-form").addEventListener("submit", e => {
        e.preventDefault();
        graph_3_setData(GENRE, document.getElementById("count").value);
    })
})