import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Component, Inject, Input, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-reusable-dialog-component',
  standalone:true,
  imports: [TranslatePipe, MatDialogModule, CommonModule],
  templateUrl: './reusable-dialog-component.html',
  styleUrls: ['./reusable-dialog-component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReusableDialogComponent {
  @Input() showCloseButton: boolean = true;
  constructor(
    public dialogRef: MatDialogRef<ReusableDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { template?: TemplateRef<any>; title?: string }
  ) {}
}
