import { TestBed } from '@angular/core/testing';

import { DoorlockdApiClientService } from './doorlockd-api-client.service';

describe('DoorlockdApiClientService', () => {
  let service: DoorlockdApiClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DoorlockdApiClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
