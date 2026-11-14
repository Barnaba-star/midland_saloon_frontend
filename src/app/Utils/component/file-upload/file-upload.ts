import { TranslatePipe } from '@ngx-translate/core';
import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-file-upload',
    templateUrl: './file-upload.html',
    styleUrls: ['./file-upload.css'],
    imports: [TranslatePipe, MatIcon, MatTooltipModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadComponent {

  @Input() accept: string = '.pdf,.doc,.docx'; // allowed file types, default
  @Input() icon: string = 'attachment'; // default icon
  @Input() tooltip: string = 'UTIL_T.ADD_ATTACHMENT'; // default tooltip

  @Output() fileSelected = new EventEmitter<File>();

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileSelected.emit(input.files[0]);
    }
  }
}
