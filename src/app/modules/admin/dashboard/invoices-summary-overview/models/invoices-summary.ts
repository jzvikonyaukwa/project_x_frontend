export interface InvoiceMonthlySummaryDTO {
    month: number;
    totalInvoices: number;
    paidInvoices: number;
    unpaidInvoices: number;
}

export interface InvoiceWeeklySummaryDTO {
    dayOfWeek: string;
    totalInvoices: number;
    paidInvoices: number;
    unpaidInvoices: number;
}

export  interface InvoiceDetailsDTO {
    name: string;
    quantity: number;
    type: string;
    width: number;
}