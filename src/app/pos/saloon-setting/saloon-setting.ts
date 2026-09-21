import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TitleAction, Title2 } from "../../Utils/component/title2/title2";
import { Authentication } from '../../Utils/services/authentication';
import { MatIconModule } from "@angular/material/icon";
import { FormField } from '../../Utils/models/form-field';
import { Form3 } from "../../Utils/component/form3/form3";
import { CommissionDTO, SaloonServiceData, SaloonServiceDTO, UserTableData } from '../SaloonModel';
import { SaloonService } from '../saloon-service/saloon-service';
import { ServiceSaloonMethod } from '../service-saloon-method';
import { AlertService } from '../../Utils/services/alert';
import { RecordtableComponent } from "../../Utils/component/recordtable/recordtable";
import { PageableParam, TableColumn } from '../../Utils/models/responces';
import { MatTableDataSource } from '@angular/material/table';
import { TableComponent } from "../../Utils/component/table/table";
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../Utils/component/dialog/dialog';
import { EditCommissionDialogComponent } from '../../Utils/component/dialogs/edit-commission-dialog-component/edit-commission-dialog-component';
import { error } from 'console';
import { DeleteDialogComponent } from "../../Utils/component/delete-dialog/delete-dialog";
import { CommonModule, DecimalPipe, UpperCasePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatButtonModule } from "@angular/material/button";

export interface SaloonServiceEntity {
  uid?: string;
  serviceName?: string;
  serviceCode?: string;
  status?: string;
  description?: string;
  commissionType?: string;
  commissionValue?: number;
  duration?: number;
  price?: number;
  updatedAt?: string | null;
  usageType?:string;
}

@Component({
  selector: 'app-saloon-setting',
  imports: [Title2, MatIconModule, Form3, RecordtableComponent, DeleteDialogComponent, DecimalPipe, UpperCasePipe, CommonModule, FormsModule, MatMenuModule, MatPaginator, MatButtonModule, TranslatePipe, MatTooltipModule],
  templateUrl: './saloon-setting.html',
  styleUrl: './saloon-setting.css',
})
export class SaloonSetting implements OnInit{
// Templates can't see the global `Math` object directly — expose it
// here so `Math.min(...)` in saloon-setting.html resolves.
protected readonly Math = Math;

changePage(arg0: number) {
throw new Error('Method not implemented.');
}
changePageSize($event: Event) {
throw new Error('Method not implemented.');
}

  saloonServiceInfo:Boolean=false;
  saloonServiceAddForm:Boolean=false;
  saloonServiceDelete:Boolean=false;
  constructor(
    private visibility: Authentication, private service: ServiceSaloonMethod, private alertService: AlertService, private cdr: ChangeDetectorRef,
    private dialog:MatDialog, private saloonService:ServiceSaloonMethod
  ) { }
  ngOnInit(): void {
    this.selectedSetting='SALON.SERVICE'
      this.saloonServiceInfo=false;
  this.saloonServiceAddForm=false;
  this.saloonServiceDelete=false;
  this.serviceDataSource.data=[];
  this.findSaloonServicePage();
  this.addCommission=false;
  }
  selectedSetting = '';
  titleActions: TitleAction[] = [
    {
      icon: 'person2',
      title: 'SALON.STAFF',
      roles: ['ROOT']
    },
    {
      icon: 'service',
      title: 'SALON.SERVICE',
      roles: ['ROOT']
    },

    {
      icon: 'commission',
      title: 'SALON.COMMISSION',
      roles: ['ROOT']
    }
  ];

  getTitled(title: TitleAction[]): TitleAction[] {
    return this.visibility.filteredTitleActions(title);
  }

