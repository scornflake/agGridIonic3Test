import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {NavController, ScrollEvent} from 'ionic-angular';
import {TheGridComponent} from "../../components/the-grid/the-grid";
import {Data} from "../../components/data";

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage implements AfterViewInit {

    @ViewChild(TheGridComponent) grid;
    private data: Data;

    constructor(public navCtrl: NavController) {
        // this.data = new Data();
    }

    windowScrolled(event: ScrollEvent) {
        if (this.grid) {
            this.grid.windowScrolled(event);
        }
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.data = new Data(25);
        }, 1000);
    }

    gridData() {
        return this.data;
    }

    makeSmallDataChange() {
        this.data = this.data.createNewWithSmallChange();
    }
}
