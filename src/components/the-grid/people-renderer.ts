import {Component} from "@angular/core";

import {ICellRendererAngularComp} from "ag-grid-angular";
import {ICellRendererParams} from "ag-grid-community";

@Component({
    selector: 'people',
    template: `<span
            *ngFor="let p of this.people; let idx=index"
            [attr.data-index]="idx"
            [class]="cssClasses"
    >{{p}}</span>`
})
export class PeopleRenderer implements ICellRendererAngularComp {
    people: Array<string>;
    private params: ICellRendererParams;
    private arrayOfCssClasses: string[];

    constructor() {
    }

    agInit(params: ICellRendererParams): void {
        this.refresh(params);
    }

    // called when the cell is refreshed
    refresh(params: ICellRendererParams): boolean {
        this.params = params;
        this.people = this.params.value;
        this.arrayOfCssClasses = ["cell", "person"];
        return true;
    }

    get cssClasses(): string {
        return this.arrayOfCssClasses.join(" ");
    }
}
