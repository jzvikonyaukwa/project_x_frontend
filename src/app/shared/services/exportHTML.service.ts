import { Injectable } from "@angular/core";
import * as html2pdf from "html2pdf.js";
import { HTMLOptions, jsPDF } from "jspdf";

@Injectable({
  providedIn: "root",
})
export class ExportService {
  public exportAsPdf(
    htmlElement: HTMLElement,
    fileName: string,
    lineNumber?: number | 0
  ): void {
    if (!htmlElement) {
      console.error("ExportService: No HTML element provided for PDF export.");
      return;
    }
    console.log("File name: ", fileName);

    let margin: number[];
    if (lineNumber === 7) {
      margin = [10, 0, 20, 0];
    } else {
      margin = [10, 0, 5, 0];
    }

    const options: HTMLOptions | any = {
      filename: `${fileName}.pdf`,
      margin: margin,
      image: { type: "jpeg", quality: 0.98 },
      pagebreak: { mode: "avoid-all" },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    console.log("Starting PDF export..."); // User feedback
    html2pdf().from(htmlElement).set(options).save();
  }
}
