import {ChangeDetectionStrategy, Component, NgZone} from '@angular/core';
import * as faker from 'faker';
import {Observable, Subject} from "rxjs";
import {Platform, ScrollEvent} from "ionic-angular";
import {debounce} from "rxjs/operators";
import {timer} from "rxjs/observable/timer";

@Component({
    selector: 'the-grid',
    templateUrl: 'the-grid.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheGridComponent {

    rows: any;

    constructor(public zone: NgZone, public platform: Platform) {
    }

    agHeader: HTMLElement;
    scrollSubject = new Subject<ScrollEvent>();

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

    async isDevice(): Promise<boolean> {
        return this.platform.ready().then(() => {
            let isADevice = this.platform.is('cordova');
            console.warn(`isDevice() - on device?:${isADevice}`);
            return isADevice;
        });
    }

    ngAfterViewInit() {
        this.agHeader = document.querySelector('.ag-header');
        console.log(`Our header is: ${this.agHeader}`);

        // It's janky under iOS. This helps, but scrolling back up looks pretty awful (you see the header mid-table)
        this.isDevice().then(isDevice => {
            console.warn(`Setup scroll subject listener. On device? ${isDevice}`);
            let theSubject = this.scrollSubject as Observable<ScrollEvent>;
            if (isDevice) {
                // try to de-jank
                theSubject = this.scrollSubject.pipe(debounce(() => timer(10)));
            }
            theSubject.subscribe((event) => {
                this.adjustHeader(event.scrollTop);
            });
        })
    }

    adjustHeader(position: number) {
        if (this.agHeader) {
            this.agHeader.style.top = `${position - 1}px`;
            this.agHeader.style.position = 'absolute';
        }
    }

    windowScrolled(event) {
        this.scrollSubject.next(event);
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
