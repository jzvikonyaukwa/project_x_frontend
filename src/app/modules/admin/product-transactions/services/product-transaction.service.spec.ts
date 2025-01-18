import { TestBed } from '@angular/core/testing';

import { ProductTransactionService } from './product-transaction.service';

describe('ProductTransactionService', () => {
  let service: ProductTransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductTransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
