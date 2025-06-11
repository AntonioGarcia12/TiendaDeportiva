import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocaleService } from '@core/locale/locale.service';
import { ConfirmDialogService } from '@common/confirm-dialog/confirm-dialog.service';
import { GlobalMessageService } from '@common/global-message/global-message.service';
import { ProgressSpinnerService } from '@common/progress-spinner/progress-spinner.service';
import { ThemeService } from './core/theme/theme.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslateModule, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private locale: LocaleService = inject(LocaleService);
  //TEST: progress-spinner, confirm-dialog and global-message
  private confirmDialogService: ConfirmDialogService = inject(ConfirmDialogService);
  private globalMessageService: GlobalMessageService = inject(GlobalMessageService);
  private progressSpinnerService: ProgressSpinnerService = inject(ProgressSpinnerService);
  private translate = inject(TranslateService);
  //TEST: theme-service
  protected themeService: ThemeService = inject(ThemeService);

  constructor() {
    this.locale.setupAppLanguage();
  }

  cambiarIdioma(lang: 'es' | 'en') {
    this.locale.setupAppLanguage(lang);
    this.translate.addLangs(['es', 'en']);
    this.translate.setDefaultLang('es');
    this.translate.use('es');
  }
  /**
   * TODO: DELETE THIS METHOD
   * Test common services
   */
  testCommonServices() {
    //TEST: progress-spinner, confirm-dialog and global-message
    this.confirmDialogService
      .open({
        title: 'Prueba de confirmación',
        message: 'Pulsa aceptar o cancelar'
      })
      .subscribe((result: boolean) => {
        const spinner = this.progressSpinnerService.show();
        setTimeout(() => {
          this.progressSpinnerService.hide(spinner);
          if (result) {
            this.globalMessageService.showSuccess({ message: 'Has pulsado aceptar', actionText: 'Ok' });
          } else {
            this.globalMessageService.showError({ message: 'Has pulsado cancelar', actionText: 'Close' });
          }
        }, 3000);
      });
  }
}