  onAction(action: string) {
  this.selectedSetting = action;
 if (action === 'SALON.SERVICE') {
  this.saloonServiceInfo=false;
  this.saloonServiceAddForm=false;
  this.saloonServiceDelete=false;
  this.serviceDataSource.data=[];
  this.findSaloonServicePage();
  this.addCommission=false;

 }
  if (action === 'SALON.COMMISSION') {
  this.addCommission=false;
  this.findCommissionPage();

 }
 if(action === 'SALON.STAFF'){
  this.findUserPageByBranch();

 }
}
serviceFields:FormField[] = [
  {
    name: 'serviceName',
    type: 'text',
    label: 'Service Name',
    placeholder: 'Enter service name',
    required: true,
  },
    {
    name: 'serviceCode',
    type: 'text',
    label: 'Service Code',
    placeholder: 'Enter service code',
    required: true,
  },
  {
    name: 'price',
    type: 'number',
    label: 'Price',
    placeholder: 'Enter price',
    required: true,
  },
  {
    name: 'duration',
    type: 'number',
    label: 'Duration (in minutes)',
    placeholder: 'Enter duration in minutes',
    required: true,
  },
   {
    name: 'status',
    type: 'select',
    placeholder: 'Enter status',
    required: true,
    options: [
      { value: 'active', label: 'Active' },
      { value: 'Not Active', label: 'Not Active' }
    ]
  },
   {
    name:'usageType',
    type:'select',
    placeholder:'Usage Type',
    options:[{label:'ASSIGNED', value:'ASSIGNED'}, {label:'SHARED', value:'SHARED'}]
  },
    {
    name: 'description',
    type: 'textarea',
    label: 'Description',
    placeholder: 'Enter service description',
    required: true,

  },

]

serviceFieldsEdit:FormField[] = [
  {
    name: 'serviceName',
    type: 'text',
    placeholder: 'Enter service name',
    required: true,
  },
    {
    name: 'serviceCode',
    type: 'text',
    placeholder: 'Enter service code',
    required: true,
  },
  {
    name: 'price',
    type: 'number',
    placeholder: 'Enter price',
    required: true,
  },
  {
    name: 'duration',
    type: 'number',
    placeholder: 'Enter duration in minutes',
    required: true,
  },
  {
    name:'usageType',
    type:'select',
    placeholder:'Usage Type',
    options:[{label:'ASSIGNED', value:'ASSIGNED'}, {label:'SHARED', value:'SHARED'}]
  },
    {
    name: 'status',
    type: 'select',
    placeholder: 'Enter status',
    required: true,
    options: [
      { value: 'active', label: 'Active' },
      { value: 'Not Active', label: 'Not Active' }
    ]
  },
    {
    name: 'description',
    type: 'textarea',
    placeholder: 'Enter service description',
    required: true,

  },

]

saloonServiceEntity: SaloonServiceEntity = {};
saloonServiceList: SaloonServiceEntity[] = [];
serviceColumns: {
  field: string;
  header: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  iconColor?: string;
  cellColors?: {
    [value: string]: {
      background: string;
      color: string;
    };
  };
}[] = [
  {
    field: 'serviceName',
    header: 'Service',
    icon: 'more',
    iconPosition: 'left',
    iconColor: '#413e58'
  },
  {
    field: 'serviceCode',
    header: 'Code'
  },
  {
    field: 'price',
    header: 'Price',
    icon: 'more',
    iconPosition: 'left',
    iconColor: '#28a745'
  },
  {
    field: 'duration',
    header: 'Duration',
    icon: 'more',
    iconPosition: 'left',
    iconColor: '#6c757d'
  },
   {
    field: 'usageType',
    header: 'usageType',
    icon: 'more',
    iconPosition: 'left',
    iconColor: '#6c757d'
  },
  {
    field: 'status',
    header: 'Status'
  }
];
onAddService(){
  this.saloonServiceAddForm=true;
  this.saloonServiceInfo=false;
  this.serviceDataSource.data=[];
}
submitServiceForm(data: any) {
    this.saloonServiceAddForm=false;
    this.saloonServiceInfo=false;
  const saloonServiceDTO:SaloonServiceDTO={
    serviceName: data.serviceName,
    serviceCode: data.serviceCode,
    price: data.price,
    duration: data.duration,
    status: data.status,
    description: data.description,
    usageType:data.usageType
  }
  console.log('Service DTO:', saloonServiceDTO);
  this.service.saveSaloonEntity(saloonServiceDTO).subscribe({
    next: (response) => {
      if(response){
        this.alertService.show('success', 'Service saved successfully!');
        this.saloonServiceEntity = response.data;
        this.cdr.detectChanges();
        console.log('Service saved successfully:', this.saloonServiceEntity);
      }
    },
    error: (error) => {
      console.error('Error saving service:', error);
    }
  })
  }


   onViewRecord(row: any) {
    console.log('View record:', row);
   }

