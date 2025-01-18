import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AgCharts } from "ag-charts-angular";
import { PieChartData } from "./models/pieChartData";

@Component({
  selector: "app-pie-chart",
  standalone: true,
  imports: [CommonModule, AgCharts],
  templateUrl: "./pie-chart.component.html",
})
export class PieChartComponent implements OnChanges {
  @Input() data: PieChartData[];
  @Input() title: string;
  @Input() units: string = "";
  public options;

  constructor() {
    this.options = {
      data: [],
      series: [],
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes.data && changes.data.currentValue) ||
      (changes.title && changes.title.currentValue)
    ) {
      this.createPieChart(this.data, this.title);
    }
  }

  createPieChart(data: PieChartData[], title: string) {
    this.options = {
      data: data,
      title: {
        text: title,
      },
      // theme: "default",
      series: [
        {
          type: "pie",
          angleKey: "value",
          legendItemKey: "name",
          sectorLabelKey: "value",
          sectorLabel: {
            color: "white",
            formatter: ({ value }) => `${value.toFixed(0)} ${this.units}`,
          },
        },
      ],
    };
  }
}
