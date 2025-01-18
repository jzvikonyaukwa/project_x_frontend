import { DateTime } from "luxon/src/datetime";

export interface MachineInformation {
  categoryId: number;
  machineId: number;
  width: number;
  name: string;
  description: string;
  icon: string;
  lastActivity: string;
}
