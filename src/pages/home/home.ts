import {Component, ViewChild} from '@angular/core';
import {NavController, ScrollEvent} from 'ionic-angular';
import {TheGridComponent} from "../../components/the-grid/the-grid";

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    @ViewChild(TheGridComponent) grid;

    constructor(public navCtrl: NavController) {

    }

    windowScrolled(event: ScrollEvent) {
        if (this.grid) {
            this.grid.windowScrolled(event);
        }
    }
}
