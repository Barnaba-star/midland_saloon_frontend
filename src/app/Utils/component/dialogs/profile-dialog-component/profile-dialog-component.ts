import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../../settings/users-setting/user-service';
import { AlertService } from '../../../services/alert';
import { environment } from '../../../enviroments/environment';

export interface ProfileDialogData {
  fullName: string;
  email: string;
  role: string;
  branchName: string;
  profilePic: string;
}

@Component({
  selector: 'app-profile-dialog-component',
  imports: [MatIconModule, TranslatePipe],
  templateUrl: './profile-dialog-component.html',
  styleUrl: './profile-dialog-component.css',
})
export class ProfileDialogComponent {

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploading = false;
  errorMessageKey: string | null = null;

  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private static readonly MAX_SIZE_BYTES = 10 * 1024 * 1024;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ProfileDialogData,
    private dialogRef: MatDialogRef<ProfileDialogComponent>,
    private userService: UserService,
    private alertService: AlertService,
    private translate: TranslateService,
  ) { }

  get avatarUrl(): string | null {
    return this.previewUrl || this.data.profilePic || null;
  }

  onFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.errorMessageKey = null;

    if (!ProfileDialogComponent.ALLOWED_TYPES.includes(file.type)) {
      this.errorMessageKey = 'PROFILE_DIALOG.INVALID_TYPE';
      input.value = '';
      return;
    }

    if (file.size > ProfileDialogComponent.MAX_SIZE_BYTES) {
      this.errorMessageKey = 'PROFILE_DIALOG.TOO_LARGE';
      input.value = '';
      return;
    }

    this.selectedFile = file;

    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.previewUrl = URL.createObjectURL(file);
  }

  save(): void {

    if (!this.selectedFile) {
      this.close();
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.uploading = true;

    this.userService.saveProfilePic(formData).subscribe({

      next: (res) => {

        this.uploading = false;

        this.alertService.show('success', this.translate.instant('PROFILE_DIALOG.UPDATED'));

        const imageName = res.data?.imageName;

        this.dialogRef.close({
          imageName,
          profilePic: imageName
            ? `${environment.baseApiUrl}/uploads/${imageName}`
            : null,
        });
      },

      error: (error) => {

        this.uploading = false;

        console.error('Error uploading profile picture:', error);

        this.errorMessageKey = 'PROFILE_DIALOG.UPLOAD_FAILED';
      },
    });
  }

  close(): void {

    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.dialogRef.close();
  }
}
