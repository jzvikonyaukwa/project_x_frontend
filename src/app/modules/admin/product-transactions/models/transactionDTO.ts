export interface TransactionDTO {
  transactionId: number;
  cuttingListId: number;
  date: Date | string;
  length: number | 0;
  mtrsWasted: number | 0;
  stockOnHandLength: number | 0;
  width: number;
}
