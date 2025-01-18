export interface SteelCoilInterBranchTransferDetails {
  interBranchTransferId: number;
  gauge: number;
  color: string;
  width: number;
  coating: string;
  isqgrade: string;

  steelCoilIdFrom: number;
  cardNumberFrom: string;
  coilNumberFrom: string;

  steelCoilIdTo: number;
  cardNumberTo: string;
  coilNumberTo: string;

  dateTransferred: string;
  mtrsTransferred: number;
  landedCostPerMtrFrom: number;
}
