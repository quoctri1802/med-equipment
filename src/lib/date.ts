export function formatDateTimeVN(date: Date | string | number) {
  return new Date(date).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

export function formatDateVN(date: Date | string | number) {
  return new Date(date).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

export function formatTimeVN(date: Date | string | number) {
  return new Date(date).toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour12: false });
}