   param:PageableParam = {
    page: 0,
    size: 5,
  }
  onPageChange(newPage: number) {
    this.param.page = newPage;
  }


serviceDataSource = new MatTableDataSource<SaloonServiceEntity>([]);
serviceEditUID:string='';
tableConfig = {
  displayedColumns: [
    { field: 'serviceName', header: 'SERVICE NAME' },
    { field: 'serviceCode', header: 'SERVICE CODE' },
    { field: 'price', header: 'PRICE' },
    { field: 'duration', header: 'DURATION' },
    {field:'usageType', header:'usageType'},
    { field: 'status', header: 'STATUS' }
  ] as TableColumn[]
};

findSaloonServicePage() {
  this.saloonServiceAddForm = false;
  this.saloonServiceInfo = false;
  this.saloonServiceEntity = {};

  this.param = {
    page: this.page,
    size: this.size
  };

  this.service.findSaloonServicePage(this.param).subscribe({
    next: (response) => {
      if (response) {
        this.serviceDataSource.data = response.data || [];

        // Pagination information kutoka backend
        this.totalElements = response.totalElements || 0;
        this.totalPages = response.totalPages || 0;

        console.log('Page:', this.page);
        console.log('Size:', this.size);
        console.log('Total Elements:', this.totalElements);
        console.log('Total Pages:', this.totalPages);
        console.log('Services:', this.serviceDataSource.data);

        this.cdr.detectChanges();
      }
    },

    error: (error) => {
      console.error('Error fetching saloon service page:', error);
    }
  });
}

previousPage() {
  if (this.page > 0) {
    this.page--;
    this.findSaloonServicePage();
  }
}

nextPage() {
  if (this.page < this.totalPages - 1) {
    this.page++;
    this.findSaloonServicePage();
  }
}



   onEditRecord(row: any) {
    console.log('Edit record:', row);
    this.serviceEditUID = row.uid
        const dialogRef = this.dialog.open(DialogComponent, {
          width: '1200px',
          data: {
            formTitle: 'Update Staff',
            fields: this.serviceFieldsEdit,
            formData: [row],
          },
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (!result) return;
           console.log('Updated form data:', result);
              const saloonServiceDTO:SaloonServiceDTO={
              uid: this.serviceEditUID,
              serviceName: result.serviceName,
              serviceCode: result.serviceCode,
              price: result.price,
              duration: result.duration,
              status: result.status,
              description: result.description,
              usageType:result.usageType
            }
            console.log('Service Edited Value is:', saloonServiceDTO);
              this.service.saveSaloonEntity(saloonServiceDTO).subscribe({
                  next: (response) => {
                    if(response){
                      this.alertService.show('success', 'Service Updated successfully!');
                      const index =   this.serviceDataSource.data.findIndex(service=> service.uid === response.data.uid);
                      if(index !== -1){
                        this.serviceDataSource.data[index]=response.data;
                        this.serviceDataSource.data = [...this.serviceDataSource.data];
                        this.cdr.detectChanges();
                      }
                    }
                  },
                  error: (error) => {
                    console.error('Error saving service:', error);
                  }
                })
          });


   }
   onDeleteRecord(row:any){
   console.log('Delete record:', row);
    this.serviceEditUID='';
    this.serviceEditUID=row.uid;
    this.saloonServiceDelete=true;
   }

   onCancelDelete(){
    this.saloonServiceDelete=false;
   }
    onConfirmDeleteRecord() {
    this.saloonServiceDelete = false;
    this.service.deleteServiceSaloonByUID(this.serviceEditUID).subscribe({
      next:(res)=>{
        if(res){
          console.log('Service Deleted Successfully', res.data);
          const index = this.serviceDataSource.data.findIndex(service=> service.uid === res.data.uid);
          if(index !== -1){
            this.serviceDataSource.data.splice(index, 1);
            this.serviceDataSource.data = [...this.serviceDataSource.data];
            this.cdr.detectChanges();
            this.alertService.show('success', 'Service successfully Deleted');
            this.serviceEditUID='';
          }
        }
      },
      error:(error)=>{
        console.error('Error Occurred', error)
        this.alertService.show('error', 'Error When Deleting Service');
      }
    })
   }



   /****
    * ************************************************************************** COMMISSIONS METHODS*****************************************************************
    */

