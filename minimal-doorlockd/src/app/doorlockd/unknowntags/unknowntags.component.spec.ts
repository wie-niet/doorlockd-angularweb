import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnknowntagsComponent } from './unknowntags.component';

describe('UnknowntagsComponent', () => {
  let component: UnknowntagsComponent;
  let fixture: ComponentFixture<UnknowntagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnknowntagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnknowntagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
