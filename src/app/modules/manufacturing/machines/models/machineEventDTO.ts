export interface MachineEventDTO {
  id: number;
  cutsMade: number;
  machineId: number;
  steelCoilId: number;
  totalMetersCut: number;
  loadedTime: Date;
  unloadedTime: Date;
}
