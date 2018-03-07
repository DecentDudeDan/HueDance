import { HueBridge } from './../../core/models/hue-bridge';
import { HueService } from './../../core/services/hue-service.service';
import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-bulbs',
  templateUrl: 'bulbs.html'
})
export class BulbsPage implements OnInit {

  constructor(public navCtrl: NavController, private hueService: HueService) {

  }

  ngOnInit() {
    this.hueService.discoverBridges().subscribe((bridges: HueBridge[]) => {
      console.log(bridges);
    });
  }

}
