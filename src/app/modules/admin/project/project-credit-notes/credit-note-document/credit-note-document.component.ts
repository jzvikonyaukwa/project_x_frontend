import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportService } from '@shared/services/exportHTML.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeadingComponent } from '@layout/common/page-heading/page-heading.component';
import { ActivatedRoute } from '@angular/router';
import {CreditNoteDetailsDto} from "../create-credit-note-dialog/models/credit-notes-dto";
import {CreditNotesService} from "../services/credit-notes.service";
import {Subject, switchMap, takeUntil, throwError} from "rxjs";
import {Client} from "@bugsnag/js";


@Component({
  selector: 'app-credit-note-document',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, PageHeadingComponent],
  templateUrl: './credit-note-document.component.html',
  styleUrls: ['./credit-note-document.component.scss']
})
export class CreditNoteDocumentComponent implements OnChanges, OnInit {
  private ngUnsubscribe = new Subject<void>();
  @ViewChild('exportable', { static: false }) exportElRef: ElementRef;
  @Input() creditNoteDetails: CreditNoteDetailsDto[];
  @Input() client: Client;

  manufacturedProductsGrouped: GroupedItems[] = [];
  consumablesGrouped: GroupedItems[] = [];
  totalPrice: number = 0; // Add this property

  constructor(
      private exportService: ExportService,
      private route: ActivatedRoute,
      private creditNoteService: CreditNotesService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.creditNoteDetails) {
      this.creditNoteDetails = changes.creditNoteDetails.currentValue;
      if (this.creditNoteDetails) {
        this.groupItems(this.creditNoteDetails);
      }
    }
  }

  ngOnInit(): void {
    this.getClientInfo();
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.loadCreditNoteDetails(id);
    });
  }

  getClientInfo() {
    this.route.paramMap
        .pipe(
            switchMap((params) => {
              const idParam = params.get("id");
              const id = Number(idParam);
              if (!isNaN(id)) {
                return this.creditNoteService.getClientInfoByCreditNoteId(id);
              } else {
                console.log("Invalid Delivery Note ID");
                return throwError(() => new Error("Invalid Delivery Note ID"));
              }
            }),
            takeUntil(this.ngUnsubscribe)
        )
        .subscribe({
          next: (client) => {
            console.log("client: ", client);
            this.client = client;
            console.log(this.client);
          },
          error: (err) => {
            console.log("Error occurred in the ngOnInit.", err);
          },
        });
  }

  loadCreditNoteDetails(id: number): void {
    this.creditNoteService.getCreditNoteDetailsById(id).subscribe((data) => {
      console.log('Data fetched from API:', data);
      this.creditNoteDetails = data;
      if (this.creditNoteDetails) {
        this.groupItems(this.creditNoteDetails);
      }
    }, (error) => {
      console.error('Error fetching data:', error);
    });
  }

  groupItems(items: CreditNoteDetailsDto[]): void {
    this.totalPrice = 0; // Reset total price
    this.manufacturedProductsGrouped = [];
    this.consumablesGrouped = [];

    items.forEach((item) => {
      if (item.consumableOnQuoteId !== null) {
        const existingGroup = this.consumablesGrouped.find(
            (group) => group.frameName === item.frameName
        );

        const price = item.consumableOnQuoteQty * item.consumableOnQuoteUnitPrice;

        if (existingGroup) {
          existingGroup.totalItems += item.consumableOnQuoteQty;
          existingGroup.totalPrice += price;
          existingGroup.groupedInventoryItemDTO.push(item);
        } else {
          this.consumablesGrouped.push({
            frameType: "Consumable",
            frameName: item.frameName,
            totalItems: item.consumableOnQuoteQty,
            totalLengthOrQty: length,
            unitPrice: item.consumableOnQuoteUnitPrice,
            totalPrice: price,
            groupedInventoryItemDTO: [item],
          });
        }

        this.totalPrice += price; // Add price to totalPrice
      } else if (item.manufacturedProductFrameType !== null) {
        const frameType = item.manufacturedProductFrameType;
        const frameName = item.manufacturedProductFrameName;
        const pricePerMeter = item.manufacturedProductPricePerMeter;
        const length = item.manufacturedProductLength;
        const price = pricePerMeter * length; // Calculate the total price for this item

        const existingGroup = this.manufacturedProductsGrouped.find(
            (group) =>
                group.frameType === frameType && group.frameName === frameName
        );
        if (existingGroup) {
          existingGroup.totalItems += 1;
          existingGroup.totalLengthOrQty += length;
          existingGroup.totalPrice += price; // Add the price to the total
          existingGroup.groupedInventoryItemDTO.push(item);
        } else {
          this.manufacturedProductsGrouped.push({
            frameType,
            frameName,
            totalItems: 1,
            totalLengthOrQty: length,
            unitPrice: pricePerMeter, // Store unit price
            totalPrice: price, // Initialize the total price
            groupedInventoryItemDTO: [item],
          });
        }

        this.totalPrice += price; // Add price to totalPrice
      }
    });

    this.manufacturedProductsGrouped.forEach((group) => {
      if (group.totalLengthOrQty !== undefined) {
        group.totalLengthOrQty = parseFloat(group.totalLengthOrQty.toFixed(2));
      }
    });

    console.log('manufacturedProductsGrouped', this.manufacturedProductsGrouped);
    console.log('consumablesGrouped', this.consumablesGrouped);
    console.log('Total Price:', this.totalPrice);
  }




  exportAsPdf(): void {
    this.exportService.exportAsPdf(
        this.exportElRef.nativeElement,
        'Credit Note ' + this.creditNoteDetails[0].creditNoteId
    );
  }
}

interface GroupedItems {
  frameType: string;
  frameName: string;
  totalItems: number;
  totalLengthOrQty: number;
  unitPrice: number; //  unit price here
  totalPrice: number; // price here
  groupedInventoryItemDTO: CreditNoteDetailsDto[];
}
