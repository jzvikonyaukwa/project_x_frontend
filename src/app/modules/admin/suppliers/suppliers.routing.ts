import { Route } from '@angular/router';
import { SuppliersComponent } from './suppliers.component';
import { SuppliersListComponent } from './suppliers-list/suppliers-list.component';
import { AddSupplierComponent } from './add-supplier/add-supplier.component';
import { DetailsComponent } from './details/details.component';

export const suppliersRoutes: Route[] = [
    {
        path: '',
        component: SuppliersComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'all-suppliers'
            },
            {
                path: 'all-suppliers',
                component: SuppliersListComponent
            },
            {
                path: 'add',
                component: AddSupplierComponent
            },
            {
                path: ':id',
                component: DetailsComponent
            }
        ],
    },
];
