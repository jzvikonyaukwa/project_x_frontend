import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  MatButtonToggleChange,
  MatButtonToggleModule,
} from "@angular/material/button-toggle";
import { AgChartOptions } from "ag-charts-community";
import { TransactionDTO } from "app/modules/admin/product-transactions/models/transactionDTO";
import { ProductTransactionService } from "app/modules/admin/product-transactions/services/product-transaction.service";
import { MachineInformation } from "../../machines/models/machineInformation";
import { ProductInformation } from "app/modules/admin/cutting-lists/models/cuttingListInformationDTO";

@Component({
  selector: "app-machines-transactions-chart",
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule],
  templateUrl: "./machines-transactions-chart.component.html",
})
export class MachinesTransactionsChartComponent implements OnInit {
  @Input() machineInfo: MachineInformation;
  // public options: AgChartOptions;
  unformatData: TransactionDTO[] = [];
  selectedToggle: string = "thisMonth";
  cuttingLists: ProductInformation[];

  constructor(private productTransactionService: ProductTransactionService) {}

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    if (this.machineInfo) {
      this.productTransactionService
        .getProductTransactionsForThisWidth(this.machineInfo.width)
        .subscribe((transactions: TransactionDTO[]) => {
          this.unformatData = transactions;
          this.createChart(transactions);
        });
    }
  }

  createChart(transactions: TransactionDTO[]) {
    // if (this.selectedToggle === "Week") {
    //   const dataformatted = this.groupAndAggregateByWeek(transactions);
    //   this.setChart(dataformatted);
    // } else if (this.selectedToggle === "Month") {
    //   const dataformatted = this.groupAndAggregateByMonth(transactions);
    //   this.setChart(dataformatted);
    // } else if (this.selectedToggle === "Year") {
    //   const dataformatted = this.groupAndAggregateByYear(transactions);
    //   this.setChart(dataformatted);
    // } else {
    //   const dataformatted = this.groupAndAggregateForThisMonth(transactions);
    //   this.setChart(dataformatted);
    // }
  }

  groupAndAggregateForThisMonth(data: TransactionDTO[]): TransactionDTO[] {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Step 1: Filter transactions for the current month and year
    const filteredTransactions = data.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    // Step 2 & 3: Group by day and aggregate
    const aggregatedByDay: { [key: string]: TransactionDTO } = {};

    filteredTransactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const dayKey = `${transactionDate.getFullYear()}-${
        transactionDate.getMonth() + 1
      }-${transactionDate.getDate()}`;

      if (!aggregatedByDay[dayKey]) {
        aggregatedByDay[dayKey] = {
          transactionId: 0, // Or another appropriate default/placeholder value
          cuttingListId: 0, // Or another appropriate default/placeholder value
          date: new Date(
            transactionDate.getFullYear(),
            transactionDate.getMonth(),
            transactionDate.getDate()
          ).toISOString(), // Ensure date is set to midnight for consistency
          length: 0,
          mtrsWasted: 0,
          stockOnHandLength: 0,
          width: 0, // Assuming width aggregation isn't required or should be handled separately
        };
      }

      aggregatedByDay[dayKey].length += transaction.length || 0;
      aggregatedByDay[dayKey].mtrsWasted += transaction.mtrsWasted || 0;
      aggregatedByDay[dayKey].stockOnHandLength +=
        transaction.stockOnHandLength || 0;
      // Handle `width` based on your aggregation logic, if necessary
    });

    // Convert the aggregated object back into an array
    return Object.values(aggregatedByDay);
  }

  groupAndAggregateByWeek(data: TransactionDTO[]): TransactionDTO[] {
    const weeks: { [key: string]: TransactionDTO } = {};

    data.forEach((item) => {
      const date = new Date(item.date);
      const weekNumber = this.getWeekNumber(date); // This will be an integer

      const weekKey = `${weekNumber}`; // If you still want to prefix it with "Week" for display

      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          transactionId: null, // or a default ID if needed
          cuttingListId: null, // or a default ID if needed
          date: `W${weekNumber}`, // Just for representative purposes
          length: 0,
          mtrsWasted: 0,
          stockOnHandLength: 0,
          width: item.width, // Assuming width is constant, adjust logic if needed
        };
      }

      weeks[weekKey].length += item.length ?? 0;
      weeks[weekKey].mtrsWasted += item.mtrsWasted ?? 0;
      weeks[weekKey].stockOnHandLength += item.stockOnHandLength ?? 0;
    });

    return Object.values(weeks);
  }

  getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
    return weekNo; // Returns just the week number as an integer
  }

  groupAndAggregateByMonth(data: TransactionDTO[]): TransactionDTO[] {
    const months: { [key: string]: TransactionDTO } = {};

    data.forEach((item) => {
      const date = new Date(item.date);
      const month = date.getMonth() + 1; // JavaScript months are 0-indexed
      const year = date.getFullYear();
      const monthYearKey = `${month.toString().padStart(2, "0")}`; // e.g., "01"

      // Initialize the month if it doesn't exist
      if (!months[monthYearKey]) {
        months[monthYearKey] = {
          transactionId: null, // or a default ID if needed
          cuttingListId: null, // or a default ID if needed
          date: `${monthYearKey}`,
          length: 0,
          mtrsWasted: 0,
          stockOnHandLength: 0,
          width: item.width, // Assuming width is constant, adjust logic if needed
        };
      }

      // Aggregate the values
      months[monthYearKey].length += item.length ?? 0;
      months[monthYearKey].mtrsWasted += item.mtrsWasted ?? 0;
      months[monthYearKey].stockOnHandLength += item.stockOnHandLength ?? 0;
    });

    return Object.values(months);
  }

  groupAndAggregateByYear(data: TransactionDTO[]): TransactionDTO[] {
    const years: { [key: string]: TransactionDTO } = {};

    data.forEach((item) => {
      const date = new Date(item.date);
      const year = date.getFullYear().toString();

      // Initialize the year if it doesn't exist
      if (!years[year]) {
        years[year] = {
          transactionId: null, // or a default ID if needed
          cuttingListId: null, // or a default ID if needed
          date: `${year}-01-01`, // Using the first day of the year as a representative date
          length: 0,
          mtrsWasted: 0,
          stockOnHandLength: 0,
          width: item.width, // Assuming width is constant, adjust logic if needed
        };
      }

      // Aggregate the values
      years[year].length += item.length ?? 0;
      years[year].mtrsWasted += item.mtrsWasted ?? 0;
      years[year].stockOnHandLength += item.stockOnHandLength ?? 0;
    });

    // Convert the years object back into an array
    return Object.values(years);
  }

  formatDateToTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  formatDate(date): string {
    date = new Date(date);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0"); //January is 0!
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  onToggleChange(event: MatButtonToggleChange): void {
    const selectedValue = event.value;
    this.selectedToggle = selectedValue;
    this.createChart(this.unformatData);
  }

  // setChart(transactions: TransactionDTO[]) {
  //   let title;

  //   if (this.selectedToggle === "Week") {
  //     title = "Meters Cut Weekly";
  //   } else if (this.selectedToggle === "Month") {
  //     title = "Meters Cut Monthly";
  //   } else if (this.selectedToggle === "Year") {
  //     // Assuming 'Year' is the value for yearly data
  //     title = "Meters Cut Yearly";
  //   } else {
  //     title = "Meters Cut This Month"; // Default title, in case it's needed
  //   }

  //   this.options = {
  //     title: {
  //       text: title,
  //     },
  //     subtitle: {
  //       text: "Transactions",
  //     },
  //     data: transactions,
  //     series: [
  //       {
  //         type: "column",
  //         xKey: "date",
  //         yKey: "length",
  //         yName: "Mtrs Sold",
  //         stacked: true,
  //       },
  //       {
  //         type: "column",
  //         xKey: "date",
  //         yKey: "stockOnHandLength",
  //         yName: "Mtrs to Stock On Hand",
  //         stacked: true,
  //       },
  //       {
  //         type: "column",
  //         xKey: "date",
  //         yKey: "mtrsWasted",
  //         yName: "Meters Wasted",
  //         stacked: true,
  //       },
  //     ],
  //   };
  // }

  // setChartDummyData() {
  //   this.options = {
  //     title: {
  //       text: "Apple's Revenue by Product Category",
  //     },
  //     subtitle: {
  //       text: "In Billion U.S. Dollars",
  //     },
  //     data: this.getDummyData(),
  //     series: [
  //       {
  //         type: "column",
  //         xKey: "quarter",
  //         yKey: "iphone",
  //         yName: "iPhone",
  //         stacked: true,
  //       },
  //       {
  //         type: "column",
  //         xKey: "quarter",
  //         yKey: "mac",
  //         yName: "Mac",
  //         stacked: true,
  //       },
  //       {
  //         type: "column",
  //         xKey: "quarter",
  //         yKey: "ipad",
  //         yName: "iPad",
  //         stacked: true,
  //       },
  //       {
  //         type: "column",
  //         xKey: "quarter",
  //         yKey: "wearables",
  //         yName: "Wearables",
  //         stacked: true,
  //       },
  //       {
  //         type: "column",
  //         xKey: "quarter",
  //         yKey: "services",
  //         yName: "Services",
  //         stacked: true,
  //       },
  //     ],
  //   };
  // }

  getDummyData() {
    return [
      {
        quarter: "Q1'18",
        iphone: 140,
        mac: 16,
        ipad: 14,
        wearables: 12,
        services: 20,
      },
      {
        quarter: "Q2'18",
        iphone: 124,
        mac: 20,
        ipad: 14,
        wearables: 12,
        services: 30,
      },
      {
        quarter: "Q3'18",
        iphone: 112,
        mac: 20,
        ipad: 18,
        wearables: 14,
        services: 36,
      },
      {
        quarter: "Q4'18",
        iphone: 118,
        mac: 24,
        ipad: 14,
        wearables: 14,
        services: 36,
      },
      {
        quarter: "Q1'19",
        iphone: 124,
        mac: 18,
        ipad: 16,
        wearables: 18,
        services: 26,
      },
      {
        quarter: "Q2'19",
        iphone: 108,
        mac: 20,
        ipad: 16,
        wearables: 18,
        services: 40,
      },
      {
        quarter: "Q3'19",
        iphone: 96,
        mac: 22,
        ipad: 18,
        wearables: 24,
        services: 42,
      },
      {
        quarter: "Q4'19",
        iphone: 104,
        mac: 22,
        ipad: 14,
        wearables: 20,
        services: 40,
      },
    ];
  }
}
