import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-data-wrapper',
  templateUrl: './data-wrapper.component.html',
  imports: [TranslatePipe, CommonModule],
  styleUrls: ['./data-wrapper.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataWrapperComponent {
  @Input() title: string = '';
  @Input() hasData: boolean = false;
}
