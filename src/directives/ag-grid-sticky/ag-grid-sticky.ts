import {Directive, ElementRef} from '@angular/core';
import {Platform, ScrollEvent} from "ionic-angular";
import {Observable, Subject} from "rxjs";
import {debounce} from "rxjs/operators";
import {timer} from "rxjs/observable/timer";

@Directive({
    selector: '[ag-grid-sticky]' // Attribute selector
})
export class AgGridStickyDirective {
    private agHeader: HTMLElement;
    private scrollSubject = new Subject<ScrollEvent>();

    constructor(private el: ElementRef, private platform: Platform) {
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

    windowScrolled(event: ScrollEvent) {
        this.scrollSubject.next(event);
    }

}
