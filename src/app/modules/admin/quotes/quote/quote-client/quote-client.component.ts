import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { Project } from '../../../projects/models/project';

@Component({
  selector: 'app-quote-client',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  template: `
    <div
      class="w-full relative flex flex-col items-center min-h-48 filter-info bg-white shadow-md rounded-xl rounded-b-lg min-w-48"
    >
      <div class="w-full flex items-center gap-2 bg-blue-100 p-4 rounded-xl rounded-b-none">
        <mat-icon class="icon hidden sm:block text-axe-blue" aria-hidden="true">source</mat-icon>
        <div class="project-name" [matTooltip]="'Project: ' + project?.name">
          {{ project?.name }}
        </div>
      </div>
      <div class="flex items-center flex-col mt-3 text-axe-dark-blue text-base font-normal">
        <div class="w-full flex items-center justify-center gap-1 sm:gap-2 p-1 md:p-4">
          <mat-icon class="icon hidden sm:block text-axe-blue" aria-hidden="true"
            >account_circle</mat-icon
          >
          <div class="client-name">
            {{ client.name }}
          </div>
        </div>
        <div class="items-center client-address" [class.pb-4]="!phone" *ngIf="street || suburb">
          <ng-container *ngIf="street">&nbsp;{{ street }}</ng-container>
          <ng-container *ngIf="suburb">&nbsp;{{ suburb }}</ng-container>
        </div>
        <div class="client-phone" *ngIf="phone">&nbsp;{{ phone }}</div>
      </div>
    </div>
  `,
  styles: [
    `
      .border-dashed-red {
        border: 1px;
        border-style: dashed;
        border-color: red;
      }
      .icon {
        @apply icon-size-4;
        @apply sm:icon-size-5;
        @apply md:icon-size-6;
      }
      .project-name {
        @apply text-sm font-semibold leading-tight text-center text-axe-blue;
        @apply sm:text-xl;
        @apply md:text-2xl md:font-semibold;
      }
      .client-name {
        @apply text-sm font-semibold text-blue-800 leading-tight text-center;
        @apply sm:text-xl sm:font-semibold text-axe-blue;
        @apply md:text-2xl;
      }
      .client-address {
        @apply text-sm font-normal;
        @apply sm:text-base sm:font-semibold;
      }
      .client-phone {
        @apply text-center mb-1 text-axe-blue text-xl font-medium;
        @apply sm:text-2xl sm:font-semibold;
        @apply md:text-3xl;
      }
    `,
  ],
})
export class QuoteClientComponent implements OnInit, OnDestroy {
  private _selected: Project;

  @Input()
  set project(value: Project) {
    this._selected = value;
  }

  get project(): Project {
    return this._selected;
  }

  constructor() {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  get client() {
    return this.project?.client;
  }

  get phone(): string | null {
    const phone = this.project?.client?.phones?.[0]?.phone?.trim();
    return phone || null;
  }

  get street(): string | null {
    const street = this.project?.client?.addresses?.[0]?.street?.trim();
    return street ? (this.suburb ? `${street}, ` : street) : null;
  }

  get suburb(): string | null {
    const suburb = this.project?.client?.addresses?.[0]?.suburb?.trim();
    const city = this.city && this.city !== suburb ? this.city : null;
    return [suburb, city].filter(Boolean).join(', ') || null; // Filter out null/undefined
  }

  get city(): string | null {
    return this.project?.client?.addresses?.[0]?.city?.trim() || null;
  }
}
