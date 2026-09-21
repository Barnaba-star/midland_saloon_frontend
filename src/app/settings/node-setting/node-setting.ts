import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TitleAction } from "../../Utils/component/title/title.component";
import { FormField } from '../../Utils/models/form-field';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from "@angular/material/icon";
import { Authentication } from '../../Utils/services/authentication';
import { BranchDTO } from './NodeModel';
import { Branch } from './NodeModel';
import { NodeService } from './node-service';
import { AlertService } from '../../Utils/services/alert';
import { RecordtableComponent } from "../../Utils/component/recordtable/recordtable";
import { PageableParam } from '../../Utils/models/responces';
import { DeleteDialogComponent } from "../../Utils/component/delete-dialog/delete-dialog";
import { MatStepperModule } from "@angular/material/stepper";
import { FormGroup } from '@angular/forms';
import { FormTWO } from "../../Utils/component/form-two/form-two";
import { MatAnchor } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDivider } from "@angular/material/divider";
import { ViewChild} from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { Title2 } from "../../Utils/component/title2/title2";
import { CommonModule } from '@angular/common';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Form3 } from '../../Utils/component/form3/form3';
import { DialogComponent } from '../../Utils/component/dialog/dialog';
import { error } from 'console';
import { ConfirmDeleteDialogComponent } from '../../Utils/component/dialogs/confirm-delete-dialog-component/confirm-delete-dialog-component';
import { UserViewDialogComponent } from '../../Utils/component/dialogs/user-view-dialog-component/user-view-dialog-component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-node-setting',
  imports: [MatIconModule,  MatStepperModule,  MatCardModule, Title2, CommonModule, MatPaginator, Form3, TranslatePipe, MatTooltipModule],
  templateUrl: './node-setting.html',
  styleUrl: './node-setting.css',
})
export class NodeSetting implements OnInit{
constructor(private dialog:MatDialog, private visibility:Authentication, private nodeService:NodeService, private alertService:AlertService, private cdr: ChangeDetectorRef, private translate: TranslateService) {

  // .get() waits for the translation file to finish loading, unlike
  // .instant() which returns the raw key if called too early (e.g.
  // right after a hard refresh, before en.json/sw.json has loaded).
  this.translate.get('NODE_SETTING_PAGE.FORM_TITLE_REGISTER').subscribe(text => {
    this.formTitle = text;
    this.cdr.markForCheck();
  });

  this.translate.onLangChange.subscribe(() => {
    this.formTitle = this.translate.instant('NODE_SETTING_PAGE.FORM_TITLE_REGISTER');
    this.cdr.markForCheck();
  });
}

@ViewChild('stepper')
stepper !: MatStepper;
get currentStep():number{
return this.stepper?.selectedIndex + 1 || 1;
}

get totalSteps():number {
  return this.stepper?.steps.length || 0;
}
ngOnInit(): void {
this.selectedNode ='NODE_SETTING_PAGE.MANAGE_BRANCH_TAB'
this.loadBranches();
}

selectedNode = '';
titleActions = [
    { icon: 'add', title: 'NODE_SETTING_PAGE.ADD_BRANCH_TAB', roles: ['ROOT'] },
    { icon: 'more', title: 'NODE_SETTING_PAGE.MANAGE_BRANCH_TAB', roles: ['ROOT', 'REG OFFICER'] }
];
onAction(action: string) {
    this.selectedNode = action;
    if(this.selectedNode ==='NODE_SETTING_PAGE.MANAGE_BRANCH_TAB'){

    }
  }

getTitled(title:TitleAction[]):TitleAction[]{
return this.visibility.filteredTitleActions(title);
}
//*************************************** ADD NEW NODE LIST******************************************************/
nodeFormField: FormField[] = [
{
    name: 'uid',
    label: 'UID',
    type: 'text',
    hidden: true,
    required: false
  },
  {
    name: 'branchName',
    placeholder: 'Branch Name',
    type: 'text',
    required: true,

  },


 {
    name: 'branchCategory',
    placeholder: 'Branch Category',
    type: 'select',
    required: true,
    options: [
      { label: 'Saloon', value: 'Saloon' },
      { label: 'Real Estate', value: 'Real Estate' },
      { label: 'Restaurant', value: 'Restaurant' },
      { label: 'Bar', value: 'Bar' }
    ],

  },
 {
    name: 'region',
    placeholder: 'Region',
    type: 'select',
    required: true,
    options: [
      { label: 'Dodoma', value: 'Dodoma' },
      { label: 'Dar es Salaam', value: 'Dar es Salaam' },
      { label: 'Morogoro', value: 'Morogoro' }
    ],

  },
  {
    name: 'address',
    placeholder: 'Address',
    type: 'text',
    rows: 3,
    required: false,

  },

  {
    name: 'phone',
    placeholder: 'Phone Number',
    type: 'text',
    required: false,

  },
  {
    name: 'status',
    placeholder: 'Status',
    type: 'select',
    required: true,
    options: [
      { label: 'Active', value: 'Active' },
      { label: 'Inactive', value: 'Not Active' }
    ],

  },
  {
    name: 'description',
    placeholder: 'Branch Description',
    type: 'textarea',
    rows: 4,
    required: false,

  }
];

branchForm ! : FormGroup;
branchDetailForm !: FormGroup;



andBranch:Boolean=false;
formTitle = '';

onSubmit(event: any): void {
  console.log('Payload:', event);
  const branchDTO:BranchDTO={
    phone:event.phone,
    address:event.address,
    branchCategory:event.branchCategory,
    branchName:event.branchName,
    region:event.region,
    description:event.description,
    status:event.status
  }
  this.saveBranch(branchDTO);
}


saveBranch(branchDTO: BranchDTO): void {
  this.nodeService.saveBranch(branchDTO).subscribe({
    next: (response) => {
      if(response.data){

      this.loadBranches();
      this.cdr.detectChanges();
      console.log('branchData', response.data);
      }
    },
    error: (error) => {
      console.error('Failed to save branch', error);
    }
  });
}
branchData = {
  uid: '',
  branchName: '',
  branchCode: '',
  branchType: '',
  branchCategory: '',
  region: '',
  address: '',
  phone: '',
  status: '',
  description: '',
};
columns = [
  { field: 'branchName', header: 'BRANCH NAME' },
  { field: 'branchCode', header: 'BRANCH CODE' },
  { field: 'branchType', header: 'BRANCH TYPE' },
  { field: 'branchCategory', header: 'CATEGORY' },
  { field: 'region', header: 'REGION' },
  { field: 'phone', header: 'PHONE NO' },
  { field: 'status', header: 'STATUS' }
];

tableData: any[] = [];
findBranchByUID(branchUID:string){
this.nodeService.findBranchByUID(branchUID).subscribe({
next:(respose)=>{
      console.log('Branch Data:', respose.data);
    },
error:(error)=>{
    console.error('Error occured ', error);
  }
});
}

