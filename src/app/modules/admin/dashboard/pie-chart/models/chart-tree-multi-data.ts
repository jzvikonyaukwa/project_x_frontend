import { ChartTreeSingleData } from './chart-tree-single-data';

export class ChartTreeMultiData {
  name: string;
  children: Array<ChartTreeSingleData>;

  constructor(name?: string, children?: Array<ChartTreeSingleData>) {
    if (name) {
      this.name = name;
    }
    if (children) {
      this.children = children;
    }
  }
}
