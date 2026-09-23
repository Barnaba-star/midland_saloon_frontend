import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ServiceSaloonMethod } from '../../../../pos/service-saloon-method';

@Component({
  selector: 'app-select-staff-dialog-component',
  imports: [MatIconModule, FormsModule, TranslatePipe],
  templateUrl: './select-staff-dialog-component.html',
  styleUrl: './select-staff-dialog-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectStaffDialogComponent implements OnInit {

  staffList: any[] = [];
  filteredStaffList: any[] = [];
  searchTerm = '';
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<SelectStaffDialogComponent>,
    private saloonService: ServiceSaloonMethod,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff(): void {

    this.loading = true;
    this.errorMessage = null;

    this.saloonService.findSaloonStaffList().subscribe({

      next: (res) => {
        this.loading = false;
        this.staffList = res.data || [];
        this.applyFilter();
        this.cdr.detectChanges();
      },

      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to load staff';
        this.cdr.detectChanges();
      },
    });
  }

  applyFilter(): void {

    const term = this.searchTerm.trim().toLowerCase();

    this.filteredStaffList = !term
      ? this.staffList
      : this.staffList.filter((staff) =>
          [staff.firstName, staff.middleName, staff.lastName, staff.phoneNumber]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(term)
        );
  }

  fullName(staff: any): string {
    return [staff.firstName, staff.middleName, staff.lastName]
      .filter(Boolean)
      .join(' ');
  }

  // Step 2: the picked staff's particulars, pre-filled and editable. Staff
  // records carry no email or address, so those start empty and are filled
  // in here before the user is created. "Enter manually" opens the same
  // form with nothing picked.
  step: 'pick' | 'details' = 'pick';
  form: any = {};

  select(staff: any): void {
    this.form = {
      uid: staff.uid,
      firstName: staff.firstName ?? '',
      middleName: staff.middleName ?? '',
      lastName: staff.lastName ?? '',
      gender: staff.gender ?? '',
      dateOfBirth: this.asDateInput(staff.dateOfBirth),
      phoneNumber: staff.phoneNumber ?? '',
      email: '',
      address: '',
    };
    this.step = 'details';
  }

  enterManually(): void {
    this.form = {
      firstName: '',
      middleName: '',
      lastName: '',
      gender: '',
      dateOfBirth: '',
      phoneNumber: '',
      email: '',
      address: '',
    };
    this.step = 'details';
  }

  back(): void {
    this.step = 'pick';
  }

  get canSave(): boolean {
    return !!(this.form.firstName?.trim() && this.form.lastName?.trim());
  }

  save(): void {
    if (!this.canSave) {
      return;
    }
    this.dialogRef.close({ ...this.form });
  }

  // <input type="date"> wants yyyy-MM-dd; the API may send a full date-time.
  private asDateInput(value: any): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    return isNaN(date.getTime()) ? String(value) : date.toISOString().slice(0, 10);
  }

  close(): void {
    this.dialogRef.close();
  }
}
