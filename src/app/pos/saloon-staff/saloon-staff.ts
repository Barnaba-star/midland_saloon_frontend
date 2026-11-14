import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TitleAction, Title2 } from '../../Utils/component/title2/title2';
import { Authentication } from '../../Utils/services/authentication';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormField } from '../../Utils/models/form-field';
import { Form3 } from '../../Utils/component/form3/form3';
import { SaloonStaffDTO, SaloonStaffEntity } from '../SaloonModel';
import { SaloonService } from '../saloon-service/saloon-service';
import { ServiceSaloonMethod } from '../service-saloon-method';
import { AlertService } from '../../Utils/services/alert';
import { RecordtableComponent } from '../../Utils/component/recordtable/recordtable';
import { DialogComponent } from '../../Utils/component/dialog/dialog';
import { MatDialog } from '@angular/material/dialog';
import { PageableParam } from '../../Utils/models/responces';
import { TableColumn, TableComponent } from '../../Utils/component/table/table';
import { MatTableDataSource } from '@angular/material/table';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { StaffDetailsDialogComponent } from '../../Utils/component/dialogs/staff-details-dialog-component/staff-details-dialog-component';
import { DeleteConfirmationComponent } from '../../Utils/component/dialogs/delete-confirmation-component/delete-confirmation-component';
import { EmptyStateComponent } from '../../Utils/component/empty-state/empty-state';
import { StaffPhotosDialog } from '../staff-photos-dialog/staff-photos-dialog';
import { StaffCardDialog } from '../staff-card-dialog/staff-card-dialog';

