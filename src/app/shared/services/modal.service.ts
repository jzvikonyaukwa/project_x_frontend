import {Injectable} from "@angular/core";
import {MatDialog, MatDialogConfig, MatDialogRef,MAT_DIALOG_DATA} from "@angular/material/dialog";
import {ComponentType} from "@angular/cdk/overlay";

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private _dialogRef: MatDialogRef<any>;

  constructor(private _dialog: MatDialog) {}

  open<T, D = any>(dialogComponent: ComponentType<T>, config?: MatDialogConfig<D>): MatDialogRef<any> {
    this._dialogRef = this._dialog.open(dialogComponent, config);

    return this._dialogRef;
  }

  close(): void {
    this._dialogRef && this._dialogRef.close(null);
  }
}
