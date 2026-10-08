import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { environment } from '../../Utils/enviroments/environment';
import { Response } from '../../Utils/models/responces';
import { AlertService } from '../../Utils/services/alert';

export type ShiftState = 'NONE' | 'OPEN' | 'CLOSED';

/**
 * The signed-in cashier's shift (zamu): open one to start selling, close it
 * to hand over. A closed shift waits for its cash-up (makabidhiano) and the
 * store count before a new one can be opened - the backend holds all of this;
 * selling without an open shift is refused there too.
 */
@Component({
  selector: 'app-shift-bar',
  imports: [MatIconModule, DatePipe, TranslatePipe],
  templateUrl: './shift-bar.html',
  styleUrl: './shift-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShiftBar implements OnInit {
  @Input() area = 'saloon';
  /** Off on the cash-up page itself, where the count is right below. */
  @Input() showCashUpLink = true;
  /** Straight to the handover once the shift is closed (the Sales page). */
  @Input() goToHandoverOnClose = true;
  @Output() stateChange = new EventEmitter<ShiftState>();

  state: ShiftState | null = null;
  openedAt: string | null = null;
  /** CEO/manager only: other people's shifts open in the branch right now. */
  others: { cashierName: string; openedAt: string }[] = [];
  busy = false;
  confirmingClose = false;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private alert: AlertService,
    private translate: TranslateService,
  ) {}

  private get url(): string {
    return `${environment.baseApiUrl}/${this.area}/shift`;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.http.get<Response<any>>(`${this.url}/current`).subscribe({
      next: (res) => {
        this.others = res?.data?.others ?? [];
        this.apply(res?.data?.state ?? 'NONE', res?.data?.shift?.openedAt ?? null);
      },
    });
  }

  open(): void {
    this.busy = true;
    this.http.post<Response<any>>(`${this.url}/open`, {}).subscribe({
      next: (res) => {
        this.busy = false;
        if (res?.data) {
          this.alert.show('success', this.translate.instant('SHIFT.OPENED_OK'));
          this.apply('OPEN', res.data.openedAt);
        } else {
          this.load();
        }
      },
      error: () => this.done(),
    });
  }

  close(): void {
    if (!this.confirmingClose) {
      this.confirmingClose = true;
      return;
    }
    this.confirmingClose = false;
    this.busy = true;
    this.http.post<Response<any>>(`${this.url}/close`, {}).subscribe({
      next: (res) => {
        this.busy = false;
        if (res?.data) {
          this.alert.show('success', this.translate.instant('SHIFT.CLOSED_OK'));
          this.apply('CLOSED', res.data.openedAt);
          if (this.goToHandoverOnClose) {
            this.goToCashUp();
          }
        } else {
          this.load();
        }
      },
      error: () => this.done(),
    });
  }

  /** The handover: Kufunga Zamu (cash-up) under Reports. */
  goToCashUp(): void {
    this.router.navigate(['/pos/saloonReports'], { queryParams: { tab: 'REPORTS.CASHUP' } });
  }

  private apply(state: ShiftState, openedAt: string | null): void {
    this.state = state;
    this.openedAt = openedAt;
    this.stateChange.emit(state);
    this.cdr.markForCheck();
  }

  private done(): void {
    this.busy = false;
    this.cdr.markForCheck();
  }
}
