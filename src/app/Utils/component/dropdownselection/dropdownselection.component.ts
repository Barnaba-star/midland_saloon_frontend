import { TranslatePipe } from '@ngx-translate/core';
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dropdownselection',
  imports: [TranslatePipe, CommonModule, FormsModule],
  templateUrl: './dropdownselection.component.html',
  styleUrl: './dropdownselection.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownselectionComponent {
 @Input() label: string = 'COMMON.SELECT_OPTION';
  @Input() options: { label: string, value: any }[] = [];
  @Input() selectedValue: any;
  @Output() selectionChange = new EventEmitter<any>();

  onSelectChange(value: any) {
    this.selectionChange.emit(value);
  }

}
