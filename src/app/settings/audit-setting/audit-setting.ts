import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { Title2 } from '../../Utils/component/title2/title2';
import { TitleAction } from '../../Utils/component/title/title.component';
import { Authentication } from '../../Utils/services/authentication';
import { SearchBoxComponent } from '../../Utils/component/search-box/search-box.component';
import { AuditDetailDialogComponent } from '../../Utils/component/dialogs/audit-detail-dialog-component/audit-detail-dialog-component';
import { AuditLog, AuditService } from './audit-service';

@Component({
  selector: 'app-audit-setting',
  imports: [Title2, CommonModule, TranslatePipe, SearchBoxComponent],
  templateUrl: './audit-setting.html',
  styleUrl: './audit-setting.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditSetting implements OnInit {

  constructor(
    private visibility: Authentication,
    private auditService: AuditService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.audits = 'AUDIT_SETTING_PAGE.MANAGE_TAB';
    this.loadAudits();
    this.loadSummary();
  }

  titleAction: string = 'AUDIT_SETTING_PAGE.TITLE';
  audits: string = '';

  titleActions = [
    { icon: 'history', title: 'AUDIT_SETTING_PAGE.MANAGE_TAB', roles: ['ROOT', 'DIRECTOR'] }
  ];

  getTitled(title: TitleAction[]): TitleAction[] {
    return this.visibility.filteredTitleActions(title);
  }

  onAction(action: string) {
    this.audits = action;
  }

  auditLogs: AuditLog[] = [];
  isLoading = false;
  lastDayCount = 0;
  lastWeekCount = 0;
  activeUsersCount = 0;

  /** '' means "everything". */
  outcomeFilter = '';
  searchParam = '';

  currentPage = 0;
  pageSize = 20;
  totalPages = 0;
  totalElements = 0;
  pageNumbers: number[] = [];

  loadAudits() {
    this.isLoading = true;
    this.auditService
      .findAuditPage(
        { page: this.currentPage, size: this.pageSize, searchParam: this.searchParam },
        // Searching goes through searchParam; the username param stays free for
        // a future "show me only this person" link.
        undefined,
        this.outcomeFilter
      )
      .subscribe({
        next: (response) => {
          this.auditLogs = response.data || [];
          this.totalElements = response.totalElements || 0;
          this.totalPages = response.totalPages || 0;
          this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.auditLogs = [];
          this.totalElements = 0;
          this.totalPages = 0;
          this.pageNumbers = [];
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  loadSummary() {
    this.auditService.findAuditSummary().subscribe({
      next: (response) => {
        this.lastDayCount = response.data?.lastDay ?? 0;
        this.lastWeekCount = response.data?.lastWeek ?? 0;
        this.activeUsersCount = response.data?.activeUsers ?? 0;
        this.cdr.markForCheck();
      },
      error: () => {
        this.lastDayCount = 0;
        this.lastWeekCount = 0;
        this.activeUsersCount = 0;
        this.cdr.markForCheck();
      }
    });
  }

  /** A new term is a new result set, so it always starts from the first page. */
  onSearchChange(term: string) {
    this.searchParam = term;
    this.currentPage = 0;
    this.loadAudits();
  }

  onFilterChange(outcome: string) {
    this.outcomeFilter = outcome;
    this.currentPage = 0;
    this.loadAudits();
  }

  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.loadAudits();
  }

  refresh() {
    this.currentPage = 0;
    this.loadAudits();
    this.loadSummary();
  }

  openDetail(auditLog: AuditLog) {
    this.dialog.open(AuditDetailDialogComponent, {
      width: '760px',
      maxHeight: '85vh',
      data: auditLog
    });
  }

  /** The full name is what a reader recognises; the username is the fallback. */
  displayUser(auditLog: AuditLog): string {
    return auditLog.fullName || auditLog.username || '-';
  }
}
