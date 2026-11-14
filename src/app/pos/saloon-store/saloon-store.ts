import { ComfirmDialogComponent } from '../../Utils/component/comfirm-dialog/comfirm-dialog';
import { StatusKeyPipe } from '../status-key.pipe';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Authentication } from '../../Utils/services/authentication';
import { POS_FULL_ACCESS_ROLES } from '../pos-role.guard';
import { TitleAction } from '../../Utils/component/title/title.component';
import { Title2 } from '../../Utils/component/title2/title2';
import { MatIcon } from '@angular/material/icon';
import { FormField } from '../../Utils/models/form-field';
import { ServiceSaloonMethod } from '../service-saloon-method';
import { error } from 'console';
import { Store, StoreDTO } from '../SaloonModel';
import { AlertService } from '../../Utils/services/alert';
import { PageableParam } from '../../Utils/models/responces';
import { DecimalPipe, UpperCasePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../Utils/component/dialog/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SearchBoxComponent } from '../../Utils/component/search-box/search-box.component';
import { EmptyStateComponent } from '../../Utils/component/empty-state/empty-state';


@Component({
  selector: 'app-saloon-bookings',
  imports: [StatusKeyPipe, SearchBoxComponent, 
    EmptyStateComponent,Title2, MatIcon, DecimalPipe, UpperCasePipe, TranslatePipe],
  templateUrl: './saloon-store.html',
  styleUrl: './saloon-store.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaloonStore implements OnInit{
  staffFields: any;
  savedData($event: Event) {
    throw new Error('Method not implemented.');
  }

  constructor(
    private visibility: Authentication,
    private saloonService: ServiceSaloonMethod,
    private alert: AlertService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private translate: TranslateService,
  ) {}
  ngOnInit(): void {
    this.selectedBooking = 'STORE.MANAGE';
    this.loadSaloonStorePage();
  }
  selectedBooking = '';
  titleActions: TitleAction[] = [
    {
      icon: 'setting',
      title: 'STORE.MANAGE',
      roles: ['ROOT', 'STAFF', 'DIRECTOR', 'CEO', 'MANAGER', 'CASHIER'],
    },
  ];

  // Store buttons: CEO (and above) and MANAGER see all three - available,
  // in use and closed. CASHIER only sees available + in use.
  get canSeeClosedStores(): boolean {
    return [...POS_FULL_ACCESS_ROLES, 'MANAGER'].some(role => this.visibility.hasRole(role));
  }

  getTitled(title: TitleAction[]): TitleAction[] {
    return this.visibility.filteredTitleActions(title);
  }

  onAction(action: string) {
    this.selectedBooking = action;
    switch (action) {
      case 'STORE.MANAGE':
        this.loadSaloonStorePage();
        this.deleteStore = false;

        break;
    }
  }

  openAddStoreDialog(): void {

    this.loadSaloonService();

    this.translate.get('STORE_PAGE.FORM_TITLE_ADD').subscribe(formTitle => {

      const dialogRef = this.dialog.open(DialogComponent, {
        width: '900px',
        maxWidth: '95vw',
        data: {
          formTitle,
          fields: this.bookingFields,
        },
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.onSaveStore(result);
        }
      });
    });
  }

  bookingFields: FormField[] = [
    {
      name: 'nameOfStore',
      type: 'text',
      label: 'STORE_PAGE.COL_ITEM',
      placeholder: 'POS_T.STORE.ENTER_ITEM_NAME',
      required: true,
    },

    {
      name: 'quantity',
      type: 'number',
      label: 'STORE_PAGE.COL_QTY',
      placeholder: 'POS_T.STORE.ENTER_QUANTITY',
      required: true,
    },

    // The price of one item, or of the whole lot - either will do; the
    // backend works the other out from the quantity.
    {
      name: 'buyingPrice',
      type: 'number',
      label: 'POS_T.STORE.UNIT_PRICE',
      placeholder: 'POS_T.STORE.UNIT_PRICE_EG',
      required: false,
    },
    {
      name: 'totalPrice',
      type: 'number',
      label: 'POS_T.STORE.LOT_PRICE',
      placeholder: 'POS_T.STORE.LOT_PRICE_EG',
      required: false,
    },

    {
      name: 'saloonService',
      type: 'select',
      label: 'POS_T.STORE.ATTACHED_SERVICE',
      placeholder: 'POS_T.STORE.ATTACH_SERVICE',
      required: true,
      options: [],
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'COMMON.DESCRIPTION',
      placeholder: 'POS_T.STORE.ENTER_DESCRIPTION',
      required: true,
    },
  ];

  loadSaloonService() {
    this.saloonService.findSaloonServiceList().subscribe({
      next: (res) => {
        if (res.data) {
          console.log('Services Found', res.data);
          const options = res.data.map((service: any) => ({
            label: service.serviceName,
            value: service.uid,
          }));
          const serviceField = this.bookingFields.find((field) => field.name === 'saloonService');
          if (serviceField) {
            serviceField.options = options;
          }
          this.cdr.markForCheck();
        }
      },

      error: (error) => {
        console.error('Error Occurred when Fetching Service', error);
      },
    });
  }
  onSaveStore(store: any) {
    const storeDTO: StoreDTO = {
      nameOfStore: store.nameOfStore,
      quantity: store.quantity,
      description: store.description,
      saloonServiceEntityUID: store.saloonService,
      buyingPrice: store.buyingPrice || undefined,
      totalPrice: store.totalPrice || undefined,
    };
    if (!storeDTO.buyingPrice && !storeDTO.totalPrice) {
      this.alert.show('error', this.translate.instant('STORE_PAGE.PRICE_NEEDED'));
      return;
    }

    this.saloonService.saveStore(storeDTO).subscribe({
      next: (res) => {
        if (res.data) {
          this.alert.show('success', 'POS_T.STORE.SAVED');

          // Refresh the Manage Store table so the new item shows up.
          this.loadSaloonStorePage();

          console.log('Response Data', res.data);
          this.cdr.markForCheck();
        }
      },

      error: (error) => {
        console.error('Error Occurred when saving store', error);
        this.alert.show('error', 'POS_T.STORE.SAVE_FAILED');
      },
    });
  }

  storeDataSource: Store[] = [];
  storeOpenDataSource: Store[] = [];

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  totalPages = 0;
  searchParam: string = '';
  /** What the search box holds - name, code or service. */
  storeQuery = '';

  /** Search the list on show: all items ('' status), or in use / closed. */
  onStoreSearch(q: string): void {
    this.storeQuery = (q || '').trim();
    this.currentPage = 0;
    if (this.search === 'OPEN' || this.search === 'CLOSED') {
      this.findOpenClosedStorePage();
    } else {
      this.loadSaloonStorePage();
    }
  }

  loadSaloonStorePage(): void {
    this.storeOpenDataSource=[];
    this.search = '';
    const params: PageableParam = {
      page: this.currentPage,
      size: this.pageSize,
      searchParam: this.storeQuery,
    };

    this.saloonService.findSaloonStorePage(params).subscribe({
      next: (res) => {
        console.log('Stores Found:', res);
        if (res.data) {
          this.storeDataSource = res.data.map((item: any) => ({
            uid: item.uid,
            nameOfStore: item.nameOfStore,
            codeOfStore: item.codeOfStore,
            description: item.description,
            quantity: item.quantity,
            nameOfService: item.serviceName,
            openedDate: item.openedDate,
            totalQuantityPrice: item.totalQuantityPrice,
            usedQuantity: item.usedQuantity,
            notUsedQuantity: item.notUsedQuantity,
            status: item.status,
            buyingPrice: item.buyingPrice,
          }));
           this.cdr.detectChanges();
          this.totalElements = res.totalElements ?? res.data?.length ?? 0;
          this.totalPages = Math.ceil(this.totalElements / this.pageSize);
          this.cdr.detectChanges();
        } else {
          this.storeDataSource = [];
          this.cdr.markForCheck();
        }
      },

      error: (error) => {
        console.error('Error Occurred when Fetching Stores:', error);
      },
    });
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadSaloonStorePage();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadSaloonStorePage();
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadSaloonStorePage();
    }
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadSaloonStorePage();
  }

  /** Hariri: the add form, filled with this item; the item keeps its code and what is used (owner 2026-11-14). */
  editStore(row: any): void {
    this.loadSaloonService();
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: {
        formTitle: this.translate.instant('POS_T.STORE.EDIT_TITLE', { name: row.nameOfStore ?? '' }),
        fields: this.bookingFields,
        formData: {
          nameOfStore: row.nameOfStore,
          quantity: row.quantity,
          buyingPrice: row.buyingPrice,
          totalPrice: row.totalQuantityPrice,
          saloonService: row.saloonServiceEntityUID,
          description: row.description,
        },
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      const unitChanged = Number(result.buyingPrice) !== Number(row.buyingPrice);
      const storeDTO: StoreDTO = {
        uid: row.uid,
        nameOfStore: result.nameOfStore,
        quantity: result.quantity,
        description: result.description,
        saloonServiceEntityUID: result.saloonService || row.saloonServiceEntityUID,
        // The unit price leads when it was changed; else the lot price, so a new quantity re-prices from the lot.
        buyingPrice: unitChanged ? (result.buyingPrice || undefined) : undefined,
        totalPrice: unitChanged ? undefined : (result.totalPrice || undefined),
      };
      if (!storeDTO.buyingPrice && !storeDTO.totalPrice) {
        storeDTO.buyingPrice = result.buyingPrice || undefined;
      }
      if (!storeDTO.buyingPrice && !storeDTO.totalPrice) {
        this.alert.show('error', this.translate.instant('STORE_PAGE.PRICE_NEEDED'));
        return;
      }
      this.saloonService.saveStore(storeDTO).subscribe({
        next: (res) => {
          if (res.data) {
            this.alert.show('success', 'POS_T.STORE.UPDATED');
            this.loadSaloonStorePage();
          }
          this.cdr.markForCheck();
        },
      });
    });
  }

  /** Futa: confirm first; the item is set aside, opened ones keep their history. */
  askDeleteStore(row: any): void {
    this.dialog
      .open(ComfirmDialogComponent, {
        width: '440px',
        maxWidth: '95vw',
        data: {
          title: this.translate.instant('POS_T.STORE.DELETE_TITLE'),
          message: this.translate.instant('POS_T.STORE.DELETE_CONFIRM', { name: row.nameOfStore ?? '' }),
          confirmLabel: this.translate.instant('COMMON.DELETE'),
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) this.onConfirmDeleteStore(row);
      });
  }

  deleteStore: boolean = false;
  storeRecord: Store = {};
  onDeleteStore(event: Store): void {
    this.storeRecord = event;
    this.deleteStore = true;
    console.log('Store Delete:', this.storeRecord);
  }
  onConfirmDeleteStore(event: Store): void {
    console.log('Store Delete:', this.storeRecord);
    if (!event.uid) {
      return;
    }
    this.saloonService.deleteStore(event.uid).subscribe({
      next: (res) => {
        if (res.data) {
          const index = this.storeDataSource.findIndex((item) => item.uid === res.data.uid);
          if (index !== -1) {
            this.storeDataSource.splice(index, 1);
            this.storeDataSource = [...this.storeDataSource];
            this.cdr.detectChanges();
            this.alert.show('success', 'POS_T.STORE.DELETED');
          }
          this.deleteStore = false;
          this.storeRecord = {};
          this.loadSaloonStorePage();
          this.cdr.markForCheck();
        }
      },

      error: (error) => {
        console.error('Error deleting store:', error);

        this.alert.show('error', 'POS_T.STORE.DELETE_FAILED');
      },
    });
  }

  addQuantityFields: FormField[] = [
    {
      name: 'quantity',
      type: 'number',
      label: 'POS_T.STORE.ADDED_QTY',
      placeholder: 'POS_T.STORE.ADDED_QTY_EG',
      required: true,
    },
    // This delivery's cost, per item or for the lot; left empty, the item's
    // current price per item is used.
    {
      name: 'buyingPrice',
      type: 'number',
      label: 'POS_T.STORE.UNIT_PRICE',
      placeholder: 'POS_T.STORE.KEEP_PRICE',
      required: false,
    },
    {
      name: 'totalPrice',
      type: 'number',
      label: 'POS_T.STORE.LOT_PRICE',
      placeholder: 'POS_T.STORE.LOT_PRICE_EG',
      required: false,
    },
  ];
 addQuantityToStore(store: any) {
  const dialogRef = this.dialog.open(DialogComponent, {
    width: '700px',
    panelClass: 'custom-dialog',
    position: {
      top: '350px',
    },
    data: {
      formTitle: this.translate.instant('POS_T.STORE.ADD_QTY_TITLE', { qty: store.quantity }),
      fields: this.addQuantityFields,
    },
  });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const storeDTO: StoreDTO = {
          uid: store.uid,
          quantity: result.quantity,
          buyingPrice: result.buyingPrice || undefined,
          totalPrice: result.totalPrice || undefined,
        };
        this.saloonService.addQuantityToStore(storeDTO).subscribe({
          next: (res) => {
            if (res.data) {
              this.alert.show('success', 'POS_T.STORE.QTY_ADDED');
              console.log('Store to add quantity', res.data);
              const index = this.storeDataSource.findIndex((item) => item.uid === res.data.uid);
              if (index !== -1) {
                this.storeDataSource[index].nameOfService =
                  res.data.saloonServiceEntity.serviceName;
                this.storeDataSource[index].nameOfStore = res.data.nameOfStore;
                this.storeDataSource[index].codeOfStore = res.data.codeOfStore;
                this.storeDataSource[index].description = res.data.description;
                this.storeDataSource[index].buyingPrice = res.data.buyingPrice;
                this.storeDataSource[index].status = res.data.status;
                this.storeDataSource[index].quantity = res.data.quantity;
                this.storeDataSource[index].totalQuantityPrice = res.data.totalQuantityPrice;
                this.storeDataSource[index].usedQuantity = res.data.usedQuantity;
                this.storeDataSource[index].notUsedQuantity = res.data.notUsedQuantity;
                this.cdr.detectChanges();
              }
            }
          },
          error: (error) => {
            console.error('Error Occurred when adding quantity to store', error);
            this.alert.show('error', 'POS_T.STORE.QTY_ADD_FAILED');
          },
        });
      }
    });
  }

   openStoreFields: FormField[] = [
    {
      name: 'quantity',
      type: 'number',
      placeholder: 'POS_T.STORE.ENTER_QUANTITY',
      readonly: true,
      required: false,
    },
  ];

  openStore(store: any) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '700px',
      panelClass: 'custom-dialog',
      position: {
        top: '350px',
      },
  data: {
  formTitle: this.translate.instant('POS_T.STORE.OPEN_TITLE', { qty: store.notUsedQuantity }),
  message: this.translate.instant('POS_T.STORE.OPEN_MESSAGE'),
  fields: this.openStoreFields,
  formData: {
    ...store,
    quantity: 1
  },
},

    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const storeDTO: StoreDTO = {
          uid: store.uid,
        };
        this.saloonService.openStore(storeDTO).subscribe({
          next: (res) => {
            if (res.data) {
              this.alert.show('success', 'POS_T.STORE.OPENED');
              const index = this.storeDataSource.findIndex((item) => item.uid === res.data.uid);
              if (index !== -1) {
                this.storeDataSource[index].nameOfStore = res.data.nameOfStore;
                this.storeDataSource[index].codeOfStore = res.data.codeOfStore;
                this.storeDataSource[index].description = res.data.description;
                this.storeDataSource[index].buyingPrice = res.data.buyingPrice;
                this.storeDataSource[index].status = res.data.status;
                this.storeDataSource[index].quantity = res.data.quantity;
                this.storeDataSource[index].totalQuantityPrice = res.data.totalQuantityPrice;
                this.storeDataSource[index].usedQuantity = res.data.usedQuantity;
                this.storeDataSource[index].notUsedQuantity = res.data.notUsedQuantity;
                this.cdr.detectChanges();
                console.log('Store opened successfully:', this.storeDataSource[index]);
              }
            }
          },
          error: (error) => {
            console.error('Error Occurred when opening store', error);
            this.alert.show('error', 'POS_T.STORE.OPEN_FAILED');
          },
        });
      }
    });
  }


  /******************************************************************************************.  STORES THAT IS OPEN.  *************************************************************************** */
  search:string=''
  findOpenClosedStorePage(): void {
    this.storeDataSource = [];
    const params: PageableParam = {
      page: this.currentPage,
      size: this.pageSize,
      searchParam: this.search,
      filter: this.storeQuery,
    };

    this.saloonService.findOpenStorePage(params).subscribe({
      next: (res) => {
        if (res.data) {
          this.storeOpenDataSource = res.data.map((item: any) => ({
            uid: item.uid,
            nameOfStore: item.nameOfStore,
            codeOfStore: item.openStoreCode,
            description: item.description,
            quantity: item.quantity,
            nameOfService: item.serviceName,
            openedDate: item.openedDate,
            closedDate:item.closedDate,
            totalQuantityPrice: item.totalQuantityPrice,
            usedQuantity: item.usedQuantity,
            notUsedQuantity: item.notUsedQuantity,
            status: item.status,
            buyingPrice: item.buyingPrice,
            openQuantity: item.openQuantity,
          }));

          this.totalElements = res.totalElements ?? res.data?.length ?? 0;
          this.totalPages = Math.ceil(this.totalElements / this.pageSize);
          this.cdr.detectChanges();
              console.log('Open Stores Found:', res.data);
        } else {
          this.storeDataSource = [];
          this.cdr.markForCheck();
        }
      },

      error: (error) => {
        console.error('Error Occurred when Fetching Stores:', error);
      },
    });
  }
  nextPageOpenStore(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.findOpenClosedStorePage();
    }
  }

  previousPageOpenStore(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.findOpenClosedStorePage();
    }
  }

  goToPageOpenStore(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.findOpenClosedStorePage();
    }
  }

  changePageSizeOpenStore(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.findOpenClosedStorePage();
  }

  closeOpenStore(event:any){
    const storeDTO:StoreDTO={
      openStoreUID: event.uid,
    }
    this.saloonService.closeOpenStore(storeDTO).subscribe({
      next:(res)=>{
        if(res.data){

          const index = this.storeOpenDataSource.findIndex(idx=> idx.uid === res.data.uid)
          if(index !==-1){
            this.storeOpenDataSource[index].uid = res.data.uid,
            this.storeOpenDataSource[index].closedDate=res.data.updatedAt,
            this.storeOpenDataSource[index].status=res.data.status,
            this.storeOpenDataSource[index].codeOfStore=res.data.openStoreCode,
            this.storeOpenDataSource[index].nameOfService =res.data.store.saloonServiceEntity.serviceName;

            this.cdr.detectChanges();
            console.log('Closed Data', res.data);
          }
        }
      },
      error(err) {
          console.error('Error Occurred', err)
      },
    })
  }

findClosedStorePage(){
  this.search='CLOSED'
  this.storeOpenDataSource=[]
  this.findOpenClosedStorePage();
}
findOpenStorePage(){
   this.search='OPEN'
  this.storeOpenDataSource=[]
  this.findOpenClosedStorePage();
}

}
