import { Component, Input } from '@angular/core';
import { MatIcon } from "@angular/material/icon";

@Component({
    selector: 'app-no-data-found',
    imports: [MatIcon],
    templateUrl: './no-data-found.html',
    styleUrl: './no-data-found.css'
})
export class NoDataFound {
     @Input() message: string = 'No Data Found';
}
