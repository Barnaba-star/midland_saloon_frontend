import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TitleAction, TitleComponent } from "../../Utils/component/title/title.component";
import { MatIconModule } from "@angular/material/icon";
import { Authentication } from '../../Utils/services/authentication';
import { Title2 } from "../../Utils/component/title2/title2";
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-configuration',
  imports: [ MatIconModule, Title2, TranslatePipe],
  templateUrl: './configuration.html',
  styleUrl: './configuration.css',
})
export class Configuration {

constructor(private dialog:MatDialog, private visibility:Authentication) {}
selectedConfiguration = '';
titleActions = [
  { icon: 'email', title: 'CONFIGURATION_PAGE.EMAIL' , roles: ['ROOT', 'REG OFFICER']},
  { icon: 'sms', title: 'CONFIGURATION_PAGE.SMS' , roles: ['ROOT', 'REG OFFICER']},
  { icon: 'notifications', title: 'CONFIGURATION_PAGE.NOTIFICATION' , roles: ['ROOT', 'REG OFFICER']},
  { icon: 'log', title: 'CONFIGURATION_PAGE.AUDIT_LOGS' , roles: ['ROOT', 'REG OFFICER']},
];

onAction(action: string) {
    console.log('Selected action:', action);
    this.selectedConfiguration = action;
  }

getTitled(title:TitleAction[]):TitleAction[]{
return this.visibility.filteredTitleActions(title);
}
}
