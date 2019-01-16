import {NgModule} from '@angular/core';
import {AgGridModule} from 'ag-grid-angular';
import {TheGridComponent} from './the-grid/the-grid';

@NgModule({
    declarations: [TheGridComponent],
    imports: [
        AgGridModule.withComponents([]),
    ],
    exports: [TheGridComponent]
})
export class ComponentsModule {
}
