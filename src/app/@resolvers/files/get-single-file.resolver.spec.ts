import { TestBed } from '@angular/core/testing';

import { GetSingleFileResolver } from './get-single-file.resolver';

describe('GetSingleFileResolver', () => {
  let resolver: GetSingleFileResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(GetSingleFileResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
