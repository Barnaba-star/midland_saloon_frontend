import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IconRegistryService } from '../Utils/services/icon-registry.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SubscribeDialogComponent } from '../Utils/component/dialogs/subscribe-dialog-component/subscribe-dialog-component';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../Utils/services/alert';
import { Authentication } from '../Utils/services/authentication';
import { environment } from '../Utils/enviroments/environment';
import { ChangeDetectorRef } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-login',
  imports: [MatFormFieldModule, MatInputModule, MatCardModule, MatButtonModule, MatIconModule, ReactiveFormsModule, CommonModule, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login implements OnInit {
private api = environment.baseApiUrl
private baseUrl: string = `${this.api}/authentication/login`;

  loginForm: FormGroup;
  showPassword = false;
  submitting = false;

  constructor(private iconRegistry: IconRegistryService, private route:Router, private cookie:CookieService,
  private http:HttpClient, private alert: AlertService, private auth:Authentication,  private cdr: ChangeDetectorRef, private dialog: MatDialog, private translate: TranslateService) {
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.minLength(3)]),
      password: new FormControl('', [Validators.required, Validators.minLength(3)])
    });
  }
 ngOnInit(): void {
    const idleTime = 1 * 60 * 1000;

    setTimeout(() => {
      this.route.navigate(['/landing']);
    }, idleTime);
  }
loginError: string = '';
onSubmit() {
  if (this.loginForm.valid) {

    this.loginError = '';
    this.submitting = true;

    this.http.post<{ token: string }>(
      this.baseUrl,
      this.loginForm.value,
      {
        withCredentials: true
      }
    ).subscribe({
      next: (res) => {
        this.loginError = '';
        this.paymentSent = false;
        this.submitting = false;

        // Save token
        this.auth.setToken(res.token);

        // Start heartbeat
        this.auth.startHeartbeat();

        // ROOT/STAFF/DIRECTOR manage the system - they land on the Dashboard
        // and pick where to go (including Settings). CEO/MANAGER/CASHIER are
        // branch-operational roles - they skip the Dashboard entirely and go
        // straight into POS. A user holding any system-management role wins
        // if they somehow hold both kinds.
        const systemRoles = ['ROOT', 'STAFF', 'DIRECTOR'];
        const landing = systemRoles.some(role => this.auth.hasRole(role)) ? '/dashboard' : '/pos';
        this.route.navigate([landing]);

        this.cdr.detectChanges();
      },

      error: (err) => {
        // A lapsed subscription is answered with a structured body so it can
        // be told apart from a wrong password - it is the one failure the
        // customer can fix from this screen.
        const body = err?.error;
        if (body && body.code === 'SUBSCRIPTION_EXPIRED') {
          // The backend sends the code and the figures; the wording is ours,
          // so it is translated and reads the way the rest of this screen
          // does rather than arriving in English from a service layer.
          this.loginError = this.translate.instant('LOGIN.EXPIRED_TITLE');
          this.expiredBranchName = body.branchName ?? '';
          this.expiredMonthlyAmount = body.monthlyAmount ?? null;
          this.subscriptionExpired = true;
          // A declined payment leaves the branch on FAILED and the date
          // untouched, so without saying so the screen just repeats "expired"
          // and the customer is left thinking paying did nothing.
          this.subscriptionStatus = body.subscriptionStatus ?? null;
          this.paymentFailure = body.paymentFailure ?? null;
          this.paymentSent = false;
        } else {
          this.loginError = typeof body === 'string' ? body : (body?.message ?? '');
          this.subscriptionExpired = false;
        }

        this.auth.removeToken();

        this.submitting = false;

        this.cdr.detectChanges();

        console.log('Login error:', err);
      }
    });
  }
}

  // Set when login fails because the branch has lapsed, so the screen can
  // offer a way to pay instead of leaving the customer stuck.
  subscriptionExpired = false;
  /** Set once the USSD push is out, so the screen stops showing the expiry error. */
  paymentSent = false;
  /** PENDING or FAILED from the last attempt, when there was one. */
  subscriptionStatus: string | null = null;
  /** Snippe's own wording for the decline, used to pick a message - never shown as-is. */
  paymentFailure: string | null = null;

  /** What to tell them beyond "expired", given how the last attempt went. */
  get expiredHelpKey(): string {
    if (this.subscriptionStatus === 'FAILED') {
      // The reason is matched, not printed. Snippe's wording is written for
      // a developer reading a log, in English, and the rest of this screen
      // is neither - so a recognised decline gets our own sentence and
      // anything unrecognised falls back to the general one.
      const reason = (this.paymentFailure ?? '').toLowerCase();
      if (/insufficient|balance|funds|salio/.test(reason)) {
        return 'LOGIN.EXPIRED_HELP_NO_BALANCE';
      }
      if (/timeout|timed out|expired|no response|not approved/.test(reason)) {
        return 'LOGIN.EXPIRED_HELP_TIMEOUT';
      }
      return 'LOGIN.EXPIRED_HELP_FAILED';
    }
    if (this.subscriptionStatus === 'PENDING') {
      return 'LOGIN.EXPIRED_HELP_PENDING';
    }
    return 'LOGIN.EXPIRED_HELP';
  }
  expiredBranchName = '';
  expiredMonthlyAmount: number | null = null;

  openSubscribeDialog(): void {
    const dialogRef = this.dialog.open(SubscribeDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      data: {
        subscriptionAmount: this.expiredMonthlyAmount,
        // No token exists yet, so the backend verifies these again.
        credentials: {
          username: this.loginForm.value.username,
          password: this.loginForm.value.password,
        },
      },
    });

    dialogRef.afterClosed().subscribe((initiated) => {
      if (initiated) {
        // The dialog closes itself two seconds after the USSD push goes out,
        // leaving this screen behind it. Without clearing the error, what the
        // customer is left looking at is the expiry message again - which
        // reads as if paying had failed.
        this.loginError = '';
        this.subscriptionExpired = false;
        this.paymentSent = true;
      }
      this.cdr.markForCheck();
    });
  }

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }
}

