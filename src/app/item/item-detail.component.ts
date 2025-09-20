import { Component, HostListener, NgZone, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { localize } from '@nativescript/localize';
import { SegmentedBar, SegmentedBarItem, Page, Trace, ObservableArray } from '@nativescript/core';
import { NativeDialogService, RouterExtensions } from '@nativescript/angular';


@Component({
  selector: 'ns-order-receipt-date-detail',
  templateUrl: './order-receipt-date-detail.component.html',
  styleUrls: ['./order-receipt-date-detail.component.scss']

})
export class OrderReceiptDateDetailComponent implements OnInit {

  public displayDate: Date;
  public segBarItems: Array<SegmentedBarItem>;
  public selectedSegmentIndex = 0;  
  public segBar: SegmentedBar;
  public isBusy: boolean;
  public currentUserName: string;

  constructor(
    public routerExtension: RouterExtensions,
    private activatedRoute: ActivatedRoute,
    private zone: NgZone,
    public vcRef: ViewContainerRef,
    public page: Page
  ) {
    this.displayDate = new Date();
    this.segBarItems = [];
    let segmentedBarOrders = <SegmentedBarItem>(new SegmentedBarItem());
    segmentedBarOrders.title = localize(
      'order-receipts.date-detail-orders-header'
    );
    this.segBarItems.push(segmentedBarOrders);
    let segmentedBarReturns = <SegmentedBarItem>new SegmentedBarItem();
    segmentedBarReturns.title = localize(
      'order-receipts.date-detail-returns-header'
    );
    this.segBarItems.push(segmentedBarReturns);
    this.selectedSegmentIndex = 0;
  }

  ngOnInit() {
  }
  
  @HostListener('loaded')
  pageOnInit() {
        this.activatedRoute.params.subscribe(async params => {
          let dateSelStr = params.historyDate;
          let dateSel = new Date(Date.parse(dateSelStr));
          this.displayDate = dateSel;
        });
  }

  @HostListener('unloaded')
  pageDestroy() {
  }

  private async getFirebaseOrderReceiptSnapshotForDate(dateSel: Date, userId: string) {

  }

  /**
   * Handler for segment bar index change
   *
   * @param args Chose segment bar
   */
   public onSelectedSegBarIndexChange(args: any) {
    let segmentedBar = <SegmentedBar>args.object;
    this.selectedSegmentIndex = segmentedBar.selectedIndex;
    this.segBar = segmentedBar;
  }

  public onBackButtonTap() {
    this.routerExtension.back();
  }
  
  public navigateToDetails(item: string) {
    this.zone.run(() => {
    });    
  }

  public onSegBarLoaded(args: any) {
    const segmentedBar = args.object as SegmentedBar;
    /*
    if(this.isIOS()) {
      const ios = segmentedBar.ios; // UISegmentedControl
      // ios.backgroundColor = UIColor.whiteColor;
      // ios.tintColor = UIColor.whiteColor;
      ios.selectedSegmentTintColor = UIColor.blueColor;
      ios.backgroundColor = UIColor.greenColor;
      // console.log('DONE', ios);
    }
    */
  }

}
