import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-private-key-modal',
  templateUrl: 'private-key-modal.component.html',
  styleUrls: ['private-key-modal.component.scss'],
})
export class PrivateKeyModalComponent {

  constructor(public activeModal: NgbActiveModal) {}

  cancel() {
    this.activeModal.close();
  }

  submit(key: string) {
    if (key) this.activeModal.close(key);
  }
}