   addCommission:Boolean=false;
   configureCommission:Boolean=false;
   selectedService:Boolean=false;
   saloonServiceData:SaloonServiceData={};
addCommissionForm: FormField[] = [
  {
    name: 'serviceName',
    type: 'select',
    placeholder: 'Service/Huduma',
    required: true,
    options: []
  }
];

findSaloonServiceList() {
  this.addCommission = true;
   this.selectedService=false;
   this.commissionDataSource=[];
  this.saloonService.findSaloonServiceList().subscribe({
    next: (res) => {
      console.log('Service Founds', res.data)
this.addCommissionForm[0].options = (res.data ?? []).map((service: any) => ({
  label: service.serviceName,
  value: service.uid
}));
      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error('Error Occurred', error);
      this.alertService.show('error', 'Error When Loading Services');
    }
  });
}

    onAddCommission(){
      this.commissionDataSource=[];
    this.selectedService=false;
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '1200px',
      data:{
        formTitle: 'Select Service/Chagua Huduma',
        fields: this.addCommissionForm,
      }

    });
     dialogRef.afterClosed().subscribe((result) => {
          if (!result) return;
          console.log('Commission Selected', result)
          this.saloonService.findSaloonServiceByUID(result.serviceName).subscribe({
            next:(res)=>{
              if(res){
                console.log('Service By UID', res.data);
                this.saloonServiceData=res.data;
                this.selectedService=true;
                this.cdr.detectChanges();
              }
            },
             error: (error) => {
      console.error('Error Occurred', error);
      this.alertService.show('error', 'Error When Loading Services');
    }
          })
     })
   }


servicePrice = 0;
remainingAmount = 0;

commissionRows = [
  { name: 'Staff Commission', code: 'STF', amount: 0, percentage: 0 },
  { name: 'Owner Commission', code: 'OWN', amount: 0, percentage: 0 },
  { name: 'Maintenance', code: 'MTN', amount: 0, percentage: 0 },
  { name: 'TRA Commission', code: 'TRA', amount: 0, percentage: 0 },
  { name: 'Emergency', code: 'EMG', amount: 0, percentage: 0 },
  { name: 'Others', code: 'OTH', amount: 0, percentage: 0 },
  { name: 'Rent', code: 'RT', amount: 0, percentage: 0 },
  { name: 'Loan', code: 'LN', amount: 0, percentage: 0 },
  { name: 'Luku', code: 'LK', amount: 0, percentage: 0 },
  { name: 'Water', code: 'WTR', amount: 0, percentage: 0 },
  { name: 'Stock Purchase', code: 'SP', amount: 0, percentage: 0 }
];

calculateCommission(row: any) {
  const price = Number(this.saloonServiceData.price) || 0;
  const amount = Number(row.amount) || 0;

  row.percentage = price > 0
    ? (amount / price) * 100
    : 0;

  this.remainingAmount = price -
    this.commissionRows.reduce(
      (total, item) => total + (Number(item.amount) || 0),
      0
    );
}

saveCommission() {

  const commission: CommissionDTO = {
    saloonServiceUID: this.saloonServiceData.uid,

    staffPercent:
      this.commissionRows.find(x => x.code === 'STF')?.percentage || 0,

    ownerPercent:
      this.commissionRows.find(x => x.code === 'OWN')?.percentage || 0,

    maintenancePercent:
      this.commissionRows.find(x => x.code === 'MTN')?.percentage || 0,

    traPercent:
      this.commissionRows.find(x => x.code === 'TRA')?.percentage || 0,

    emergencyPercent:
      this.commissionRows.find(x => x.code === 'EMG')?.percentage || 0,

    otherPercent:
      this.commissionRows.find(x => x.code === 'OTH')?.percentage || 0,
    loanPercent:
      this.commissionRows.find(x => x.code === 'LN')?.percentage || 0,
          rentPercent:
      this.commissionRows.find(x => x.code === 'RT')?.percentage || 0,
          waterPercent:
      this.commissionRows.find(x => x.code === 'WTR')?.percentage || 0,
          lukuPercent:
      this.commissionRows.find(x => x.code === 'LK')?.percentage || 0,
        stockPurchasePercent:
      this.commissionRows.find(x => x.code === 'SP')?.percentage || 0,

    totalPercent: this.commissionRows.reduce(
      (total, row) => total + (Number(row.percentage) || 0),
      0
    )
  };

  console.log('Commission DTO:', commission);
  this.saloonService.saveCommissions(commission).subscribe({
    next:(res)=>{
      if(res){
        console.log('Commission saved', res.data);
        this.alertService.show('success', 'commission saved')
         this.addCommission =false;
         this.selectedService=false;
         this.serviceDataSource.data=[]
         this.cdr.detectChanges();
      }
    },
     error: (error) => {
      console.error('Error Occurred', error);
      this.alertService.show('error', 'Error When Loading Services');
  }
})
}
page = 0;
size = 5;

