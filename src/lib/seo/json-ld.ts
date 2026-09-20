export function jsonLdScript(value: unknown) {
  return {
    __html: JSON.stringify(value).replace(/</g, "\\u003c")
  };
}
