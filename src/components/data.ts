import * as faker from 'faker';
import {Injectable} from "@angular/core";

@Injectable()
export class Data {
    rows: Array<any>;
    roles: Array<string>;

    constructor(private numberOfRowsInData: number = 50) {
        this.createRoles();
        this.createRows();
    }

    createRows() {
        let newRows = [];
        let date = new Date(2016, 0, 1);
        for (let i = 0; i < this.numberOfRowsInData; i++) {
            let newRow = {'date': date};
            let maxPeopleInCol = 0;
            for (let role of this.roles) {
                let names = this.generateNamesForCell();
                newRow[role] = names;
                maxPeopleInCol = Math.max(maxPeopleInCol, names.length);
            }
            newRow['_count'] = maxPeopleInCol;
            date.setDate(date.getDate() + 7);
            newRows.push(newRow);
        }
        this.rows = newRows;
    }

    private generateNamesForCell(): string[] {
        let names = [];
        if (Math.random() > 0.2) {
            names.push(faker.name.findName());
        }
        if (Math.random() > 0.85) {
            names.push(faker.name.findName());
        }
        return names;
    }

    private createRoles() {
        this.roles = [
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
        ];
    }

    createNewWithSmallChange() {
        let newData = new Data();
        newData.rows = this.rows;
        newData.makeSmallChange();
        return newData;
    }

    makeSmallChange(numberOfChanges: number = 5) {
        for (let i = 0; i < numberOfChanges; i++) {
            let index = Math.floor(Math.random() * this.rows.length);
            let row = this.rows[index];
            if (row) {
                let columnNames = Object.getOwnPropertyNames(row);
                let colIndex = Math.floor(columnNames.length * Math.random());
                let columnName = columnNames[colIndex];
                if (columnName) {
                    row[columnName] = this.generateNamesForCell();
                    console.log(`Changed for ${index}, column ${columnName} to ${row[columnName]}`);
                }
            }
        }
    }
}