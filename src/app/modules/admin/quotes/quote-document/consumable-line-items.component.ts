import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quote } from '../models/quote';
import { ConsumableOnQuote } from '../../consumables/models/consumableOnQuote';

@Component({
  selector: 'app-quote-document-consumable-line-items',
  standalone: true,
  imports: [CommonModule],
  template: ` <div
    class="grid grid-cols-12 col-span-12 gap-x-1"
    *ngFor="let lineItem of quote.consumablesOnQuote; trackBy: trackByConsumableId"
  >
    <div class="col-span-6">
      <div class="text-lg font-medium">{{ lineItem?.consumable?.name }}</div>
      <div class="mt-2 text-md text-secondary">Consumable</div>
    </div>

    <div class="col-span-2 self-center text-right">
      {{ lineItem?.qty | number }}
    </div>

    <div class="col-span-2 self-center text-right">
      {{ lineItem?.sellPrice | currency : 'USD' }}
    </div>

    <div class="col-span-2 self-center text-right text-lg font-medium">
      {{ lineItem?.sellPrice * lineItem?.qty | currency : 'USD' }}
    </div>
    <div class="col-span-12 my-4 border-b"></div>
  </div>`,
})
export class ConsumableLineItems implements OnInit, OnDestroy {
  @Input() quote: Quote;

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  trackByConsumableId = (index: number, item: ConsumableOnQuote) => `${item?.consumable?.id}`;
}
