import { Client } from "../../clients/models/client";

export interface Project {
  id: number;
  name: string;
  client: Client;
}
