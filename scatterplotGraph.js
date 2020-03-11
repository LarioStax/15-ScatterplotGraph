const URL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
let dataset;
let minSecArr = [];

function drawChart() {
	const width = 800;
	const height = 600;
	const padding = 60;
	const barWidth = (width-2*padding)/dataset.length;

	let legendData = [
		{
			"color": "rgba(0, 255, 0, 0.7)",
			"text": "No doping allegations!"
		},
		{
			"color": "rgba(255, 0, 0, 0.7)",
			"text": "Doping allegations!"
		}
	];

	let maxYear = d3.max(dataset, (d) => d.Year);
	let minYear = d3.min(dataset, (d) => d.Year);

	let highestTime = d3.max(dataset, (d) => d.Time);
	let highestOffset = new Date(highestTime);
	highestOffset.setSeconds(highestOffset.getSeconds() + 10)

	let lowestTime = d3.min(dataset, (d) => d.Time);
	let lowestOffset = new Date(lowestTime);
	lowestOffset.setSeconds(lowestOffset.getSeconds() - 10)

	let xScale = d3.scaleLinear()
		.domain([minYear-0.99, maxYear+1])
		.range([padding, width-padding])

	let yScale = d3.scaleLinear()
		.domain([highestOffset, lowestOffset])
		.range([height-padding, padding])

	let xAxis = d3.axisBottom(xScale)
			.tickSize(-height+2*padding)
			.tickSizeOuter(0)
			.tickFormat(d3.format("d"))
			.ticks(20);

	let yAxis = d3.axisLeft(yScale)
			.tickSize(-width + 2*padding)
			.tickSizeOuter(0)
			.tickFormat(d3.timeFormat("%M:%S"))
			.ticks(15);

	let tooltip = d3.select("body")
		.append("div")
			.style("opacity", 0)
			.attr("id", "tooltip")
			.style("position", "absolute")
			.style("background-color", "rgba(25, 25, 115,0.7)")
			.style("color", "white")
			.style("padding", "10px")
			.style("text-align", "left")

	function handleMouseOver(el) {
		tooltip
				.transition()
				.style("opacity", 0.8)
		tooltip
				.style("left", d3.event.pageX + 10 + "px")
				.style("top", d3.event.pageY + 10 + "px")
				.attr("data-year", el.Year)
				.html(
					`${el.Name}: ${el.Nationality}<br/>
					Year: ${el.Year}, Time: ${d3.timeFormat("%M:%S")(el.Time)}` 
					+
					(el.Doping ? "<br/><br/>" + el.Doping + "!" : "")
				)
		d3.select(this)
				.style("opacity", 0.5)
	}

	function handleMouseOut(el) {
		tooltip
				.transition()
				.style("opacity", 0)
		tooltip
				.style("left", "-1000px") //solves a bug (bug? or feature?) if you go to a dot under where tooltip used to be, it wouldn't open a new one
				.style("top", "-1000px") //still in the (now invisible) tooltip, so the mouseover doesn't activate, this moves it out of the way
		d3.select(this)
				.style("opacity", 1)
	}

	function handleMouseMove(el) {
		tooltip
				.style("left", d3.event.pageX + 10 + "px")
				.style("top", d3.event.pageY + 10 + "px")
	}

	function setCircleColor(d) {
		return d ? legendData[1].color : legendData[0].color;
	}

	let svg = d3.select("svg")
			.attr("width", width)
			.attr("height", height)
			.style("border", "none")
			.style("background-color", "rgb(65, 105, 225)")
			.style("border-radius", "2%")

	svg
		.append("g")
			.attr("id", "x-axis")
			.style("color", "white")
			.attr("transform", `translate(0, ${height-padding})`)
		.call(xAxis)
		.selectAll("text")
			.attr("transform", "rotate(-45)")
			.attr("dy", "0.5em")
			.attr("dx", "-1.7em")
			.style("font-size", "1.2em");

	svg
		.append("g")
			.attr("id", "y-axis")
			.style("color", "white")
			.attr("transform", `translate(${padding}, 0)`)
		.call(yAxis)

	svg
		.selectAll(".legend")
		.data(["x"]) //should this be done? :$ doesn't "feel" right! gets the job done tho
		.enter()
		.append("rect")
			.classed("legend", true)
			.style("position", "absolute")
			.attr("x", width/2+width/6)
			.attr("y", height-500)
			.attr("width", 200)
			.attr("height", 100)
			.attr("id", "legend")
			// .attr("stroke", "#ddd")
			.style("border-radius", "10%")
			.attr("fill", "rgba(25, 25, 115,0.7)")

	let legendGroup = svg.selectAll(".legendSymbol")
		.data(legendData)
		.enter()
		.append("g")

	legendGroup
		.append("circle")
			.classed("legendSymbol", true)
			.attr("r", 5)
			.attr("cx", width/2+width/6+15)
			.attr("cy", (d, i) => height-500+35+35*i)
			.attr("stroke", "#444")
			.attr("fill", (d, i) => legendData[i].color)
	legendGroup
		.append("text")
			.attr("x", width/2+width/6+15+20)
			.attr("y", (d, i) => height-500+35+35*i)
			.style("dominant-baseline", "middle")
			.attr("fill", "white")
			.text((d,i) => legendData[i].text)

	svg.selectAll("circle")
		.data(dataset)
		.enter()
		.append("circle")
			.classed("dot", true)
			.attr("data-xvalue", (d) => d.Year)
			.attr("data-yvalue", (d) => d.Time)
			.attr("cx", (d) => xScale(d.Year))
			.attr("cy", (d,i) => yScale(d.Time))
			.attr("r", 5)
			.attr("fill", (d) => setCircleColor(d.Doping))
			.attr("stroke", "#444")
			.on("mouseover", handleMouseOver)
			.on("mousemove", handleMouseMove)
			.on("mouseout", handleMouseOut)


	svg
		.append("text")
			.attr("transform","rotate(-90)")
			.attr("x", -padding)
			.attr("y", 20)
			.style("text-anchor", "end")
			.style("font-size", "1.2em")
			.attr("fill", "white")
			.text("Alpe D'Huez Time")
}

document.addEventListener("DOMContentLoaded", function() {
	let XHR = new XMLHttpRequest();
	XHR.onreadystatechange = function() {
		if (XHR.readyState === 4) {
			if (XHR.status === 200) {
				dataset = JSON.parse(XHR.responseText);
				dataset.forEach( (d) => {
					minSecArr = d.Time.split(":");
					d.Time = new Date(Date.UTC(1970, 0, 1, 0, minSecArr[0], minSecArr[1]));
				})
				console.log(dataset);
				drawChart();
			} else {
				console.log(`Something went wrong. Error: ${XHR.status}`)
			}
		}
	}
	XHR.open("GET", URL);
	XHR.send();
})