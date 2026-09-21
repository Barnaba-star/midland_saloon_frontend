import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

export interface ConfirmDialogData {
  message: string;
  dropdownOptions?: { label: string; value: any }[];
}

@Component({
  selector: 'app-comfirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatFormField, MatSelectModule, MatLabel, FormsModule],
  templateUrl: './comfirm-dialog.html',
  styleUrl: './comfirm-dialog.css'
})
export class ComfirmDialogComponent {
constructor(
  public dialogRef: MatDialogRef<ComfirmDialogComponent>,
  @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
) {}
selectedOption: any = null;

onConfirm(): void {
    const result = this.data.dropdownOptions ? this.selectedOption : true;
    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
