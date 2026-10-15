export function whatsappNumber(value: string): string | null {
  const compact = value.trim().replace(/[\s().-]/g, "");
  if (!/^\+?[1-9]\d{7,14}$/.test(compact)) return null;
  return compact.replace(/^\+/, "");
}

export function whatsappLink(value: string, message = "היי, אשמח לשמוע איך תבונה AI יכולה לעזור לעסק שלי."): string | null {
  const number = whatsappNumber(value);
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : null;
}

export function validEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]{2,}$/.test(value);
}

export function emailLink(email: string): string {
  return `mailto:${email}?subject=${encodeURIComponent("פגישת היכרות — תבונה AI")}`;
}
