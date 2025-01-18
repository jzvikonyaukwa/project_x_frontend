export function formatWholeQuantity(params: any) {
  const quantity = params.value;
  if (typeof quantity !== 'number') {
    return params.value;  // return the original value if it's not a number
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.round(quantity));
}