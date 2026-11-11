import { qrDataUrl } from './qr';

/** The door QR's link on whatever host this is (production, local, a preview). */
export function doorLink(token: string): string {
  return `${location.origin}/foleni/${token}`;
}

const esc = (s: string) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/**
 * Prints the branch's door card on one A4 page, through a hidden iframe: the
 * SalonixTz logo, a big QR of the door link, what to do, the branch name.
 */
export async function printDoorCard(opts: { token: string; branchName: string; heading: string; hint: string }): Promise<void> {
  const link = doorLink(opts.token);
  const qr = await qrDataUrl(link, 1000);
  const logo = `${location.origin}/salonix-192.png`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(opts.branchName)}</title>
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Inter, 'Segoe UI', Arial, sans-serif; color: #1d1812; text-align: center; }
  .card { border: 3px solid #f5a524; border-radius: 18px; padding: 14mm 10mm; min-height: 260mm; display: flex; flex-direction: column; align-items: center; justify-content: space-between; }
  .logo { width: 30mm; height: 30mm; border-radius: 7mm; }
  h1 { margin: 6mm 0 0; font-size: 34pt; line-height: 1.1; font-weight: 800; }
  .qr { width: 140mm; height: 140mm; }
  .hint { margin: 0; font-size: 16pt; color: #6b4f33; }
  .branch { margin: 0; font-size: 22pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
  .link { margin: 2mm 0 0; font-size: 10pt; color: #7a6f60; word-break: break-all; }
</style></head><body><div class="card">
  <div><img class="logo" src="${esc(logo)}" alt=""><h1>${esc(opts.heading)}</h1></div>
  <img class="qr" src="${qr}" alt="QR">
  <div><p class="hint">${esc(opts.hint)}</p></div>
  <div><p class="branch">${esc(opts.branchName)}</p><p class="link">${esc(link)}</p></div>
</div></body></html>`;

  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
  document.body.appendChild(frame);
  const doc = frame.contentWindow!.document;
  doc.open();
  doc.write(html);
  doc.close();

  // Print once the logo and the QR have loaded (or failed), not before.
  const images = Array.from(doc.images);
  await Promise.all(
    images.map((img) => (img.complete ? Promise.resolve() : new Promise<void>((done) => { img.onload = img.onerror = () => done(); }))),
  );
  frame.contentWindow!.focus();
  frame.contentWindow!.print();
  setTimeout(() => frame.remove(), 60_000);
}
