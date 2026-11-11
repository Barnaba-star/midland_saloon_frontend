/**
 * A QR picture (PNG data URL) of a text, from the `qrcode` package. Loaded on
 * first use only, so pages without a QR never download it.
 */
export async function qrDataUrl(text: string, width = 512): Promise<string> {
  const mod: any = await import('qrcode');
  const lib = typeof mod.toDataURL === 'function' ? mod : mod.default;
  return lib.toDataURL(text, {
    width,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#1d1812', light: '#ffffff' },
  });
}