totalElements = 0;
totalPages = 0;
commissionDataSource: any[] = [];

findCommissionPage() {
  this.addCommission = false;
  this.selectedService = false;
  const params: PageableParam = {
    page: this.page,
    size: this.size
  };

  this.saloonService.findCommissionPage(params).subscribe({
    next: (res) => {
      if (res.data) {
        this.commissionDataSource = res.data;

        // Muhimu: hizi lazima zitoke kwenye pagination response
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;

        this.cdr.detectChanges();

        console.log('Data Found:', res);
      }
    },
    error: (err) => {
      console.error('Error fetching commission page:', err);
    }
  });
}
onCommissionPageChange(event: PageEvent) {
  this.page = event.pageIndex;
  this.size = event.pageSize;

  this.findCommissionPage();
}


editCommission(commission: any) {
  const dialogRef = this.dialog.open(EditCommissionDialogComponent, {
    width: '480px',
    maxHeight: '85vh',
    data: { commission },
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (!result) return;

    const commissionDTO: CommissionDTO = {
      uid: commission.uid,
      saloonServiceUID: commission.saloonServiceUID,
      ...result,
    };

    this.saloonService.saveCommissions(commissionDTO).subscribe({
      next: (res) => {
        if (res) {
          this.alertService.show('success', 'Commission updated successfully');
          const index = this.commissionDataSource.findIndex(item => item.uid === commission.uid);
          if (index !== -1) {
            // Merge instead of replacing outright: the update response only
            // carries the CommissionDTO fields, not the joined display
            // fields (e.g. serviceName, price) the list endpoint returns -
            // a full replace was wiping those out of the row after saving.
            this.commissionDataSource[index] = { ...this.commissionDataSource[index], ...res.data };
            this.commissionDataSource = [...this.commissionDataSource];
            this.cdr.detectChanges();
          }
        }
      },
      error: (error) => {
        console.error('Error updating commission:', error);
        this.alertService.show('error', error?.error?.message || 'Error updating commission');
      }
    });
  });
}

deleteCommission(commission: any) {
  console.log('Delete commission:', commission);

  this.saloonService.deleteCommission(commission.uid).subscribe({
    next: (res) => {
      console.log('Commission deleted successfully:', res);

      this.commissionDataSource = this.commissionDataSource.filter(
        (item) => item.uid !== commission.uid
      );

      this.totalElements--;

      if (this.commissionDataSource.length === 0 && this.page > 0) {
        this.page--;
      }

      this.findCommissionPage();
      this.cdr.detectChanges();

      this.alertService.show(
        'success',
        'Commission successfully deleted'
      );
    },

    error: (err) => {
      console.error('Error deleting commission:', err);

      this.alertService.show(
        'error',
        err?.error?.message || 'Error deleting commission'
      );
    }
  });
}



userDataSource: UserTableData[] = [];findUserPageByBranch() {

  const params: PageableParam = {
    page: this.page,
    size: this.size
  };

  this.saloonService.findUserPageByBranch(params).subscribe({

    next: (res) => {

      if (res.data) {

        this.userDataSource = res.data.map((user: any): UserTableData => ({

          uid: user.uid,

          username: user.username || '--',

          fullName: [
            user.firstName,
            user.middleName,
            user.lastName
          ]
            .filter(Boolean)
            .join(' ') || '--',

          roleName: user.roles?.[0]?.name || '--',

          branchName: user.branch?.branchName || '--'

        }));

        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;

        this.page = res.currentPage;
        this.size = res.size;

        this.cdr.detectChanges();

        console.log('User Table Data:', this.userDataSource);
      }

    },

    error: (err) => {
      console.error('Error fetching users:', err);
    }

  });
}

}



