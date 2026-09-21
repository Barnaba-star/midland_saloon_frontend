import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-data-wrapper',
  templateUrl: './data-wrapper.component.html',
  imports: [CommonModule],
  styleUrls: ['./data-wrapper.component.css'],
  standalone: true
})
export class DataWrapperComponent {
  @Input() title: string = '';
  @Input() hasData: boolean = false;
}
