export interface AddMissingMetresDTO {
  steelCoilId: number;
  reason: string;
  missingMeters: number;
  loggedAt: Date;
}
