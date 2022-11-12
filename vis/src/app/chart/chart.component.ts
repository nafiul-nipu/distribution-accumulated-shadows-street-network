import { Component, AfterViewInit, Input } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements AfterViewInit {
  boxPlot: any;
  @Input() values:any;

  width:any; 
  height:any; 
  margin:any = 40;
  xScale:any;
  yScale:any;    
  seasons:any = ["Winter", "Summer", "Spring"]

  colorScale:any = d3.scaleOrdinal()
    .domain(this.seasons)
    .range(["#42718f", '#d95f02' ,'#1b9e77'])

  constructor() { }

  ngAfterViewInit(): void {
    //
    const divElement: HTMLElement | null = document.getElementById('chart');
    this.width = divElement?.offsetWidth;
    this.width = this.width - this.margin
    this.height = divElement?.offsetHeight;
    this.height = this.height - this.margin

    // console.log(this.width, this.height)

    this.xScale = d3.scaleBand()
      .range([5, this.width-20])
      .domain(this.seasons)
      .paddingInner(0.1)

    this.yScale = d3.scaleLinear()
      .range([this.height, 0])
      .domain([0, 720])

    this.boxPlot = d3.select("#chart").append('svg')
      .attr('class', 'box-svg')
      .attr('width', this.width+this.margin)
      .attr('height', this.height+this.margin)
  }

  updateValues(values: any) {
    //
    // console.log(values)
    if(values === undefined){
      d3.selectAll('g').remove()

    }else{
      d3.selectAll('g').remove()
      let group = this.boxPlot.append('g')
      .attr("transform", `translate(${this.margin},10)`)


      group.append('g').call(d3.axisBottom(this.xScale))
      .attr("transform", `translate(0,${this.height + 5})`)

      group.append('g').call(d3.axisLeft(this.yScale))

      // Show the main vertical line
      let boxgroup = group.append('g')
        .attr("transform", `translate(${this.margin},0)`)
      boxgroup.selectAll('verticalLines')
      .data(values)
      .enter()
      .append("line")
        .attr("x1", (d:any) => this.xScale(d.Key))
        .attr("x2", (d:any) => this.xScale(d.Key))
        .attr("y1", (d:any) => this.yScale(d.Value.min) )
        .attr("y2", (d:any) => this.yScale(d.Value.max) )
        .attr("stroke", "black")
        // .attr('width', this.xScale.bandwidth())

      // Show the box
      boxgroup.selectAll("boxes")
        .data(values)
        .enter()
        .append("rect")
            .attr("x", (d:any) =>this.xScale(d.Key)-this.xScale.bandwidth()/2)
            .attr("y", (d:any) =>this.yScale(d.Value.q3))
            .attr("height", (d:any) => this.yScale(d.Value.q1)-this.yScale(d.Value.q3))
            .attr("width", this.xScale.bandwidth() )
            .attr("stroke", "black")
            .style("fill", (d:any) => this.colorScale(d.Key))

      // Show the median
      boxgroup.selectAll("medianLines")
        .data(values)
        .enter()
        .append("line")
          .attr("x1", (d:any) => this.xScale(d.Key)-this.xScale.bandwidth()/2) 
          .attr("x2", (d:any) => this.xScale(d.Key)+this.xScale.bandwidth()/2) 
          .attr("y1", (d:any) => this.yScale(d.Value.median))
          .attr("y2", (d:any) => this.yScale(d.Value.median))
          .attr("stroke", "black")
          // .style("width", this.xScale.bandwidth())

      // Show the min
      boxgroup.selectAll("minLines")
        .data(values)
        .enter()
        .append("line")
          .attr("x1", (d:any) => this.xScale(d.Key)-this.xScale.bandwidth()/2) 
          .attr("x2", (d:any) => this.xScale(d.Key)+this.xScale.bandwidth()/2) 
          .attr("y1", (d:any) => this.yScale(d.Value.min))
          .attr("y2", (d:any) => this.yScale(d.Value.min))
          .attr("stroke", "black")
          // .style("width", this.xScale.bandwidth())

      // Show the max
      boxgroup.selectAll("maxLines")
        .data(values)
        .enter()
        .append("line")
          .attr("x1", (d:any) => this.xScale(d.Key)-this.xScale.bandwidth()/2) 
          .attr("x2", (d:any) => this.xScale(d.Key)+this.xScale.bandwidth()/2) 
          .attr("y1", (d:any) => this.yScale(d.Value.max))
          .attr("y2", (d:any) => this.yScale(d.Value.max))
          .attr("stroke", "black")
          // .style("width", this.xScale.bandwidth())
    }

  }

}
