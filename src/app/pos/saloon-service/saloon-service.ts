import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TitleAction, Title2 } from "../../Utils/component/title2/title2";
import { Authentication } from '../../Utils/services/authentication';
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from '@angular/material/tooltip';
import { ServiceSaloonMethod } from '../service-saloon-method';
import { PageableParam } from '../../Utils/models/responces';
import { TranslatePipe } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { ServiceDetailsDialogComponent } from '../../Utils/component/dialogs/service-details-dialog-component/service-details-dialog-component';
import { DecimalPipe } from '@angular/common';


@Component({
  selector: 'app-saloon-service',
  imports: [Title2, MatIconModule, TranslatePipe, MatTooltipModule, DecimalPipe],
  templateUrl: './saloon-service.html',
  styleUrl: './saloon-service.css',
})
export class SaloonService implements OnInit{
  constructor(
    private visibility: Authentication, private saloonService: ServiceSaloonMethod, private cdr:ChangeDetectorRef, private dialog: MatDialog
  ) { }
 ngOnInit(): void {
  console.log('SaloonService INIT');
  this.selectedService = 'SERVICE.MANAGE'
  this.findSaloonServicePage();
}



  selectedService = '';


  titleActions: TitleAction[] = [

    {
      icon: 'more',
      title: 'SERVICE.MANAGE',
      roles: ['ROOT']
    },


  ];

  getTitled(title: TitleAction[]): TitleAction[] {
    return this.visibility.filteredTitleActions(title);
  }
onAction(action: string) {
  this.selectedService = action;

  if (this.selectedService === 'SERVICE.MANAGE') {
    this.findSaloonServicePage();
   
  }
}


page = 0;
size = 5;

saloonServiceDataSource: any[] = [];
totalElements = 0;
totalPages = 0;

findSaloonServicePage() {
  console.log('findSaloonServicePage CALLED');

  const params: PageableParam = {
    page: this.page,
    size: this.size
  };

  this.saloonService.findSaloonServicePage(params).subscribe({
    next: (res) => {

      console.log('API RESPONSE:', res);
      console.log('API DATA:', res.data);

      this.saloonServiceDataSource = res.data ?? [];

      console.log(
        'DATA SOURCE LENGTH:',
        this.saloonServiceDataSource.length
      );

      this.totalElements = res.totalElements ?? 0;
      this.totalPages = res.totalPages ?? 0;
      this.page = res.currentPage ?? 0;
      this.size = res.size ?? 10;

      this.cdr.detectChanges();
    },

    error: (err) => {
      console.error('Error fetching saloon services:', err);
    }
  });
}



changePage(page: number) {
  if (page < 0 || page >= this.totalPages) {
    return;
  }

  this.page = page;
  this.findSaloonServicePage();
}

changePageSize(event: Event) {
  const value = (event.target as HTMLSelectElement).value;

  this.size = Number(value);
  this.page = 0;

  this.findSaloonServicePage();
}

onMoreService(service: any): void {

  this.dialog.open(ServiceDetailsDialogComponent, {
    width: '480px',
    maxWidth: '95vw',
    data: service,
  });
}

}
