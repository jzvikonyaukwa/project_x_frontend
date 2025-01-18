import { Component, Inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Observable, map } from "rxjs";
import { UserDTO } from "../../clients/user-form/models/userDTO";
import { ClientsService } from "../../clients/services/clients.service";
import { MatButtonModule } from "@angular/material/button";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { Router } from "@angular/router";
import { FuseCardComponent } from "@fuse/components/card";
import { PageHeadingComponent } from "@layout/common/page-heading/page-heading.component";
import { ProjectService } from "../services/project.service";
import { ProjectPOSTDTO } from "../models/projectPOSTDTO";
import { Project } from "../models/project";

@Component({
  selector: "app-add-project",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatSelectModule,
    MatIconModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    FuseCardComponent,
    PageHeadingComponent,
  ],
  templateUrl: "./add-project.component.html",
  styleUrls: ["./add-project.component.scss"],
})
export class AddProjectComponent {
  public projectForm: FormGroup = this.fb.group({
    clientId: [null, [Validators.required]],
    name: [null, [Validators.required]],
  });

  public serverErrorMessage: string | null = null;


  constructor(
    private fb: FormBuilder,
    private _dialogRef: MatDialogRef<AddProjectComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { clientSelected: UserDTO; clients: UserDTO[] },
    private router: Router,
    private projectService: ProjectService
  ) {
    if (this.data.clientSelected) {
      this.projectForm.get("clientId").patchValue(this.data.clientSelected.id);
    }
  }

  public onSubmit(): void {
    const projectDTO: ProjectPOSTDTO = this.projectForm.value;
    this.addProject(projectDTO);
  }

  private addProject(projectDTO: ProjectPOSTDTO): void {
    this.projectService.addProject(projectDTO).subscribe({
      next: (project: Project) => {
        this._dialogRef.close(project);
      },
      error: (errorResponse: any) => {
        if (
            errorResponse.status === 400 &&
            errorResponse.error &&
            errorResponse.error.error
        ) {
          const errorMessage = errorResponse.error.error;
          this.serverErrorMessage = errorMessage;
        } else {
          console.error("An unexpected error occurred:", errorResponse);
          this.serverErrorMessage = "An unexpected error occurred. Please try again.";
        }
      },
    });
  }

  onDialogClose(): void {
    this._dialogRef.close();
  }

  public cancel() {
    this.projectForm.reset();
    this.router.navigate(["/quotes/"]);
  }
}
