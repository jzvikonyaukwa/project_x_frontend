import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FuseAlertType } from '@fuse/components/alert';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new BehaviorSubject<{ type: FuseAlertType; message: string }>({ type: "success", message: "" });
  alert$ = this.alertSubject.asObservable();

  setAlert(alert: { type: FuseAlertType; message: string }) {
    this.alertSubject.next(alert);
  }
}
