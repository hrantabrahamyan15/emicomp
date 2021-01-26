import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhyNeedComponent } from './why-need.component';

describe('WhyNeedComponent', () => {
  let component: WhyNeedComponent;
  let fixture: ComponentFixture<WhyNeedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhyNeedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhyNeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
