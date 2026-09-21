import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-user-role-dialog-component',
  imports: [MatDialogModule, MatInputModule, MatAutocompleteModule, MatSelectModule, FormsModule, CommonModule, TranslatePipe],
  templateUrl: './user-role-dialog-component.html',
  styleUrl: './user-role-dialog-component.css',
})
export class UserRoleDialogComponent {
  roles: any[] = [];
  selectedRoleUIDs: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<UserRoleDialogComponent>,

    @Inject(MAT_DIALOG_DATA)
    public data: any
  ) {

    this.roles = data.roles || [];

    this.selectedRoleUIDs = [
      ...(data.selectedRoleUIDs || [])
    ];
  }

  save(): void {

    this.dialogRef.close({
      userUID: this.data.user.uid,
      roleUIDs: this.selectedRoleUIDs
    });
  }

  cancel(): void {

    this.dialogRef.close();
  }
}

