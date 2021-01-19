import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugViewerComponent } from './debug-viewer.component';

describe('DebugViewerComponent', () => {
  let component: DebugViewerComponent;
  let fixture: ComponentFixture<DebugViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DebugViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DebugViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
