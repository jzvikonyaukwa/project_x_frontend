export function agGridDateFormatter(params) {
  if (!params.value) return null;
  const dateParts = params.value.split("T")[0].split("-");
  return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
}
