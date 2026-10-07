import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

export interface PurgeBranchData {
  branchName: string;
  branchCode: string;
}

/**
 * The last check before a branch's data is wiped: says what goes and what
 * stays, and opens the button only once the branch code is typed back.
 * Closes with the typed code (the backend checks it again), or nothing.
 */
@Component({
  selector: 'app-purge-branch-dialog',
  imports: [MatIconModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pb">
      <span class="pb-icon"><mat-icon>delete_forever</mat-icon></span>
      <h2>{{ 'PURGE_BRANCH.TITLE' | translate }}</h2>
      <p class="pb-branch">{{ data.branchName }} <code>{{ data.branchCode }}</code></p>

      <div class="pb-lists">
        <div class="pb-list gone">
          <strong>{{ 'PURGE_BRANCH.GOES' | translate }}</strong>
          <p>{{ 'PURGE_BRANCH.GOES_LIST' | translate }}</p>
        </div>
        <div class="pb-list kept">
          <strong>{{ 'PURGE_BRANCH.STAYS' | translate }}</strong>
          <p>{{ 'PURGE_BRANCH.STAYS_LIST' | translate }}</p>
        </div>
      </div>

      <p class="pb-warn"><mat-icon>warning</mat-icon>{{ 'PURGE_BRANCH.NO_UNDO' | translate }}</p>

      <label for="pb-code">{{ 'PURGE_BRANCH.TYPE_CODE' | translate: { code: data.branchCode } }}</label>
      <input id="pb-code" type="text" autocomplete="off" spellcheck="false"
             [value]="typed()" (input)="typed.set($any($event.target).value)"
             [placeholder]="data.branchCode">

      <div class="pb-actions">
        <button type="button" class="pb-cancel" (click)="ref.close()">{{ 'COMMON.CANCEL' | translate }}</button>
        <button type="button" class="pb-go" [disabled]="!matches()" (click)="ref.close(typed().trim())">
          <mat-icon>delete_forever</mat-icon>{{ 'PURGE_BRANCH.CONFIRM' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .pb { padding: 8px 4px 16px; text-align: center; font-family: var(--font-sans); }
    .pb-icon {
      display: inline-grid; place-items: center; width: 60px; height: 60px; border-radius: 50%;
      background: var(--sx-danger-bg); color: var(--sx-danger);
    }
    .pb-icon mat-icon { font-size: 32px; width: 32px; height: 32px; }
    h2 { margin: 14px 0 4px; font-size: 20px; color: var(--sx-navy-800); }
    .pb-branch { margin: 0 0 16px; font-weight: 600; color: var(--sx-ink); }
    .pb-branch code {
      margin-left: 6px; padding: 2px 8px; border-radius: 6px;
      background: var(--sx-navy-50); color: var(--sx-navy-700); font-size: 13px;
    }
    .pb-lists { display: grid; gap: 10px; text-align: left; }
    .pb-list { padding: 12px 14px; border-radius: 12px; border: 1px solid var(--sx-line); }
    .pb-list strong { font-size: 13px; }
    .pb-list p { margin: 4px 0 0; font-size: 13px; line-height: 1.55; color: var(--sx-muted); }
    .pb-list.gone { background: var(--sx-danger-bg); border-color: transparent; }
    .pb-list.gone strong { color: var(--sx-danger); }
    .pb-list.kept { background: var(--sx-success-bg); border-color: transparent; }
    .pb-list.kept strong { color: var(--sx-success); }
    .pb-warn {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      margin: 14px 0; font-size: 13px; font-weight: 600; color: var(--sx-danger);
    }
    .pb-warn mat-icon { font-size: 18px; width: 18px; height: 18px; }
    label { display: block; margin-bottom: 6px; text-align: left; font-size: 13px; font-weight: 600; color: var(--sx-navy-800); }
    input {
      width: 100%; box-sizing: border-box; height: 46px; padding: 0 14px;
      border: 1px solid var(--sx-line); border-radius: 12px; background: var(--sx-navy-50);
      font: 600 15px var(--font-sans); letter-spacing: .04em; color: var(--sx-ink);
    }
    input:focus { outline: none; border-color: var(--sx-danger); background: var(--sx-surface); }
    .pb-actions { display: grid; grid-template-columns: 1fr 1.4fr; gap: 10px; margin-top: 18px; }
    .pb-actions button {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      height: 46px; border-radius: 12px; font: 600 14px var(--font-sans); cursor: pointer;
    }
    .pb-cancel { border: 1px solid var(--sx-line); background: var(--sx-surface); color: var(--sx-navy-800); }
    .pb-go { border: 0; background: var(--sx-danger); color: #fff; }
    .pb-go:disabled { opacity: .4; cursor: not-allowed; }
    .pb-go mat-icon { font-size: 18px; width: 18px; height: 18px; }
  `],
})
export class PurgeBranchDialogComponent {
  readonly data = inject<PurgeBranchData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<PurgeBranchDialogComponent, string>);
  readonly typed = signal('');
  readonly matches = computed(() => this.typed().trim().toUpperCase() === (this.data.branchCode || '').toUpperCase());
}
