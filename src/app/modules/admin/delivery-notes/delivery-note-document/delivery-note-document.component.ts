import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportService } from '@shared/services/exportHTML.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeadingComponent } from '@layout/common/page-heading/page-heading.component';
import { DeliveryNote } from 'app/modules/admin/delivery-notes/models/delivery-note';
import { InventoryItem } from '../../inventory/models/inventoryItem';
import { GroupedItems } from '../models/grouped-items';
import { ProjectInformation } from '../models/projectInformation';
import { Client } from '../../clients/models/client';
import { PRODUCT_PLURAL_MAPPINGS } from '@shared/models/pluralMappings';

@Component({
  selector: 'app-delivery-note-document',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, PageHeadingComponent],
  templateUrl: './delivery-note-document.component.html',
  styleUrls: ['./delivery-note-document.component.scss'],
})
export class DeliveryNoteDocumentComponent implements OnChanges {
  @ViewChild('exportable', { static: false }) exportElRef: ElementRef;
  @Input() deliveryNote: DeliveryNote;
  @Input() client: Client;
  @Input() projectOverview: ProjectInformation;

  products: GroupedItems[] = [];
  consumablesGrouped: GroupedItems[] = [];

  PRODUCT_PLURAL_MAPPINGS = PRODUCT_PLURAL_MAPPINGS;

  constructor(private exportService: ExportService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['deliveryNote']?.currentValue) {
      this.deliveryNote = changes['deliveryNote'].currentValue;

      if (this.deliveryNote?.inventories) {
        this.groupItems(this.deliveryNote.inventories);
      }
    }

    if (changes['projectOverview']?.currentValue) {
      this.projectOverview = changes['projectOverview'].currentValue;
    }
  }

  groupItems(items: InventoryItem[]): void {
    items.sort((a, b) => a?.product?.frameType.localeCompare(b?.product?.frameType));

    this.products = [];
    this.consumablesGrouped = [];

    this.groupConsumables(items);
    this.groupManufacturedProducts(items);

    this.products.forEach((row) => {
      if (row.totalLengthOrQty !== undefined) {
        row.totalLengthOrQty = Number(row.totalLengthOrQty.toFixed(2));
      }
      this.handlePluralNaming(row);
    });
  }

  private handlePluralNaming(row: GroupedItems) {
    if (row.totalItems > 1) {
      const lowercaseName = row.name.toLowerCase();
      row.name = this.PRODUCT_PLURAL_MAPPINGS[lowercaseName] || row.name;
    }
  }

  private groupConsumables(items: InventoryItem[]): void {
    items.forEach((item) => {
      if (item.consumable) {
        const description = item.consumable.consumable.name;
        const existingGroup = this.consumablesGrouped.find((group) => group.name === description);
        if (existingGroup) {
          existingGroup.totalItems += item.consumable.qty;
          existingGroup.groupedInventoryItemDTO.push(item);
        } else {
          this.consumablesGrouped.push({
            name: description,
            totalItems: item.consumable.qty,
            totalLengthOrQty: 0,
            groupedInventoryItemDTO: [item],
          });
        }
      }
    });
  }

  private groupManufacturedProducts(items: InventoryItem[]): void {
    items.forEach((item) => {
      if (item.product) {
        this.products.push({
          name: item.product.productType.name,
          description: item.product.frameName,
          totalItems: item.product.totalQuantity,
          totalLengthOrQty: item.product.totalLength,
          groupedInventoryItemDTO: [item],
        });
      }
    });
  }

  exportAsPdf(): void {
    this.exportService.exportAsPdf(
      this.exportElRef.nativeElement,
      'Delivery Note ' + this.deliveryNote.id,
    );
  }
}
