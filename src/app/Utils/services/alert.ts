import { Injectable, Injector, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { translateServerMessage } from './server-message';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

@Injectable({ providedIn: 'root' })
export class AlertService {
  // Looked up when used: an interceptor may need this service while TranslateService is still loading.
  private injector = inject(Injector);
  private alertSubject = new Subject<{ type: AlertType, message: string }>();
  alertState$ = this.alertSubject.asObservable();

  /**
   * `message` may be an i18n key ('COMMON.SAVED'), a backend message
   * ('Service Not Found', 'NOT_ALLOWED') or plain text - the first two are
   * shown in the chosen language, plain text as it is.
   */
  show(type: AlertType, message: string) {
    this.alertSubject.next({ type, message: translateServerMessage(message, this.injector.get(TranslateService)) });
  }
}
