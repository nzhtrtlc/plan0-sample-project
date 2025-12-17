export interface ParsedAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  fullAddress: string;
}

export function extractAddresses(text: string): ParsedAddress[] {
  const regex =
    /(?<street>.+)\n(?<city>[A-Za-z\s]+),\s*(?<province>[A-Za-z\s]+),\s*(?<postal>[A-Z]\d[A-Z]\s?\d[A-Z]\d)/gm;

  const results = new Map<string, ParsedAddress>();
  let match;

  while ((match = regex.exec(text)) !== null) {
    const { street, city, province, postal } = match.groups!;

    const parsed: ParsedAddress = {
      street: street.trim(),
      city: city.trim(),
      province: province.trim(),
      postalCode: postal.trim(),
      fullAddress: `${street.trim()}, ${city.trim()}, ${province.trim()}, ${postal.trim()}`,
    };

    const key = parsed.fullAddress;
    
    results.set(key, parsed);
  }

  return Array.from(results.values());
}
