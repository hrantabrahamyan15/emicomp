import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  title: string;
  text: string;
}

@Component({
  selector: 'alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss'],
})
export class AlertDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}
