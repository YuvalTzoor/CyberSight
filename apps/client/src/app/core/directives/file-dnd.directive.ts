import { Directive, Output, EventEmitter, HostBinding, HostListener } from '@angular/core';

// This directive is used to handle file drag and drop events.

@Directive({
  selector: '[appFileDnd]',
  standalone: true,
})
export class FileDndDirective {
  @HostBinding('class.fileover') isFileOver?: boolean;
  @Output() fileDropped = new EventEmitter<FileList>();

  @HostListener('dragover', ['$event']) onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isFileOver = true;
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isFileOver = false;
  }

  @HostListener('drop', ['$event']) public ondrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isFileOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.fileDropped.emit(files);
    }
  }
}
