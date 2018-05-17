import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitLayoutSurveyComponent } from './submit-layout-survey.component';

describe('SubmitLayoutSurveyComponent', () => {
  let component: SubmitLayoutSurveyComponent;
  let fixture: ComponentFixture<SubmitLayoutSurveyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmitLayoutSurveyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitLayoutSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
