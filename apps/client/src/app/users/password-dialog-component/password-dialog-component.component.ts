import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-password-dialog-component',
  standalone: true,
  styleUrls: ['./password-dialog-component.component.css'],
  templateUrl: './password-dialog-component.component.html',
  imports: [FormsModule, MatButtonModule],
})
export class PasswordDialogComponentComponent {
  password?: string;
  hidePassword = true;
  constructor(
    public dialogRef: MatDialogRef<PasswordDialogComponentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: unknown,
  ) {}
}
