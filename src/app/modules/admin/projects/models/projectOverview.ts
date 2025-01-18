import { Quote } from "../../quotes/models/quote";
import { Project } from "./project";

export interface ProjectOverview {
  project: Project;
  quotes: Quote[];
}
