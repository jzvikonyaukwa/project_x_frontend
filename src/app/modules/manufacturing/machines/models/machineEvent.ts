import { SteelCoil } from "../../../../shared/models/steelCoil";

export interface MachineEvent {
  id: number;
  eventType: string;
  cutsMade: number;
  totalMetersCut: number;
  loadedTime: Date;
  unloadedTime: Date;
  steelCoil: SteelCoil;
}