  tableConfig = {
    displayedColumns: [
      'branchName',
      'branchCode',
      'branchType',
      'branchCategory',
      'region',
      'phone',
      'status'
    ],
    columnHeaderMap: {
      branchName: 'BRANCH NAME',
      branchCode: 'BRANCH CODE',
      branchType: 'BRANCH TYPE',
      branchCategory: 'BRANCH CATEGORY',
      region: 'REGION',
      phone: 'PHONE NO',
      staus: 'STATUS'
    },
  };
branch: Branch[] = [];
pageIndex = 0;
pageSize = 10;
totalBranches = 0;
loadBranches(): void {

  const params: PageableParam = {

    searchParam: 'Barnaba',

    page: this.pageIndex,

    size: this.pageSize,

    sortBy: 'createdAt',

    direction: 'DESC',
  };

  this.nodeService.findBranchPage(params).subscribe({

    next: (response) => {

      this.branch = response.data || [];

      /*
       * HAPA tunahitaji total number ya records
       * kutoka backend.
       */
      this.totalBranches = response.totalElements || 0;

      this.cdr.detectChanges();
    },

    error: (error) => {

      console.error(
        'Error Occurred',
        error
      );

    }

  });
}
onBranchPageChange(event: PageEvent): void {

  this.pageIndex = event.pageIndex;

  this.pageSize = event.pageSize;

  this.loadBranches();
}

deleteItem(item: any): void {

  this.translate.get([
    'NODE_SETTING_PAGE.DELETE_TITLE',
    'COMMON.CONFIRM_DELETE'
  ]).subscribe(translations => {
    this.openDeleteDialog(item, translations);
  });
}

private openDeleteDialog(item: any, translations: Record<string, string>): void {

  const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
    width: '450px',
    disableClose: true,
    data: {
      title: translations['NODE_SETTING_PAGE.DELETE_TITLE'],
      message: translations['COMMON.CONFIRM_DELETE'],
      item: item
    }
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      this.nodeService.deleteBranch(result.uid).subscribe({
        next: (res) => {
          if (res.data) {
            this.branch = this.branch.filter(
              (branch: any) => branch.uid !== result.uid
            );
            this.cdr.detectChanges();
            this.alertService.show('success', 'Branch Deleted');
          }
        },
        error: (error) => {
          console.error('Delete failed:', error);
        }
      });
    }
  });
}



