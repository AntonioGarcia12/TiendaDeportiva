import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  yesActionText?: string;
  noActionText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent implements OnInit {
  public title: string = '';
  public message: string = '';
  public yesActionText: string = '';
  public noActionText: string = '';

  constructor(
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public config: ConfirmDialogConfig,
    public dialogRef: MatDialogRef<ConfirmDialogComponent>
  ) {}

  async ngOnInit() {
    this.title = this.config.title;
    this.message = this.config.message;

    this.yesActionText = this.translateService.instant(
      this.config.yesActionText ? this.config.yesActionText : marker('confirmdialog.yes')
    );

    this.noActionText = this.translateService.instant(
      this.config.noActionText ? this.config.noActionText : marker('confirmdialog.no')
    );
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }
}
