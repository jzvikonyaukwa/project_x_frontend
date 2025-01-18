import { Finish } from "./finish";

export interface Color {
  id: number;
  color: string;
  cssColor: string;
  finish: Finish;
}