editItem(item: any): void {
  console.log('Edit item:', item);

  this.translate.get('NODE_SETTING_PAGE.FORM_TITLE_UPDATE').subscribe(formTitle => {
    this.openEditDialog(item, formTitle);
  });
}

private openEditDialog(item: any, formTitle: string): void {

  const dialogRef = this.dialog.open(DialogComponent, {
    width: '1200px',
    data: {
      fields: this.nodeFormField,
      formTitle,
      formData: item,
      uid: item.uid
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      console.log('Dialog closed with result:', result);
      const brachDTO:BranchDTO={
        uid:result.uid,
        branchName:result.branchName,
        branchCode:result.branchCode,
        branchCategory:result.branchCategory,
        phone:result.phone,
        address:result.address,
        description:result.description,
        status:result.status,
        region:result.region
      }
      this.nodeService.saveBranch(brachDTO).subscribe({
        next:(res)=>{
          if(res.data){
            console.log('Updated Branch', res.data);
            const index = this.branch.findIndex(idx=>idx.uid === res.data.uid);
            if(index !==-1){
              this.branch[index] = res.data;
              this.cdr.detectChanges();
              this.alertService.show('success', 'Branch Updated');
            }
          }
        },
        error:(error)=>{
          this.alertService.show('error', 'Error when Updating Branch');
        }
      })

    }
  });
}


moreActions(item: any): void {

  console.log('More actions for:', item);

  this.nodeService.findAllUsersWithBranchAndRoles(item.uid).subscribe({

    next: (res) => {

      if (res.data && res.data.length > 0) {

        const user = res.data[0];

        console.log('User:', user);

        this.dialog.open(UserViewDialogComponent, {
          width: '850px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          data: user,
          panelClass: 'user-view-dialog'
        });

      }

    },

    error: (error) => {
      console.error('Error fetching user:', error);

      this.alertService.show(
        'error',
        'Error when Fetching User'
      );
    }

  });
}





//*************************************** MANAGE NODE LIST******************************************************/
manageNodeFormField:FormField[]=[];
deleteBranchData:Boolean=false;
editBranchData:Boolean=false;
moreBranchData:Boolean=false;
nodeBranchDataUID:string='';
branchObject: Branch = {
  uid: '',
  branchName: '',
  branchCode: '',
  branchType: '',
  branchCategory: '',
  region: '',
  address: '',
  phone: '',
  status: '',
  description: ''
};






}




