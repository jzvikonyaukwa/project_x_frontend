import { Injectable, signal } from '@angular/core';
import { DisplayAlert } from '../models/displayAlert';
import { FuseAlertType } from '@fuse/components/alert';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private alertSignal = signal<DisplayAlert | null>(null);

  get alert$() {
    return this.alertSignal;
  }

  displayAlert(type: FuseAlertType, message: string): void {
    const alert: DisplayAlert = { type, message };
    this.alertSignal.set(alert);
  }

  clearAlert(): void {
    this.alertSignal.set(null);
  }
}
