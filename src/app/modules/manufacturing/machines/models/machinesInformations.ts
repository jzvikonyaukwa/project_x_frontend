import { DateTime } from "luxon";
import { MachineInformation } from "./machineInformation";

export const MACHINE_INFORMATION: MachineInformation[] = [
  {
    categoryId: 1,
    machineId: 1,
    width: 925,
    name: "Roofing Sheeting",
    description: "Double Roll-Forming",
    icon: "heroicons_outline:rocket-launch",
    lastActivity: getDateNow(),
  },
  {
    categoryId: 2,
    machineId: 2,
    width: 150,
    name: "Roof Purlin",
    description: "Purlins & Battens",
    icon: "heroicons_outline:square-3-stack-3d",
    lastActivity: getDateNow(),
  },
  {
    categoryId: 3,
    machineId: 2,
    width: 103,
    name: "Ceiling Batten",
    description: "Purlins & Battens",
    icon: "heroicons_outline:square-3-stack-3d",
    lastActivity: getDateNow(),
  },
  {
    categoryId: 4,
    machineId: 3,
    width: 182,
    name: "Framecad",
    description: "Framecad",
    icon: "heroicons_outline:cpu-chip",
    lastActivity: getDateNow(),
  },
];

function getDateNow() {
  return DateTime.now().startOf("day").minus({ day: 1 }).toISO();
}
