import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeSrceenComponent } from './home-srceen.component';

describe('HomeSrceenComponent', () => {
  let component: HomeSrceenComponent;
  let fixture: ComponentFixture<HomeSrceenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeSrceenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeSrceenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
