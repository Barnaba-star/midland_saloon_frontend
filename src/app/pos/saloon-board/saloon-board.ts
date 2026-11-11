import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { Title2 } from '../../Utils/component/title2/title2';
import { ShowcaseService, WeeklyBoard } from '../showcase-service';
import { photoUrl } from '../../public/public-api';

/**
 * Mashindano: the stylists' weekly board - guests served, regulars who came
 * back, and the stars guests gave. This week or last week; the winner's
 * bonus when the CEO has set one.
 */
@Component({
  selector: 'app-saloon-board',
  imports: [Title2, MatIconModule, TranslatePipe, DatePipe, DecimalPipe],
  templateUrl: './saloon-board.html',
  styleUrl: './saloon-board.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaloonBoard implements OnInit {
  private api = inject(ShowcaseService);

  weeksBack = signal(0);
  board = signal<WeeklyBoard | null>(null);
  loaded = signal(false);

  ngOnInit(): void {
    this.load();
  }

  pick(weeksBack: number): void {
    if (this.weeksBack() === weeksBack) {
      return;
    }
    this.weeksBack.set(weeksBack);
    this.load();
  }

  load(): void {
    this.loaded.set(false);
    this.api.board(this.weeksBack()).subscribe({
      next: (r) => {
        this.board.set(r.data ?? null);
        this.loaded.set(true);
      },
      error: () => this.loaded.set(true),
    });
  }

  photo(path: string | null): string {
    return photoUrl(path);
  }

  stars(n: number): number {
    return Math.round(n ?? 0);
  }
}