@Component({
  selector: 'app-saloon-staff',
  standalone: true,
  imports: [
    EmptyStateComponent,
    Title2,
    MatIconModule,
    Form3,
    RecordtableComponent,
    TranslatePipe,
    MatTooltipModule,
  ],
  templateUrl: './saloon-staff.html',
  styleUrl: './saloon-staff.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaloonStaff implements OnInit{
  constructor(
    private visibility: Authentication,
    private saloonService: ServiceSaloonMethod,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private translate: TranslateService,
  ) {}
  ngOnInit(): void {
    this.selectedStaff = 'STAFF.MANAGE';
    this.loadStaffPage();
  }

  selectedStaff = '';
  editSaloonStaff: Boolean = false;

  titleActions: TitleAction[] = [
    {
      icon: 'add',
      title: 'STAFF.ADD',
      roles: ['ROOT', 'STAFF', 'DIRECTOR', 'CEO', 'MANAGER', 'CASHIER'],
    },
    {
      icon: 'more',
      title: 'STAFF.MANAGE',
      roles: ['ROOT', 'STAFF', 'DIRECTOR', 'CEO', 'MANAGER', 'CASHIER'],
    },
  ];

  getTitled(title: TitleAction[]): TitleAction[] {
    return this.visibility.filteredTitleActions(title);
  }

  /** Kazi zake: this stylist's work photos, shown to guests at the door. */
  /** The stylist's commission QR (owner 2026-11-14). */
  onStaffCard(staff: any): void {
    if (!staff?.uid) return;
    const name = [staff.firstName, staff.lastName].filter(Boolean).join(' ');
    this.dialog.open(StaffCardDialog, { width: '460px', maxWidth: '95vw', autoFocus: false, data: { staffUid: staff.uid, name } });
  }

  onStaffPhotos(staff: any): void {
    if (!staff?.uid) {
      return;
    }
    const name = [staff.firstName, staff.lastName].filter(Boolean).join(' ');
    this.dialog.open(StaffPhotosDialog, {
      width: '640px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      data: { staffUid: staff.uid, name },
    });
  }

  onAction(action: string) {
    this.selectedStaff = action;
    if (this.selectedStaff === 'STAFF.MANAGE') {
      this.loadStaffPage();
  
    }
  }

  staffFields: FormField[] = [
    {
      name: 'firstName',
      type: 'text',
      label: 'COMMON.FIRST_NAME',
      placeholder: 'POS_T.STAFF.ENTER_NAME',
      required: true,
    },
    {
      name: 'middleName',
      type: 'text',
      label: 'COMMON.MIDDLE_NAME',
      placeholder: 'POS_T.STAFF.ENTER_NAME',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'COMMON.LAST_NAME',
      placeholder: 'POS_T.STAFF.ENTER_NAME',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      label: 'POS_T.STAFF.PHONE_NUMBER',
      placeholder: 'POS_T.STAFF.ENTER_PHONE',
      required: true,
    },
    {
      name: 'saloonCategory',
      label: 'COMMON.CATEGORY',
      type: 'select',
      options: [
        { label: 'POS_T.STAFF.BEAUTY_THERAPIST', value: 'Beauty Therapist' },
        { label: 'POS_T.STAFF.BARBER', value: 'Barber' },
      ],
    },
    {
      label: 'STAFF_PAGE.COL_DOB',
      name: 'dateOfBirth',
      placeholder: 'STAFF_PAGE.COL_DOB',
      type: 'date',
    },
    {
      name: 'description',
      label: 'COMMON.DESCRIPTION',
      type: 'textarea',
      rows: 1,
      colSpan: 2,
    },
    {
      name: 'gender',
      label: 'COMMON.GENDER',
      type: 'radio',
      options: [
        { label: 'POS_T.STAFF.MALE', value: 'Male' },
        { label: 'POS_T.STAFF.FEMALE', value: 'Female' },
      ],
    },
  ];

  editStaffFields: FormField[] = [
    {
      name: 'firstName',
      type: 'text',
      placeholder: 'POS_T.STAFF.ENTER_NAME',
      required: true,
    },
    {
      name: 'middleName',
      type: 'text',
      placeholder: 'POS_T.STAFF.ENTER_NAME',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      placeholder: 'POS_T.STAFF.ENTER_NAME',
      required: true,
    },
    {
      name: 'phoneNumber',
      type: 'text',
      placeholder: 'POS_T.STAFF.ENTER_PHONE',
      required: true,
    },
    {
      name: 'saloonCategory',
      type: 'select',
      options: [
        { label: 'POS_T.STAFF.BEAUTY_THERAPIST', value: 'Beauty Therapist' },
        { label: 'POS_T.STAFF.BARBER', value: 'Barber' },
      ],
    },
    {
      name: 'dateOfBirth',
      placeholder: 'STAFF_PAGE.COL_DOB',
      type: 'date',
    },
    {
      name: 'description',
      type: 'textarea',
      rows: 1,
      colSpan: 2,
    },
    {
      name: 'gender',
      type: 'radio',
      options: [
        { label: 'POS_T.STAFF.MALE', value: 'Male' },
        { label: 'POS_T.STAFF.FEMALE', value: 'Female' },
      ],
    },
  ];

  saloonStaff: SaloonStaffEntity[] = [];
  saloonStaffEdited: SaloonStaffEntity[] = [];
  staffColumns = [
    {
      field: 'firstName',
      header: 'COMMON.FIRST_NAME',
    },
    {
      field: 'middleName',
      header: 'COMMON.MIDDLE_NAME',
    },
    {
      field: 'lastName',
      header: 'COMMON.LAST_NAME',
    },
    {
      field: 'phoneNumber',
      header: 'POS_T.STAFF.PHONE_NUMBER',
    },
    {
      field: 'saloonCategory',
      header: 'COMMON.CATEGORY',
    },
    {
      field: 'gender',
      header: 'COMMON.GENDER',
    },
  ];

  savedData(value: any): void {
    const saloonStaffDTO: SaloonStaffDTO = {
      firstName: value.firstName,
      middleName: value.middleName,
      lastName: value.lastName,
      dateOfBirth: value.dateOfBirth,
      phoneNumber: value.phone,
      saloonCategory: value.saloonCategory,
      description: value.description,
      gender: value.gender,
    };
    console.log('SaloonStaffDTO:', saloonStaffDTO);
    this.saloonService.saveSaloonStaff(saloonStaffDTO).subscribe({
      next: (response) => {
        console.log('Saloon staff saved successfully:', response);
        if (response.data) {
          this.alertService.show('success', 'POS_T.STAFF.SAVED');
          this.saloonStaff.push(response.data);
          this.cdr.detectChanges();
          console.log('Saved Saloon Staff:', this.saloonStaff);
        }
      },
      error: (error) => {
        console.error('Error saving saloon staff:', error);
      },
    });
  }
  staffUID: string = '';
  onEditSaloonStaff(event: any) {
    this.staffUID = event.uid;
    console.log('Edited Data:', event);
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '1200px',
      data: {
        formTitle: 'POS_T.STAFF.UPDATE',
        fields: this.editStaffFields,
        formData: [event],
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      console.log('Updated form data:', result);
      const staffEdited: SaloonStaffDTO = {
        uid: this.staffUID,
        firstName: result.firstName,
        middleName: result.middleName,
        lastName: result.lastName,
        dateOfBirth: result.dateOfBirth,
        phoneNumber: result.phoneNumber,
        saloonCategory: result.saloonCategory,
        description: result.description,
        gender: result.gender,
      };
      this.saloonService.saveSaloonStaff(staffEdited).subscribe({
        next: (response) => {
          console.log('Saloon staff Updated successfully:', response);
          if (response.data) {
            this.alertService.show('success', 'POS_T.STAFF.UPDATED');
            this.saloonStaff = [];
            this.saloonStaff.push(response.data);
            this.cdr.detectChanges();
            console.log('Saved Saloon Staff:', this.saloonStaff);
          }
        },
        error: (error) => {
          console.error('Error saving saloon staff:', error);
        },
      });
    });
  }

  onMoreSaloonStaff(event: any) {}

  onDeleteSaloonStaff(event: any): void {

    this.staffUID = event.uid;

    this.translate.get([
      'STAFF_PAGE.DELETE_TITLE',
      'COMMON.CONFIRM_DELETE',
      'COMMON.DELETE',
      'COMMON.CANCEL',
    ]).subscribe(translations => {

      const dialogRef = this.dialog.open(DeleteConfirmationComponent, {
        width: '420px',
        disableClose: true,
        data: {
          title: translations['STAFF_PAGE.DELETE_TITLE'],
          message: translations['COMMON.CONFIRM_DELETE'],
          itemName: `${event.firstName || ''} ${event.lastName || ''}`.trim(),
          confirmText: translations['COMMON.DELETE'],
          cancelText: translations['COMMON.CANCEL'],
        },
      });

      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.onConfirmDelete();
        }
      });
    });
  }

  onConfirmDelete() {
    this.saloonService.deleteSaloonStaff(this.staffUID).subscribe({
      next: (response) => {
        console.log('Delete response:', response);
        if (response.data) {
          this.alertService.show('success', 'POS_T.STAFF.DELETED');
          this.saloonStaff = this.saloonStaff.filter((staff) => staff.uid !== this.staffUID);
          this.saloonStaffEdited = [];
          this.cdr.detectChanges();
          console.log('Remaining staff:', this.saloonStaff);
        }
      },

      error: (error) => {
        console.error('Error on deleting staff:', error);
        this.alertService.show('error', 'POS_T.STAFF.DELETE_FAILED');
      },
    });
  }

  /**
   *******************************************************************************.   LIST STAFF METHOD.    ***********************************************************************
   */
  pageParam: PageableParam = {
    page: 0,
    size: 100,
  };
  saloonStaffPage: SaloonStaffEntity[] = [];
  saloonStaffDataSource = new MatTableDataSource<any>([]);
  staffColumnsPage: TableColumn[] = [
    {
      field: 'firstName',
      header: 'COMMON.FIRST_NAME',
      icon: 'person2',
      iconPosition: 'left',
      iconColor: '#198754',
    },
    {
      field: 'middleName',
      header: 'COMMON.MIDDLE_NAME',
    },
    {
      field: 'lastName',
      header: 'COMMON.LAST_NAME',
    },
    {
      field: 'phoneNumber',
      header: 'COMMON.PHONE',
      icon: 'more',
      iconPosition: 'left',
      iconColor: '#0d6efd',
    },
    {
      field: 'gender',
      header: 'COMMON.GENDER',
      cellColors: {
        Male: {
          background: '#e7f1ff',
          color: '#0d6efd',
        },
        Female: {
          background: '#fce7f3',
          color: '#d63384',
        },
      },
    },
    {
      field: 'saloonCategory',
      header: 'COMMON.CATEGORY',
      cellColors: {
        Barber: {
          background: '#e8f5e9',
          color: '#198754',
        },
        'Beauty Therapist': {
          background: '#fff3cd',
          color: '#856404',
        },
      },
    },
  ];


