import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quote } from '../models/quote';
import { ProductDTO } from '../../cutting-lists/models/productDTO';
import { AggregatedProduct } from '../../aggregated-products/aggregatedProducts';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-quote-document-product-line-items',
  standalone: true,
  imports: [CommonModule],
  template: `<div
    class="col-span-12 gap-x-1 grid grid-cols-12"
    *ngFor="let product of productRows; trackBy: trackByFn"
  >
    <div class="col-span-6">
      <div class="text-lg font-medium">
        {{ product.productName }} :

        <span>{{ product.color }} </span>
        <span>{{ product.width }}mm </span>
      </div>
      <div class="mt-2 text-md text-secondary">Product</div>
    </div>
    <div class="col-span-2 self-center text-right">{{ product.itemsInGroup }}</div>
    <div class="col-span-2 self-center text-right">{{ product.unitPrice }}</div>
    <div class="col-span-2 self-center text-right">{{ product.total | currency : 'USD' }}</div>
    <div class="col-span-12 my-4 border-b"></div>
  </div>`,
})
export class ProductLineItems implements OnInit {
  @Input() quote: Quote;

  productRows: ProductRow[];

  ngOnInit(): void {
    this.productRows = this.groupByProductTypeColorWidth(this.quote);
  }

  groupByProductTypeColorWidth(quoteData: Quote): ProductRow[] {
    const markup = this.quote?.quotePrice?.markUp ?? 1;

    // We'll key by productType|color|width|unitPrice
    const groups: Record<string, ProductRow> = {};

    for (const product of quoteData.products) {
      // Extract fields:
      const productTypeName = product.productType?.name ?? 'Unknown';
      const colorName = product.color?.color ?? 'Unknown';
      const widthVal = product.width?.width ?? 0;
      const pricePerMeter = product.productPrice?.pricePerMeter ?? 0;
      const length = product.totalLength ?? 0;

      // The "unit price" for a single item is length * pricePerMeter * markup
      const itemUnitPrice = parseFloat((length * pricePerMeter * markup).toFixed(2));

      // Build a group key
      const groupKey = `${productTypeName} | ${colorName} | ${widthVal} | ${itemUnitPrice}`;

      // If no group yet, create it
      if (!groups[groupKey]) {
        groups[groupKey] = {
          productName: productTypeName,
          color: colorName,
          width: String(widthVal),
          unitPrice: itemUnitPrice, // cost per item
          itemsInGroup: 0,
          total: 0,
        };
      }

      // One more line goes into this group
      groups[groupKey].itemsInGroup += 1;

      // Accumulate total by adding this item’s unit price
      groups[groupKey].total += itemUnitPrice;
    }

    // Convert to array
    const resultRows = Object.values(groups);

    for (const row of resultRows) {
      row.total = parseFloat((row.unitPrice * row.itemsInGroup).toFixed(2));
    }

    return resultRows;
  }

  calculateProductLength(product: ProductDTO | null): number {
    if (!product) {
      return 0;
    }
    return product?.aggregatedProducts
      .reduce((productTotalLength: BigNumber, aggregatedProduct: AggregatedProduct) => {
        const componentLength = BigNumber(aggregatedProduct?.length || 0);
        return productTotalLength.plus(componentLength);
      }, BigNumber(0))
      .decimalPlaces(2)
      .toNumber();
  }

  calculateProductTotalPrice(product: ProductDTO | null): number {
    if (!product) {
      return null;
    }
    const productLength = this.calculateProductLength(product);
    const pricePerMeter = product?.productPrice?.pricePerMeter;
    if (!pricePerMeter || !productLength) {
      return null;
    }
    const markUp = this.quote?.quotePrice?.markUp;

    return BigNumber(productLength)
      .times(BigNumber(pricePerMeter).times(BigNumber(markUp)))
      .decimalPlaces(2)
      .toNumber();
  }

  trackByFn = (index: number, item: any): any => item.id || index;
}

export interface ProductRow {
  productName: string;
  color: string;
  width: string;
  unitPrice: number;
  itemsInGroup: number;
  total: number; // sum of unitPrice over all items in the group
}
