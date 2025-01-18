import { Route } from '@angular/router';

import { LayoutComponent } from '@layout/layout.component';
import { InitialDataResolver } from 'app/app.resolvers';
import { AddPurchaseOrderComponent } from './modules/admin/purchase-orders/add-purchase-order/add-purchase-order.component';
import { EditPurchaseOrderComponent } from './modules/admin/purchase-orders/edit-purchase-order/edit-purchase-order.component';
import { InterBranchTransfersComponent } from './modules/admin/inter-branch-transfers/inter-branch-transfers/inter-branch-transfers.component';
import { ProductTransactionsComponent } from './modules/admin/product-transactions/product-transactions.component';
import { PurchaseOrdersExportDocumentComponent } from './modules/admin/purchase-orders/purchase-orders-export-document/purchase-orders-export-document.component';
import { PurchaseOrderWithGrvInfoComponent } from './modules/admin/purchase-orders/purchase-order-with-grv-info/purchase-order-with-grv-info.component';
import { AuthGuard } from './core/auth/guards/auth.guard';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'auth',
    component: LayoutComponent,
    data: {
      layout: 'empty',
    },
    loadChildren: () => import('app/modules/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: '',
    canActivate: [AuthGuard],
    component: LayoutComponent,
    resolve: {
      initialData: InitialDataResolver,
    },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('app/modules/admin/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'clients',
        loadChildren: () =>
          import('app/modules/admin/clients/clients.module').then((m) => m.ClientsModule),
      },
      {
        path: 'suppliers',
        loadChildren: () =>
          import('app/modules/admin/suppliers/suppliers.module').then((m) => m.SuppliersModule),
      },
      {
        path: 'consignors',
        loadChildren: () =>
          import('app/modules/admin/consignors/consignors.routing').then(
            (m) => m.CONSIGNORS_ROUTES,
          ),
      },
      {
        path: 'machines',
        loadChildren: () =>
          import('app/modules/manufacturing/machines/machines.module').then(
            (m) => m.MachinesModule,
          ),
      },
      {
        path: 'quotes',
        loadComponent: () =>
          import('app/modules/admin/quotes/quotes.component').then((m) => m.QuotesComponent),
      },
      {
        path: 'quotes/add',
        loadComponent: () =>
          import('app/modules/admin/quotes/add-quote/add-quote.component').then(
            (m) => m.AddQuoteComponent,
          ),
      },
      {
        path: 'quotes/:id',
        loadComponent: () =>
          import('app/modules/admin/quotes/quote/quote.component').then((m) => m.QuoteComponent),
      },
      {
        path: 'quotes/details/:id',
        loadComponent: () =>
          import('app/modules/admin/quotes/quote-document/quote-document.component').then(
            (m) => m.QuoteDocumentComponent,
          ),
      },
      {
        path: 'completed-cutting-list/:id',
        loadComponent: () =>
          import(
            'app/modules/admin/cutting-lists/completed-cutting-list/completed-cutting-list.component'
          ).then((m) => m.CompletedCuttingListComponent),
      },
      {
        path: 'cutting-lists/:id',
        loadComponent: () =>
          import('app/modules/admin/cutting-list/cutting-list.component').then(
            (c) => c.CuttingListComponent,
          ),
      },
      {
        path: 'delivery-notes',
        loadComponent: () =>
          import('app/modules/admin/delivery-notes/delivery-notes.component').then(
            (m) => m.DeliveryNotesComponent,
          ),
      },
      {
        path: 'grv',
        loadChildren: () => import('app/modules/admin/grvs/grvs.routing').then((m) => m.GRV_ROUTES),
      },
      {
        path: 'purchase-orders',
        loadComponent: () =>
          import('app/modules/admin/purchase-orders/purchase-orders.component').then(
            (m) => m.PurchaseOrdersComponent,
          ),
      },
      {
        path: 'purchase-orders/edit/:id',
        component: EditPurchaseOrderComponent,
      },
      {
        path: 'purchase-orders/export-document/:id',
        component: PurchaseOrdersExportDocumentComponent,
      },
      {
        path: 'purchase-orders/deliveries/:id',
        component: PurchaseOrderWithGrvInfoComponent,
      },
      {
        path: 'purchase-orders/create',
        component: AddPurchaseOrderComponent,
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import('app/modules/admin/invoices/invoices.component').then((m) => m.InvoicesComponent),
      },
      {
        path: 'invoices/:id',
        loadComponent: () =>
          import('app/modules/admin/invoices/invoice/invoice.component').then(
            (m) => m.InvoiceComponent,
          ),
      },
      {
        path: 'sale-orders',
        loadComponent: () =>
          import('app/modules/admin/sale-orders/sale-orders.component').then(
            (m) => m.SaleOrdersComponent,
          ),
      },
      {
        path: 'sale-orders/:id',
        loadComponent: () =>
          import('app/modules/admin/sale-orders/sale-order/sale-order.component').then(
            (m) => m.SaleOrderComponent,
          ),
      },
      {
        path: 'product-transactions',
        component: ProductTransactionsComponent,
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('app/modules/admin/projects/projects.component').then((m) => m.ProjectsComponent),
      },
      {
        path: 'projects/:id',
        loadComponent: () =>
          import('app/modules/admin/project/project.component').then((m) => m.ProjectComponent),
      },
      {
        path: 'stocks',
        loadChildren: () =>
          import('app/modules/admin/stock/stock.routing').then((m) => m.STOCK_ROUTES),
      },
      {
        path: 'inter-branch-transfers',
        component: InterBranchTransfersComponent,
      },
      {
        path: 'completed-products',
        loadComponent: () =>
          import(
            'app/modules/admin/cutting-lists/completed-cutting-lists/completed-cutting-lists.component'
          ).then((m) => m.CompletedCuttingListsComponent),
      },
      {
        path: 'delivery-note/:id',
        loadComponent: () =>
          import('app/modules/admin/delivery-notes/delivery-note/delivery-note.component').then(
            (m) => m.DeliveryNoteComponent,
          ),
      },
      {
        path: 'credit-note/:id',
        loadComponent: () =>
          import(
            'app/modules/admin/project/project-credit-notes/credit-note-document/credit-note-document.component'
          ).then((m) => m.CreditNoteDocumentComponent),
      },
    ],
  },
  {
    path: 'manufacturing',
    canActivate: [AuthGuard],
    component: LayoutComponent,
    resolve: {
      initialData: InitialDataResolver,
    },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            'app/modules/manufacturing/manufacturing-dashboard/manufacturing-dashboard.component'
          ).then((m) => m.ManufacturingDashboardComponent),
      },
    ],
  },
];
