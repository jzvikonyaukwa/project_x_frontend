import { ExcelStyle } from "ag-grid-community";

export const EXCEL_STYLES: ExcelStyle[] = [
  {
    id: "preAppendedheaderCell",
    font: {
      size: 26,
      bold: true,
    },
  },
  {
    id: "coverText",
    font: {
      size: 14,
    },
  },
  {
    id: "header",
    font: {
      size: 16,
      bold: true,
    },
  },
  {
    id: "semiHeader",
    font: {
      size: 16,
    },
  },
  {
    id: "headerCell",
    font: {
      size: 16,
    },
  },
  {
    id: "headerWaste",
    font: {
      size: 16,
      color: "#FF0000",
    },
  },
  {
    id: "cell",
    font: {
      size: 14,
    },
    alignment: {
      horizontal: "Left",
      vertical: "Center",
    },
  },
];
