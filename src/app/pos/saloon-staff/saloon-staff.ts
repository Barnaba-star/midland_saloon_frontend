import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-saloon-staff',
  standalone: true,
  imports: [
    Title2,
    MatIconModule,
    Form3,
    RecordtableComponent,
    TranslatePipe,
    MatTooltipModule,
  ],
  templateUrl: './saloon-staff.html',
  styleUrl: './saloon-staff.css',
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
      roles: ['ROOT'],
    },
    {
      icon: 'more',
      title: 'STAFF.MANAGE',
      roles: ['ROOT'],
    },
  ];

  getTitled(title: TitleAction[]): TitleAction[] {
    return this.visibility.filteredTitleActions(title);
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
      label: 'First Name',
      placeholder: 'Enter staff name',
      required: true,
    },
    {
      name: 'middleName',
      type: 'text',
      label: 'Middle Name',
      placeholder: 'Enter staff name',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
      placeholder: 'Enter staff name',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
      placeholder: 'Enter phone number',
      required: true,
    },
    {
      name: 'saloonCategory',
      label: 'Category',
      type: 'select',
      options: [
        { label: 'Beauty Therapist', value: 'Beauty Therapist' },
        { label: 'Barber', value: 'Barber' },
      ],
    },
    {
      label: 'Date of Birth',
      name: 'dateOfBirth',
      placeholder: 'date of Birth',
      type: 'date',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      rows: 1,
      colSpan: 2,
    },
    {
      name: 'gender',
      label: 'Gender',
      type: 'radio',
      options: [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
      ],
    },
  ];

  editStaffFields: FormField[] = [
    {
      name: 'firstName',
      type: 'text',
      placeholder: 'Enter staff name',
      required: true,
    },
    {
      name: 'middleName',
      type: 'text',
      placeholder: 'Enter staff name',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      placeholder: 'Enter staff name',
      required: true,
    },
    {
      name: 'phoneNumber',
      type: 'text',
      placeholder: 'Enter phone number',
      required: true,
    },
    {
      name: 'saloonCategory',
      type: 'select',
      options: [
        { label: 'Beauty Therapist', value: 'Beauty Therapist' },
        { label: 'Barber', value: 'Barber' },
      ],
    },
    {
      name: 'dateOfBirth',
      placeholder: 'date of Birth',
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
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
      ],
    },
  ];

  saloonStaff: SaloonStaffEntity[] = [];
  saloonStaffEdited: SaloonStaffEntity[] = [];
  staffColumns = [
    {
      field: 'firstName',
      header: 'First Name',
    },
    {
      field: 'middleName',
      header: 'Middle Name',
    },
    {
      field: 'lastName',
      header: 'Last Name',
    },
    {
      field: 'phoneNumber',
      header: 'Phone Number',
    },
    {
      field: 'saloonCategory',
      header: 'Category',
    },
    {
      field: 'gender',
      header: 'Gender',
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
          this.alertService.show('success', 'Saloon staff saved successfully.');
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
        formTitle: 'Update Staff',
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
            this.alertService.show('success', 'Saloon staff updated successfully.');
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
          this.alertService.show('success', 'Staff Deleted');
          this.saloonStaff = this.saloonStaff.filter((staff) => staff.uid !== this.staffUID);
          this.saloonStaffEdited = [];
          this.cdr.detectChanges();
          console.log('Remaining staff:', this.saloonStaff);
        }
      },

      error: (error) => {
        console.error('Error on deleting staff:', error);
        this.alertService.show('error', 'Failed to delete staff');
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
      header: 'First Name',
      icon: 'person2',
      iconPosition: 'left',
      iconColor: '#198754',
    },
    {
      field: 'middleName',
      header: 'Middle Name',
    },
    {
      field: 'lastName',
      header: 'Last Name',
    },
    {
      field: 'phoneNumber',
      header: 'Phone',
      icon: 'more',
      iconPosition: 'left',
      iconColor: '#0d6efd',
    },
    {
      field: 'gender',
      header: 'Gender',
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
      header: 'Category',
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
        formTitle: 'Edit Staff Details',
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
                this.alertService.show('success', 'Data Successfully Updated');
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
            this.alertService.show('success', 'Staff Deleted')
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

