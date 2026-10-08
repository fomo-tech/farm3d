// Routine activity belongs in the world or panel, not in global notifications.
export function notificationKind(message) {
  if (!message || /^(Đang |Vui lòng chờ|Sắp sẵn sàng|Thao tác trước)/i.test(message)) return null;
  if (/^(Lỗi:|Không |Chưa |Cần |Hãy |Bạn cần |Kết nối lại |Công cụ (canh tác|này)|Chỉ chủ |Kho đã đầy|Nhà của bạn đã đạt)|mở khóa ở cấp|không thể|không đủ|thất bại|thiếu xu/i.test(message)) return 'warning';
  if (/^(Đã mua |Đã bán |Đã nhận |Đã lưu |Đã khai hoang |Bạn nhận được |Chúc mừng|Hồ sơ đã được lưu|Đã bảo vệ nhân vật)/i.test(message)) return 'success';
  if (/^Cổng đã (mở|đóng)/i.test(message)) return 'info';
  return null;
}

export function createNotificationGate() {
  const seen = new Map();
  let lastSuccess = -Infinity;
  return (message, options = {}, now = Date.now()) => {
    if (options.silent) return null;
    const kind = options.kind || notificationKind(message);
    if (!kind) return null;
    const key = `${kind}:${message}`;
    const cooldown = kind === 'warning' ? 10000 : 30000;
    if (now - (seen.get(key) ?? -Infinity) < cooldown) return null;
    if (kind === 'success' && now - lastSuccess < 3500) return null;
    for (const [oldKey, timestamp] of seen) if (now - timestamp >= 30000) seen.delete(oldKey);
    seen.set(key, now);
    if (kind === 'success') lastSuccess = now;
    return kind;
  };
}
