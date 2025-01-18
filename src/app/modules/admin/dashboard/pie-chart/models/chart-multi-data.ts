import { ChartSingleData } from './chart-single-data';

export class ChartMultiData {
  name: string;
  series: Array<ChartSingleData>;

  constructor(name?: string, series?: Array<ChartSingleData>) {
    if (name) {
      this.name = name;
    }
    if (series) {
      this.series = series;
    }
  }
}
