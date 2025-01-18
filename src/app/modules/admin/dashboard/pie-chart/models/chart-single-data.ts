export class ChartSingleData {
  name: string;
  value: number;
  min: number;
  max: number;

  constructor(name?: string, value?: number, min?: number, max?: number) {
    if (name) {
      this.name = name;
    }
    if (value) {
      this.value = value;
    }
    if (min) {
      this.min = min;
    }
    if (max) {
      this.max = max;
    }
  }
}
