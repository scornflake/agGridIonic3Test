import {ChangeDetectionStrategy, Component} from '@angular/core';
import * as faker from 'faker';

@Component({
    selector: 'the-grid',
    templateUrl: 'the-grid.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheGridComponent {

    rows: any;

    constructor() {
    }

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
    }

    createRows() {
        let newRows = [];
        let date = new Date(2016, 0, 1);
        for (let i = 0; i < 100; i++) {
            let newRow = {'date': date};
            for (let role of this.allRolesInLayoutAndDisplayOrder) {
                if (Math.random() > 0.2) {
                    newRow[role] = faker.name.findName();
                }
            }
            date.setDate(date.getDate() + 7);
            newRows.push(newRow);
        }
        return newRows;
    }

    agRowData() {
        return this.rows;
    }

    agColumnDefs() {
        let roles = this.allRolesInLayoutAndDisplayOrder;
        let columns: any[] = [
            {headerName: 'Date', field: 'date', 'pinned': 'left'}
        ];
        for (let role of roles) {
            let def = {
                headerName: role,
                field: role,
            };
            columns.push(def);
        }
        return columns;
    }

}
