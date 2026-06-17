export const formatDateTime = (date) => {
  if (!date) return "-";

  // Agar backend se already formatted string aa rahi ho
  if (
    typeof date === "string" &&
    date.includes("-") &&
    date.includes("pm") ||
    date.includes("am")
  ) {
    return date;
  }

  const parsed = new Date(date);

  if (isNaN(parsed.getTime())) {
    return date;
  }

  const datePart = parsed.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const timePart = parsed.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).toLowerCase();

  return `${datePart} at ${timePart}`;
};