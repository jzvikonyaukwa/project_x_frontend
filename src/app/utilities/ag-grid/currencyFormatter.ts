import { ValueFormatterParams } from "ag-grid-enterprise";

export function currencyFormatter(input: ValueFormatterParams | number): string {
  let value: number | string;

  // Handle ValueFormatterParams
  if (typeof input === 'object' && 'value' in input) {
    if (input.node.rowPinned) {
      return input.data.landedCostPerMtr;
    }
    value = input.value;
  } else {
    // Direct number input
    value = input;
  }

  if (value === null || value === undefined) {
    return '';
  }

  // Convert to number if it's a string
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  // Check if it's a valid number
  if (isNaN(numericValue)) {
    return '$' + value; // Return original value if not a valid number
  }

  // Round to 2 decimal places
  const roundedValue = Math.round((numericValue + Number.EPSILON) * 100) / 100;

  // Format the number
  const formattedValue = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(roundedValue);

  return '$' + formattedValue;
}