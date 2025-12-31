type TemplateVars = Record<string, string | number | Date | null | undefined>;

export function renderTemplate(
  template: string,
  vars: TemplateVars
): string {
  let output = template;

  for (const [key, value] of Object.entries(vars)) {
    const safe =
      value instanceof Date
        ? value.toLocaleDateString()
        : value?.toString() ?? "";

    output = output.replaceAll(`[${key}]`, safe);
  }

  return output;
}
