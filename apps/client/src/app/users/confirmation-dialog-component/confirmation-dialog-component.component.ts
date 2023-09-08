import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-confirmation-dialog-component',
  standalone: true,
  styleUrls: ['./confirmation-dialog-component.component.css'],
  templateUrl: './confirmation-dialog-component.component.html',

  imports: [FormsModule, MatButtonModule],
})
export class ConfirmationDialogComponentComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string },
  ) {}
}
