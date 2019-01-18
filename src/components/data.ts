import * as faker from 'faker';
import {Injectable} from "@angular/core";

@Injectable()
export class Data {
    rows: Array<any>;
    roles: Array<string>;

    constructor() {
        this.createRoles();
        this.createRows();
    }

    createRows() {
        let newRows = [];
        let date = new Date(2016, 0, 1);
        for (let i = 0; i < 100; i++) {
            let newRow = {'date': date};
            let maxPeopleInCol = 0;
            for (let role of this.roles) {
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
        this.rows = newRows;
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
}