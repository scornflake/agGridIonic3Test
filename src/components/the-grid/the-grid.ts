import {ChangeDetectionStrategy, Component, NgZone, ViewChild} from '@angular/core';
import {Platform} from "ionic-angular";
import {AgGridStickyDirective} from "../../directives/ag-grid-sticky/ag-grid-sticky";
import {AgGridNg2} from "ag-grid-angular";
import {CellClickedEvent, GridOptions} from "ag-grid-community";
import * as faker from 'faker';
import * as moment from "moment";
import {Moment} from "moment";
import {PeopleRenderer} from "./people-renderer";

const defaultAgRowHeight = 28;

@Component({
    selector: 'the-grid',
    templateUrl: 'the-grid.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheGridComponent {
    rows: any;
    gridOptions: GridOptions;
    columnDefinitions: any;

    private _textSizingDiv: HTMLElement;
    private _textWidths: Map<string, number>;
    private _textWidthReasons: Map<string, string>;

    constructor(public zone: NgZone, public platform: Platform) {
    }

    @ViewChild(AgGridNg2) agGrid: AgGridNg2;
    @ViewChild(AgGridStickyDirective) stickyDirective;

    private refreshDelay: number = 10;

    get allRolesInLayoutAndDisplayOrder() {
        return [
            "Leader",
            "Bass",
            "Drums",
            "Guitar (Accoustic)",
            "Guitar (Elec1)",
            "Guitar (Elec2)",
            "Keys 1",
            "Keys 2",
            "Vocal (Main)",
            "Vocal (Back1)",
            "Vocal (Back2)",
            "Sound",
            "Lighting",
        ]
    }


    ngOnInit() {
        this.rows = this.createRows();
        this.determineTextWidths();
        this.columnDefinitions = this.agColumnDefs();
        this.gridOptions = {
            // onGridReady: this.agResizeColumnsWhenGridReady.bind(this),
            columnDefs: this.columnDefinitions,
            rowData: this.rows,
            onCellClicked: this.agClickHandler,
            getRowHeight: (params) => {
                let countForThisRow = params.data['_count'] || 1;
                return defaultAgRowHeight * countForThisRow;
            },
            frameworkComponents: {
                peopleRenderer: PeopleRenderer
            }
        }
    }

    ngAfterViewInit() {
    }

    windowScrolled(event) {
        this.stickyDirective.windowScrolled(event);
    }

    determineTextWidths() {
        this._textWidths = new Map<string, number>();
        this._textWidthReasons = new Map<string, string>();
        let columnNames = Object.getOwnPropertyNames(this.rows[0]);
        for (let columnName of columnNames) {
            let maxWidth = 0;
            for (let row of this.rows) {
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

    createRows() {
        let newRows = [];
        let date = new Date(2016, 0, 1);
        for (let i = 0; i < 100; i++) {
            let newRow = {'date': date};
            let maxPeopleInCol = 0;
            for (let role of this.allRolesInLayoutAndDisplayOrder) {
                let names = [];
                if (Math.random() > 0.2) {
                    names.push(faker.name.findName());
                }
                if (Math.random() > 0.85) {
                    names.push(faker.name.findName());
                }
                newRow[role] = names;
                maxPeopleInCol = Math.max(maxPeopleInCol, names.length);
            }
            newRow['_count'] = maxPeopleInCol;
            date.setDate(date.getDate() + 7);
            newRows.push(newRow);
        }
        return newRows;
    }

    agRowData() {
        return this.rows;
    }

    formatAsPlanDate(date) {
        return moment(date).format("MMM D, YYYY");
    }

    agColumnDefs() {
        let roles = this.allRolesInLayoutAndDisplayOrder;
        let columns: any[] = [
            {
                headerName: 'Date',
                field: 'date',
                pinned: 'left',
                valueFormatter: (params) => {
                    return this.formatAsPlanDate(params.value)
                },
                width: this._textWidths['date']
            }
        ];
        for (let role of roles) {
            let existing = this._textWidths.get(role) || 0;
            let def = {
                headerName: role,
                field: role,
                cellRenderer: 'peopleRenderer',
                width: this._textWidths[role]
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
}
