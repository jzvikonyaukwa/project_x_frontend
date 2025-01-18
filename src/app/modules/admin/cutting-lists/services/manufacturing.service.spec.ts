import { TestBed } from "@angular/core/testing";

import { ManufacturingService } from "./manufacturing.service";

describe("ManufactureService", () => {
  let service: ManufacturingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManufacturingService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
