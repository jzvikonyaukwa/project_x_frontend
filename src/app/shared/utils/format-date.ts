export const formatDate = (date: Date | string): string => {
  const dateObj = new Date(date);
  const year: number = dateObj.getFullYear();
  const month: number = dateObj.getMonth() + 1; // months are 0-based
  const day: number = dateObj.getDate();
  const hours: number = dateObj.getHours();
  const minutes: number = dateObj.getMinutes();
  const seconds: number = dateObj.getSeconds();

  // Format the date as YYYY-MM-DDTHH:mm:ss in local time
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
};
