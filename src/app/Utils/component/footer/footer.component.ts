import { TranslatePipe } from '@ngx-translate/core';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [TranslatePipe, CommonModule],
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
currentYear = new Date().getFullYear();
}
