export {Graph,Graph2D};

class Graph2D
{
  #svg;
  #width;
  #height;
  #xScale;
  #yScale;
  #xAxis;
  #yAxis;
  #grid;
  #f;
  #points;

  constructor(htmlObj,width,height)
  {
    this.#width = width;
    this.#height = height;

    this.#svg = d3
    .select(htmlObj)
    .append("svg")
    .attr("width", this.#width)
    .attr("height", this.#height)
    .append("g")
    .attr("transform",
            "translate(" + 0 + "," + 0 + ")");
  }
  resize(width,height)
  {
    this.#width = width;
    this.#height = height;

    this.#svg.attr("width", width).attr("height", height);
    
    //Update the scales
    this.#xScale.range([0, this.#width]);
    this.#yScale.range([this.#height, 0]);

    

    if(this.#f)
      this.draw_function(this.#f);
    if(this.#points)
      this.draw_points(this.#points);

    this.#draw_axis();
  }
  add_scale({xMin,xMax,yMin,yMax})
  {

    //Add scales
    this.#xScale = d3
      .scaleLinear()
      .domain([xMin,xMax])
      .range([0, this.#width]);

    this.#yScale = d3
      .scaleLinear()
      .domain([yMin,yMax])
      .range([this.#height, 0]);

    this.#draw_axis();
  }
  #draw_axis()
  {
    //remove old axis
    this.#xAxis?.remove();
    this.#yAxis?.remove();

    // Create and asign axis
    this.#xAxis = this.#svg
      .append("g")
      .attr("transform", `translate(0, ${0})`)
      .call(d3.axisBottom(this.#xScale))

    this.#xAxis
      .selectAll(".tick").filter(d => this.#xScale.domain().includes(d)).remove();
    
    this.#yAxis = this.#svg
      .append("g")
      .attr("transform", `translate(${this.#width}, 0)`)
      .call(d3.axisLeft(this.#yScale))
      
    this.#yAxis
        .selectAll(".tick").filter(d => this.#xScale.domain().includes(d)).remove();

    // Change color of text

    this.#xAxis
      .selectAll("text")
      .style("fill", "#a6b6ca");

    this.#xAxis
      .selectAll("line")
      .style("stroke", "#a6b6ca");

    this.#yAxis
      .selectAll("text")
      .style("fill", "#a6b6ca");

    this.#yAxis
      .selectAll("line")
      .style("stroke", "#a6b6ca");
  }
  draw_points(points)
  {

    this.#points = points;

    //Remove old points
    this.#svg.selectAll(".point").remove();

    //Draw points
    this.#svg.selectAll(".point")
    .data(this.#points)
    .enter()
    .append("circle")
    .attr("class", "point")
    .attr("cx", (d) => this.#xScale(d.x))
    .attr("cy", (d) => this.#yScale(d.y))
    .attr("r",2 )
    .attr("fill", "#43EF44");
  }
  draw_function(f,stepAmount = 15,sampling = 4) 
  {
    this.#svg.selectAll(".graph-path").remove();

    this.#f = f;

    //Sample on function
    this.#grid = this.#create_grid(this.#f,sampling);

    //set color amounts
    let thresholds = d3.range(this.#grid.min, this.#grid.max,(this.#grid.max-this.#grid.min)/stepAmount);
    let color = d3.scaleLinear(d3.extent(thresholds), ["blue", "red"]);

    let contours = d3.contours()
      .size([this.#grid.n, this.#grid.m])
      .thresholds(thresholds)
      (this.#grid)
      .map(this.#transform);

      this.#svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#fff")
      .attr("stroke-opacity", 0.5)
      .selectAll("path")
      .data(contours)
      .join("path")
        .attr("class", "graph-path")
        .attr("fill", d => color(d.value))
        .attr("d", d3.geoPath());

    
      this.#draw_axis();

  }
  #create_grid(f,sampling){
    const q = sampling; // The level of detail, e.g., sample every 4 pixels in x and y.
    const x0 = -q / 2, x1 = this.#width + q;
    const y0 = -q / 2, y1 = this.#height + q;
    const n = Math.ceil((x1 - x0) / q);
    const m = Math.ceil((y1 - y0) / q);
    const grid = new Array(n * m);
    let min = Number.MAX_SAFE_INTEGER;
    let max = Number.MIN_SAFE_INTEGER;
    for (let j = 0; j < m; ++j) {
      for (let i = 0; i < n; ++i) {
        grid[j * n + i] = f(this.#xScale.invert(i * q + x0), (this.#yScale.invert(j * q + y0)));
        
        if(grid[j*n+i] < min)
          min = grid[j*n+i];
  
        if(grid[j*n+i] > max)
          max = grid[j*n+i];
      }
    }
    grid.x = -q;
    grid.y = -q;
    grid.k = q;
    grid.n = n;
    grid.m = m;
    grid.min = min;
    grid.max = max;
    return grid;
  }
  #transform = ({type, value, coordinates}) =>
  {
    return {type, value, coordinates: coordinates.map(rings => {
      return rings.map(points => {
        return points.map(([x, y]) => ([
          this.#grid.x + this.#grid.k * x,
          this.#grid.y + this.#grid.k * y
        ]));
      });
    })};
  }
}

class Graph
{
  #svg;
  #xScale;
  #yScale;
  #xAxis;
  #yAxis;
  #width;
  #height;
  #f;
  #points;
  #type;

  constructor(htmlObj,width,height,graphType)
  {
    this.#width = width;
    this.#height = height;
    this.#type = graphType;

    //Create graph
    this.#svg = d3
    .select(htmlObj)
    .append("svg")
    .attr("width", this.#width)
    .attr("height", this.#height)
    .append("g")
    .attr("transform",
          "translate(" + 0 + "," + 0 + ")");
  }
  add_scale({xMin,xMax,yMin,yMax})
  {

    //Add scales
    this.#xScale = d3
      .scaleLinear()
      .domain([xMin,xMax])
      .range([0, this.#width]);

    this.#yScale = d3
      .scaleLinear()
      .domain([yMin,yMax])
      .range([this.#height, 0]);

    this.#draw_axis();
  }
  #draw_axis()
  {
    //remove old axis
    this.#xAxis?.remove();
    this.#yAxis?.remove();

    // Create and asign axis
    this.#xAxis = this.#svg
      .append("g")
      .attr("transform", `translate(0, ${0})`)
      .call(d3.axisBottom(this.#xScale))
    this.#yAxis = this.#svg
      .append("g")
      .attr("transform", `translate(${this.#width}, 0)`)
      .call(d3.axisLeft(this.#yScale))

    //remove first and last number
    this.#xAxis
      .selectAll(".tick").filter(d => this.#xScale.domain().includes(d)).remove();
    this.#yAxis
      .selectAll(".tick").filter(d => this.#yScale.domain().includes(d)).remove();

    // Change color of text
    this.#xAxis
      .selectAll("text")
      .style("fill", "#a6b6ca");
    this.#xAxis
      .selectAll("line")
      .style("stroke", "#a6b6ca");
    this.#yAxis
      .selectAll("text")
      .style("fill", "#a6b6ca");
    this.#yAxis
      .selectAll("line")
      .style("stroke", "#a6b6ca");
  }
  resize(width,height)
  {
    this.#width = width;
    this.#height = height;

    this.#svg.attr("width", width).attr("height", height);
    
    //Update the scales
    this.#xScale.range([0, this.#width]);
    this.#yScale.range([this.#height, 0]);

    //Recreate axis
    this.#draw_axis()

    if(this.#f)
      this.draw_function(this.#f);
    if(this.#points)
      this.draw_points(this.#points);
  }
  draw_points(points)
  {
    //Set up points so we can refresh it on resize
    this.#points = points;

    if(this.#type === "Line")
      this.#draw_line_points(points);
    else if(this.#type === "Dotted")
      this.#draw_dotted_points(points);
  }
  #draw_dotted_points()
  {
    let data = this.#points.map((p) => (
      {
         x:p.x, y: this.#f(p.x)
      }));
    //Remove old points
    this.#svg.selectAll(".point").remove();

    //Draw points
    this.#svg.selectAll(".point")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "point")
    .attr("cx", (d) => this.#xScale(d.x))
    .attr("cy", (d) => this.#yScale(d.y))
    .attr("r", 2)
    .attr("fill", "red");

  }
  #draw_line_points()
  {
    this.#yScale.domain([d3.min(this.#points,p => p.y),
      d3.max(this.#points,p => p.y)]);
    
    this.#draw_axis();

    //Remove old path
    this.#svg.selectAll("path").remove();

    //Draw new path
    const line = d3
    .line()
    .x((d) => this.#xScale(d.x))
    .y((d) => this.#yScale(d.y))
    .curve(d3.curveMonotoneX);

    let path = this.#svg
    .append("path")
    .datum(this.#points)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 2)
    .attr("d", line);
  }
  draw_function(f,stepSize = 0.1)
  {
    if(this.#type === "Line")
      throw new Error("'Line' type graph shouldn\'t be drawing function," +
                      "if you want to draw function use 'Dotted' type graph");
    //Set up function so we can refresh it on resize
    this.#f = f;
    //Remove old function
    this.#svg.selectAll("path").remove();

    //Create points
    let gridPoints = d3.range(this.#xScale.domain()[0],this.#xScale.domain()[1]+stepSize, stepSize).map((x) => (
    {
        x, y: f(x)
    }));

    //Update scale and axis
    this.#yScale.domain([d3.min(gridPoints,p => p.y),
         d3.max(gridPoints,p => p.y)]);
    

    
    //Add lines between points
      const line = d3
      .line()
      .x((d) => this.#xScale(d.x))
      .y((d) => this.#yScale(d.y))
      .curve(d3.curveMonotoneX);

    //Create path
      let path = this.#svg
      .append("path")
      .datum(gridPoints)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

      //Recreate axis, because yScale was changed
      this.#draw_axis();
  }

}