totalElements = 0;
totalPages = 0;

loadStaffPage() {
  this.saloonService.findSaloonStaffPage(this.pageParam).subscribe({
    next: (response) => {
      if (response.data) {
        this.saloonStaffDataSource.data = response.data;

        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;

        this.cdr.detectChanges();

        console.log('Staff Data:', this.saloonStaffDataSource.data);
      }
    },

    error: (error) => {
      console.error('Error Occurred', error);
    }
  });
}

  onViewStaff(staff: any): void {

    this.dialog.open(StaffDetailsDialogComponent, {
      width: '480px',
      maxWidth: '95vw',
      data: staff,
    });
  }

  staffPageUID: string = '';
  onEditSaloonStaffPage(event: any) {
    this.staffPageUID = event.uid;
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '1200px',
      data: {
        formTitle: 'POS_T.STAFF.EDIT_DETAILS',
        fields: this.editStaffFields,
        formData: [event],
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // console.log('Edited Data', result);
        const saloonStaffDTO: SaloonStaffDTO = {
          uid: this.staffPageUID,
          firstName: result.firstName,
          middleName: result.middleName,
          lastName: result.lastName,
          description: result.description,
          gender: result.gender,
          dateOfBirth: result.dateOfBirth,
          saloonCategory: result.saloonCategory,
          phoneNumber: result.phoneNumber,
        };
        this.saloonService.saveSaloonStaff(saloonStaffDTO).subscribe({
          next: (res) => {
            if (res) {
              console.log('Edited Data', res.data);
              const index = this.saloonStaffDataSource.data.findIndex(
                (staff) => staff.uid === this.staffPageUID,
              );
              if (index != -1) {
                this.saloonStaffDataSource.data[index] = res.data;
                this.saloonStaffDataSource.data = [...this.saloonStaffDataSource.data];
                this.alertService.show('success', 'POS_T.STAFF.UPDATED');
                this.cdr.detectChanges();
                this.staffPageUID = '';
              }
            }
          },
          error: (error) => {
            console.error('Error Occurred', error);
          },
        });
      }
    });
  }

  onDeleteSaloonStaffPage(event: any) {

    this.staffPageUID = event.uid;

    this.translate.get([
      'STAFF_PAGE.DELETE_TITLE',
      'COMMON.CONFIRM_DELETE',
      'COMMON.DELETE',
      'COMMON.CANCEL',
    ]).subscribe(translations => {

      const dialogRef = this.dialog.open(DeleteConfirmationComponent, {
        width: '420px',
        disableClose: true,
        data: {
          title: translations['STAFF_PAGE.DELETE_TITLE'],
          message: translations['COMMON.CONFIRM_DELETE'],
          itemName: `${event.firstName || ''} ${event.lastName || ''}`.trim(),
          confirmText: translations['COMMON.DELETE'],
          cancelText: translations['COMMON.CANCEL'],
        },
      });

      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.onConfirmDeleteStaffPage();
        }
      });
    });
  }

  onConfirmDeleteStaffPage() {
    this.saloonService.deleteSaloonStaff(this.staffPageUID).subscribe({
      next: (res) => {
        if (res.data) {
          console.log('Deleted Data', res.data);
          const index = this.saloonStaffDataSource.data.findIndex( (staff) => staff.uid === res.data.uid);
          if (index !== -1) {
            this.saloonStaffDataSource.data.splice(index, 1);
            this.saloonStaffDataSource.data = [...this.saloonStaffDataSource.data];
            this.cdr.detectChanges();
            this.alertService.show('success', 'POS_T.STAFF.DELETED')
          }
        }
      },
      error: (error) => {
        console.error('Error in Deleting Staff', error);
      },
    });
  }
 changePage(page: number) {

  if (page < 0 || page >= this.totalPages) {
    return;
  }

  this.pageParam.page = page;

  this.loadStaffPage();
}

changePageSize(event: Event) {

  const value = (event.target as HTMLSelectElement).value;

  this.pageParam.size = Number(value);

  // Rudi page ya kwanza
  this.pageParam.page = 0;

  this.loadStaffPage();
}
goToPage(page: number) {

  if (page < 0 || page >= this.totalPages) {
    return;
  }

  this.pageParam.page = page;

  this.loadStaffPage();
}


}

