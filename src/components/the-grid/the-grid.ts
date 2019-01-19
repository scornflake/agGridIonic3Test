import {ChangeDetectionStrategy, Component, Input, NgZone, ViewChild} from '@angular/core';
import {Platform} from "ionic-angular";
import {AgGridStickyDirective} from "../../directives/ag-grid-sticky/ag-grid-sticky";
import {AgGridNg2} from "ag-grid-angular";
import {CellClickedEvent, GridOptions} from "ag-grid-community";
import * as moment from "moment";
import {PeopleRenderer} from "./people-renderer";
import {Data} from "../data";
import * as _ from 'lodash';

const defaultAgRowHeight = 28;

@Component({
    selector: 'the-grid',
    templateUrl: 'the-grid.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheGridComponent {
    gridOptions: GridOptions;

    @Input('data')
    set data(data: Data) {
        this._data = data;
        this.computeGridOptions();
    }

    get data(): Data {
        return this._data;
    }

    private _textSizingDiv: HTMLElement;
    private _textWidths: Map<string, number>;
    private _textWidthReasons: Map<string, string>;
    private _data: Data;

    constructor(public zone: NgZone, public platform: Platform) {
    }

    @ViewChild(AgGridNg2) agGrid: AgGridNg2;
    @ViewChild(AgGridStickyDirective) stickyDirective;

    private refreshDelay: number = 10;

    ngOnInit() {
        /*
        For some reason, ag-Grid doesn't pick up on a refresh of GridOptions.
        Fortunately, some (of the important ones!) can be set here, without having data
         */
        this.gridOptions = {
            onCellClicked: this.agClickHandler,
            getRowHeight: (params) => {
                let countForThisRow = params.data['_count'] || 1;
                return defaultAgRowHeight * countForThisRow;
            },
            enableCellChangeFlash: true,
            frameworkComponents: {
                peopleRenderer: PeopleRenderer
            }
        };
    }

    ngAfterViewInit() {
    }

    windowScrolled(event) {
        this.stickyDirective.windowScrolled(event);
    }

    determineTextWidths() {
        this._textWidths = new Map<string, number>();
        this._textWidthReasons = new Map<string, string>();
        if (this.data === undefined || this.data.rows === undefined) {
            console.warn(`No data rows - not determining column widths`);
            return;
        }
        let columnNames = Object.getOwnPropertyNames(this.data.rows[0]);
        for (let columnName of columnNames) {
            let maxWidth = 0;
            for (let row of this.data.rows) {
                let value = row[columnName];
                if (Array.isArray(value)) {
                    for (let val of value) {
                        maxWidth = this.maxOfExistingAndText(columnName, maxWidth, val);
                    }
                } else if (columnName == 'date') {
                    maxWidth = this.maxOfExistingAndText(columnName, maxWidth, this.formatAsPlanDate(new Date()));
                } else {
                    maxWidth = this.maxOfExistingAndText(columnName, maxWidth, value);
                }
            }
            this._textWidths[columnName] = maxWidth;
        }
        for (let columnName of Object.getOwnPropertyNames(this._textWidths)) {
            console.log(`${columnName} width is ${this._textWidths[columnName]}, because of ${this._textWidthReasons[columnName]}`);
        }
    }

    formatAsPlanDate(date) {
        return moment(date).format("MMM D, YYYY");
    }

    agColumnDefs() {
        let columns: any[] = [
            {
                headerName: 'Date',
                field: 'date',
                pinned: 'left',
                valueFormatter: (params) => {
                    return this.formatAsPlanDate(params.value)
                },
                width: this._textWidths['date'] || 200
            }];
        if (this.data === undefined || this.data.rows === undefined) {
            return columns;
        }

        let roles = this.data.roles;
        for (let role of roles) {
            let existing = this._textWidths.get(role) || 0;
            let def = {
                headerName: role,
                field: role,
                cellRenderer: 'peopleRenderer',
                width: this._textWidths[role] || 200,
                equals: (namesOne, namesTwo) => {
                    let changed = _.isEqual(namesOne, namesTwo);
                    if(!changed) {
                        console.warn(`${namesOne} didn't differ`);
                    } else {
                        console.warn(`${namesOne}/${namesTwo} were different`);
                    }
                    return changed;
                }
            };
            if (existing) {
                def['width'] = existing;
            }
            columns.push(def);
        }
        return columns;
    }

    agClickHandler(event: CellClickedEvent) {
        let srcElement = event.event.srcElement;
        if (srcElement.tagName == 'SPAN') {
            let index = srcElement.getAttribute('data-index');

            let row = event.data;
            let columnData = row[event.colDef.field];
            console.log(`Clicked span ${srcElement} / ${index}: ${columnData[index]}`);
        } else {
            console.log(`Clicked ${srcElement}, ${srcElement.tagName}`);
        }
    }

    agResizeColumnsWhenGridReady() {
        if (!this.agGrid || !this.agGrid.api) {
            console.log("grid not ready...");
            this.refreshDelay += Math.min(this.refreshDelay + 100, 1500);
            setTimeout(() => {
                this.agResizeColumnsWhenGridReady();
            }, this.refreshDelay);
            return;
        }
        console.warn(`resizing columns to fit`);
        this.agGrid.api.sizeColumnsToFit();
    }

    private widthForText(text: string, padding: number = 10) {
        if (!this._textSizingDiv) {
            this._textSizingDiv = document.getElementById('Test');
        }
        this._textSizingDiv.innerText = text;
        return this._textSizingDiv.offsetWidth + (2 * padding);
    }

    private maxOfExistingAndText(columnName: string, existingWidth: number, object: any) {
        let text = object.toString();
        let textLen = this.widthForText(text);
        if (textLen > existingWidth) {
            // console.warn(`Choosing ${textLen} for '${text}'`);
            this._textWidthReasons[columnName] = text;
            return textLen;
        }
        return existingWidth;
    }

    private computeGridOptions() {
        console.log(`New data set - computing new grid parameters`);
        this.determineTextWidths();
        let columnDefinitions = this.agColumnDefs() || [];
        let rowData = this.data ? this.data.rows : [];

        if (this.agGrid !== undefined && this.agGrid.api !== undefined) {
            this.agGrid.api.setRowData(rowData);
            this.agGrid.api.setColumnDefs(columnDefinitions);
            // this.agGrid.api.flashCells();
            // Not needed, I don't think?
            // this.agGrid.api.redrawRows();
            console.info(`GridOptions recomputed. ${rowData.length} rows, ${columnDefinitions.length} columns. Refreshing grid...`);
        } else {
            console.warn(`No grid defined on page! Cannot refresh`);
        }
    }
}
