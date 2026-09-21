import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input';          

@Component({
  selector: 'app-search-box',
  standalone: true, // kama ni standalone
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.css']
})
export class SearchBoxComponent {
  searchText: string = '';

  @Output() searchChange = new EventEmitter<string>();

  onInputChange() {
    this.searchChange.emit(this.searchText);
  }
}
