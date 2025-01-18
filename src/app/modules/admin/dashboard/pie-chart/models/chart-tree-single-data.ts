export class ChartTreeSingleData {
  name: string;
  size: number;

  constructor(name?: string, size?: number) {
    if (name) {
      this.name = name;
    }
    if (size) {
      this.size = size;
    }
  }
}
