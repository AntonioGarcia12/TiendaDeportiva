import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { of } from 'rxjs';

import { AppComponent } from './app.component';
import { LocaleService } from '@core/locale/locale.service';
import { ConfirmDialogService } from '@common/confirm-dialog/confirm-dialog.service';
import { GlobalMessageService } from '@common/global-message/global-message.service';
import { ProgressSpinnerService } from '@common/progress-spinner/progress-spinner.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let localeServiceSpy: jasmine.SpyObj<LocaleService>;
  let confirmDialogServiceSpy: jasmine.SpyObj<ConfirmDialogService>;
  let globalMessageServiceSpy: jasmine.SpyObj<GlobalMessageService>;
  let progressSpinnerServiceSpy: jasmine.SpyObj<ProgressSpinnerService>;

  beforeEach(async () => {
    const localeServiceSpyObj = jasmine.createSpyObj('LocaleService', ['setupAppLanguage']);
    const confirmDialogServiceSpyObj = jasmine.createSpyObj('ConfirmDialogService', ['open']);
    const globalMessageServiceSpyObj = jasmine.createSpyObj('GlobalMessageService', ['showSuccess', 'showError']);
    const progressSpinnerServiceSpyObj = jasmine.createSpyObj('ProgressSpinnerService', ['show', 'hide']);

    await TestBed.configureTestingModule({
      imports: [AppComponent, TranslateModule.forRoot(), MatButtonModule],
      providers: [
        { provide: LocaleService, useValue: localeServiceSpyObj },
        { provide: ConfirmDialogService, useValue: confirmDialogServiceSpyObj },
        { provide: GlobalMessageService, useValue: globalMessageServiceSpyObj },
        { provide: ProgressSpinnerService, useValue: progressSpinnerServiceSpyObj }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    localeServiceSpy = TestBed.inject(LocaleService) as jasmine.SpyObj<LocaleService>;
    confirmDialogServiceSpy = TestBed.inject(ConfirmDialogService) as jasmine.SpyObj<ConfirmDialogService>;
    globalMessageServiceSpy = TestBed.inject(GlobalMessageService) as jasmine.SpyObj<GlobalMessageService>;
    progressSpinnerServiceSpy = TestBed.inject(ProgressSpinnerService) as jasmine.SpyObj<ProgressSpinnerService>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call setupAppLanguage on LocaleService when initialized', () => {
    expect(localeServiceSpy.setupAppLanguage).toHaveBeenCalled();
  });

  it('should test common services', () => {
    const dialogResult = true;
    const spinner = 'spinner';
    confirmDialogServiceSpy.open.and.returnValue(of(dialogResult));
    progressSpinnerServiceSpy.show.and.returnValue(spinner);

    component.testCommonServices();

    expect(confirmDialogServiceSpy.open).toHaveBeenCalled();
    expect(progressSpinnerServiceSpy.show).toHaveBeenCalled();

    setTimeout(() => {
      expect(progressSpinnerServiceSpy.hide).toHaveBeenCalledWith(spinner);
      if (dialogResult) {
        expect(globalMessageServiceSpy.showSuccess).toHaveBeenCalledWith({ message: 'Has pulsado aceptar', actionText: 'Ok' });
      } else {
        expect(globalMessageServiceSpy.showError).toHaveBeenCalledWith({ message: 'Has pulsado cancelar', actionText: 'Close' });
      }
    }, 3000);
  });
});
