import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsrAllComponent } from './csr-all.component';

describe('CsrAllComponent', () => {
  let component: CsrAllComponent;
  let fixture: ComponentFixture<CsrAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CsrAllComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CsrAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
