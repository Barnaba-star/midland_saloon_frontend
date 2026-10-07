import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, from, of, shareReplay, switchMap } from 'rxjs';
import { environment } from '../enviroments/environment';

/**
 * Pictures the backend keeps under /uploads (profile photos, branch logos).
 *
 * A plain <img src> sends no Authorization header, and the backend only
 * serves /uploads to a signed-in request - in production the site and the
 * backend are different domains - so the picture came back 401 and the
 * profile photo "wouldn't change". Fetched through HttpClient it carries the
 * token like every other request and comes back as a data URL for the <img>.
 * (Ported from Bar.)
 */
@Injectable({ providedIn: 'root' })
export class UploadedImageService {
  private cache = new Map<string, Observable<string | null>>();

  constructor(private http: HttpClient) {}

  /** The picture as a data URL, or null if there is none or it cannot be had. */
  load(name: string | null | undefined): Observable<string | null> {
    if (!name) {
      return of(null);
    }
    let image = this.cache.get(name);
    if (!image) {
      image = this.http.get(`${environment.baseApiUrl}/uploads/${name}`, { responseType: 'blob' }).pipe(
        switchMap((blob) => from(toDataUrl(blob))),
        catchError(() => {
          this.cache.delete(name);
          return of(null);
        }),
        shareReplay(1),
      );
      this.cache.set(name, image);
    }
    return image;
  }

  /** Forget a picture so the next load fetches it again (after a new upload). */
  forget(name: string | null | undefined): void {
    if (name) this.cache.delete(name);
  }
}

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
