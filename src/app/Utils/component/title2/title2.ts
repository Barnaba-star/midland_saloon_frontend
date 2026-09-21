import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Authentication } from '../../services/authentication';
import { PreviousRouteService } from '../../services/previous-route-service';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TranslatePipe } from '@ngx-translate/core';


export interface TitleAction {
  icon: string;
  title: string;
  disabled?: boolean;
  roles?: string[];
  badge?: number | string;
}

export interface Breadcrumb {
  label: string;
  route?: string;
}


@Component({
  selector: 'app-title2',
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatTooltipModule,
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './title2.html',
  styleUrl: './title2.css',
})
export class Title2 implements AfterViewInit, OnChanges {


  @Input() titleHeader: string = '';

  @Input() breadcrumbs: Breadcrumb[] = [];

  @Input() actions: TitleAction[] = [];

  /** Lets the parent page keep the highlighted tab in sync with its
   *  own selected view (e.g. on first load, before any click). */
  @Input() activeAction: string | null = null;

  @Output() customButtonClick = new EventEmitter<string>();


  @ViewChild('actionsList') actionsListRef?: ElementRef<HTMLDivElement>;

  hasOverflowStart = false;
  hasOverflowEnd = false;


  constructor(
    private router: Router,
    private location: Location,
    private priv: PreviousRouteService,
    private auth: Authentication,
  ) { }


  ngAfterViewInit(): void {
    this.updateOverflow();
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['actions'] && this.actionsListRef) {
      // Wait a tick so the *for-loop has rendered the new tabs
      // before we measure the scroll width.
      queueMicrotask(() => this.updateOverflow());
    }

  }


  onBack(): void {

    const prev = this.priv.getPreviousUrl();

    if (prev.includes('/login')) {

      this.auth.removeToken();

    } else {

      this.location.back();

    }

  }


  onActionClick(action: TitleAction): void {

    if (action.disabled) {

      return;

    }

    this.customButtonClick.emit(action.title);

    this.activeAction = action.title;

  }


  onActionKeydown(event: KeyboardEvent, action: TitleAction): void {

    if (event.key === 'Enter') {

      this.onActionClick(action);

    } else if (event.key === ' ' || event.key === 'Spacebar') {

      // Space normally scrolls the page — stop that since it's
      // activating a tab instead.
      event.preventDefault();

      this.onActionClick(action);

    }

  }


  // ============================================================
  // OVERFLOW FADE (shows there are more tabs to scroll to)
  // ============================================================

  onActionsScroll(): void {
    this.updateOverflow();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateOverflow();
  }

  private updateOverflow(): void {

    const el = this.actionsListRef?.nativeElement;

    if (!el) {
      this.hasOverflowStart = false;
      this.hasOverflowEnd = false;
      return;
    }

    const maxScroll = el.scrollWidth - el.clientWidth;

    this.hasOverflowStart = el.scrollLeft > 4;
    this.hasOverflowEnd = maxScroll > 4 && el.scrollLeft < maxScroll - 4;
  }

}
