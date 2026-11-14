import { TranslatePipe } from '@ngx-translate/core';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatIcon } from "@angular/material/icon";

@Component({
    selector: 'app-no-data-found',
    imports: [TranslatePipe, MatIcon],
    templateUrl: './no-data-found.html',
    styleUrl: './no-data-found.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoDataFound {
     @Input() message: string = 'UTIL_T.NO_DATA_FOUND';
}
