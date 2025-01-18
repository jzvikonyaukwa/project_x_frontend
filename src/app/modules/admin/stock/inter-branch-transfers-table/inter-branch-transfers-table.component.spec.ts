import { ComponentFixture, TestBed } from "@angular/core/testing";

import { InterBranchTransfersTableComponent } from "./inter-branch-transfers-table.component";

describe("InterBranchTransfersTableComponent", () => {
  let component: InterBranchTransfersTableComponent;
  let fixture: ComponentFixture<InterBranchTransfersTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InterBranchTransfersTableComponent],
    });
    fixture = TestBed.createComponent(InterBranchTransfersTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
