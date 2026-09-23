import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LoginService } from '../../../../login/LoginService';
import { DataDTO } from '../../../../login/model';
import { AlertService } from '../../../services/alert';

@Component({
  selector: 'app-change-password-dialog-component',
  imports: [MatIconModule, FormsModule, TranslatePipe],
  templateUrl: './change-password-dialog-component.html',
  styleUrl: './change-password-dialog-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePasswordDialogComponent {

  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  showOld = false;
  showNew = false;
  showConfirm = false;

  saving = false;
  errorMessage: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private loginService: LoginService,
    private alertService: AlertService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
  ) { }

  get canSave(): boolean {
    return (
      !this.saving &&
      this.oldPassword.trim().length > 0 &&
      this.newPassword.trim().length >= 6 &&
      this.confirmPassword.trim().length > 0
    );
  }

  save(): void {

    this.errorMessage = null;

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = this.translate.instant('CHANGE_PASSWORD_DIALOG.MISMATCH');
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = this.translate.instant('CHANGE_PASSWORD_DIALOG.TOO_SHORT');
      return;
    }

    const dataDTO: DataDTO = {
      oldPassword: this.oldPassword,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword,
    };

    this.saving = true;

    this.loginService.changePassword(dataDTO).subscribe({

      next: (res) => {

        this.saving = false;

        if (!res?.data) {
          this.errorMessage = res?.message || this.translate.instant('CHANGE_PASSWORD_DIALOG.FAILED');
          this.cdr.markForCheck();
          return;
        }

        this.alertService.show('success', this.translate.instant('CHANGE_PASSWORD_DIALOG.UPDATED'));

        this.dialogRef.close(true);
      },

      error: (error) => {

        this.saving = false;

        this.errorMessage =
          error?.error?.message ||
          (typeof error?.error === 'string' ? error.error : null) ||
          this.translate.instant('CHANGE_PASSWORD_DIALOG.FAILED');

        this.cdr.markForCheck();
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
