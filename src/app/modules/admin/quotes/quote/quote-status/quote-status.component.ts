import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quote } from '../../models/quote';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { QuoteStatus } from '@shared/enums/quote-status';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { UserGroup } from '@shared/enums/user-group';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-quote-status',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './quote-status.component.html',
  styles: [
    `
      .border-dashed-red {
        border: 1px;
        border-style: dashed;
        border-color: red;
      }
    `,
  ],
})
export class QuoteStatusComponent implements OnInit, OnDestroy {
  private _selected: Quote;
  currentUser?: User;

  @Input()
  set quote(value: Quote) {
    this._selected = value;
  }

  get quote(): Quote {
    return this._selected;
  }

  @Input() readonly disabled: boolean = false;

  @Output() readonly onRejectQuote: EventEmitter<Event> = new EventEmitter<Event>();
  @Output() readonly onRequestQuoteApproval: EventEmitter<Event> = new EventEmitter<Event>();
  @Output() readonly onApproveQuote: EventEmitter<Event> = new EventEmitter<Event>();
  @Output() readonly onAcceptQuote: EventEmitter<Event> = new EventEmitter<Event>();

  private readonly userService = inject(UserService);
  private userSubscription: Subscription;

  constructor() {
    this.userSubscription = this.userService.user$.subscribe((user) => (this.currentUser = user));
  }

  ngOnInit(): void {}
  
  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  get hasCuttingLists(): boolean {
    return !!this.quote?.products?.length;
  }

  get hasConsumables(): boolean {
    return !!this.quote?.consumablesOnQuote?.length;
  }

  // get hasOutsourcedProducts(): boolean {
  //   return !!this.quote?.outsourcedProducts?.length;
  // }

  get hasLineItems(): boolean {
    return (
      this.hasCuttingLists || this.hasConsumables
      // || this.hasOutsourcedProducts
    );
  }

  get canRejectQuote(): boolean {
    return (
      this.quote?.status === QuoteStatus.approved ||
      // this.quote?.status === QuoteStatus.accepted ||
      this.quote?.status === QuoteStatus.pending_approval
    );
  }

  get canRequestQuoteApproval(): boolean {
    return this.quote?.status === QuoteStatus.draft;
  }

  get canApproveQuote(): boolean {
    return this.quote?.status === QuoteStatus.pending_approval;
  }

  get canAcceptQuote(): boolean {
    return this.quote?.status === QuoteStatus.approved;
  }

  rejectQuote = ($event: Event): void => {
    this.onRejectQuote.emit($event);
  };

  requestQuoteApproval = ($event: Event): void => {
    this.onRequestQuoteApproval.emit($event);
  };

  approveQuote = ($event: Event): void => {
    this.onApproveQuote.emit($event);
  };

  acceptQuote = ($event: Event): void => {
    this.onAcceptQuote.emit($event);
  };

  get user(): User {
    return this.currentUser;
  }

  get isSuperUser(): boolean {
    if (!this.user?.cognitoGroups) {
      return false;
    }
    const groupToCheck = UserGroup.superUserGroup.toLowerCase();
    return this.user.cognitoGroups.some((group) => group.toLowerCase() === groupToCheck);
  }

  get isManager(): boolean {
    if (!this.user?.cognitoGroups) {
      return false;
    }
    const groupToCheck = UserGroup.managersGroup.toLowerCase();
    return this.user.cognitoGroups.some((group) => group.toLowerCase() === groupToCheck);
  }

  get isDeveloper(): boolean {
    if (!this.user?.cognitoGroups) {
      return false;
    }
    const groupToCheck = UserGroup.opkiDevelopersGroup.toLowerCase();
    return this.user.cognitoGroups.some((group) => group.toLowerCase() === groupToCheck);
  }
}
