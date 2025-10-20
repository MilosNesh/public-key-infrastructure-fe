import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndEntityListComponent } from './end-entity-list.component';

describe('EndEntityListComponent', () => {
  let component: EndEntityListComponent;
  let fixture: ComponentFixture<EndEntityListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndEntityListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndEntityListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
