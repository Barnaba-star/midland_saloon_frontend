/**
 * A phone photo made small before upload: at most `maxSide` px on its long
 * side, re-encoded as JPEG. A 4 MB camera shot comes out around 200-400 KB.
 * Anything the browser cannot draw (or a canvas failure) returns the file as
 * it was, so the upload still goes.
 */
export async function downscaleImage(file: File, maxSide = 1600, quality = 0.8): Promise<File> {
  if (!file || !file.type.startsWith('image/')) {
    return file;
  }
  try {
    const img = await loadImage(file);
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) {
      return file;
    }
    const scale = Math.min(1, maxSide / Math.max(w, h));
    const cw = Math.round(w * scale);
    const ch = Math.round(h * scale);
    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return file;
    }
    // JPEG has no transparency: a white floor instead of black.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, 0, 0, cw, ch);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) {
      return file;
    }
    // Already small and already a JPEG: keep the original.
    if (scale === 1 && file.type === 'image/jpeg' && file.size <= blob.size) {
      return file;
    }
    const name = (file.name || 'photo').replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file;
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}
