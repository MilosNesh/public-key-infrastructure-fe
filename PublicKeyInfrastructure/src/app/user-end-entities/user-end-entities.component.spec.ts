import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEndEntitiesComponent } from './user-end-entities.component';

describe('UserEndEntitiesComponent', () => {
  let component: UserEndEntitiesComponent;
  let fixture: ComponentFixture<UserEndEntitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserEndEntitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserEndEntitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
