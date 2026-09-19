export function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function nullableFormString(formData: FormData, key: string) {
  const value = formString(formData, key);
  return value ? value : null;
}

export function formBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export function formDate(formData: FormData, key: string) {
  const value = formString(formData, key);
  return value ? new Date(value) : null;
}

export function formInteger(formData: FormData, key: string) {
  const value = formString(formData, key);
  return value ? Number.parseInt(value, 10) : null;
}
