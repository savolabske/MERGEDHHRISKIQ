export type ParsedDisplayValue =
  | { kind: 'numeric'; target: number; format: (n: number) => string }
  | { kind: 'text' };

export function parseDisplayValue(value: string, raw?: number): ParsedDisplayValue {
  if (raw !== undefined && Number.isFinite(raw)) {
    const dollarB = value.match(/^\$([\d,.]+)B$/);
    if (dollarB) {
      return {
        kind: 'numeric',
        target: raw,
        format: (n) => (n >= 1000 ? `$${(n / 1000).toFixed(2)}B` : `$${Math.round(n)}M`),
      };
    }
    const dollarM = value.match(/^\$([\d,.]+)M$/);
    if (dollarM) {
      return {
        kind: 'numeric',
        target: raw,
        format: (n) => `$${Math.round(n)}M`,
      };
    }
  }

  const dollarB = value.match(/^\$([\d,.]+)B$/);
  if (dollarB) {
    const target = parseFloat(dollarB[1].replace(/,/g, '')) * 1000;
    return {
      kind: 'numeric',
      target,
      format: (n) => (n >= 1000 ? `$${(n / 1000).toFixed(2)}B` : `$${Math.round(n)}M`),
    };
  }

  const dollarM = value.match(/^\$([\d,.]+)M$/);
  if (dollarM) {
    const target = parseFloat(dollarM[1].replace(/,/g, ''));
    return {
      kind: 'numeric',
      target,
      format: (n) => `$${Math.round(n)}M`,
    };
  }

  const plainDollar = value.match(/^\$([\d,.]+)$/);
  if (plainDollar) {
    const target = parseFloat(plainDollar[1].replace(/,/g, ''));
    return {
      kind: 'numeric',
      target,
      format: (n) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    };
  }

  const percent = value.match(/^([\d,.]+)%$/);
  if (percent) {
    const target = parseFloat(percent[1].replace(/,/g, ''));
    return {
      kind: 'numeric',
      target,
      format: (n) => `${Math.round(n)}%`,
    };
  }

  const integer = value.match(/^([\d,]+)$/);
  if (integer) {
    const target = parseInt(integer[1].replace(/,/g, ''), 10);
    if (!Number.isNaN(target)) {
      return {
        kind: 'numeric',
        target,
        format: (n) => Math.round(n).toLocaleString(),
      };
    }
  }

  const compactM = value.match(/^([\d,.]+)M$/);
  if (compactM) {
    const target = parseFloat(compactM[1].replace(/,/g, '')) * 1_000_000;
    return {
      kind: 'numeric',
      target,
      format: (n) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : n.toLocaleString()),
    };
  }

  const compactK = value.match(/^([\d,.]+)k$/i);
  if (compactK) {
    const target = parseFloat(compactK[1].replace(/,/g, '')) * 1000;
    return {
      kind: 'numeric',
      target,
      format: (n) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(Math.round(n))),
    };
  }

  return { kind: 'text' };
}
