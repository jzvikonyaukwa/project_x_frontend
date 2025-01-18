export function formatQuantityWithDecimals(params: any) {
  const number = params.value;
  if (typeof number !== 'number') {
    return params.value;  // return the original value if it's not a number
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number);
}