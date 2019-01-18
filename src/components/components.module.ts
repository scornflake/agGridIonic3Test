import {NgModule} from '@angular/core';
import {AgGridModule} from 'ag-grid-angular';
import {TheGridComponent} from './the-grid/the-grid';
import {AgGridStickyDirective} from "../directives/ag-grid-sticky/ag-grid-sticky";
import {PeopleRenderer} from "./the-grid/people-renderer";
import {IonicModule} from "ionic-angular";

@NgModule({
    declarations: [
        TheGridComponent,
        AgGridStickyDirective,
        PeopleRenderer
    ],
    imports: [
        IonicModule,
        AgGridModule.withComponents([PeopleRenderer]),
    ],
    exports: [TheGridComponent]
})
export class ComponentsModule {
}
