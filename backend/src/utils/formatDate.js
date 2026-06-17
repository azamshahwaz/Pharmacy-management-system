export const formatDateTime = (date) => {
  const d = new Date(date);

  const parts = d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  return parts.replace(/\//g, "-").replace(",", "");
};