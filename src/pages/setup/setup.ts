import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { HueService } from '../../core/services/hue-service.service';
import { HueBridge } from '../../core/models/hue-bridge';

@Component({
  selector: 'page-setup',
  templateUrl: 'setup.html'
})
export class SetupPage {

  foundBridges: HueBridge[];

  constructor(public navCtrl: NavController, private hueService: HueService) {

  }
  
  fetchBridges() {
    this.hueService.discoverBridges().subscribe((resp: HueBridge[]) => {
      this.foundBridges = resp;
    });
  }

  initSetup() {
    this.hueService.init().subscribe(resp => {
      console.log(resp);
    });
  }

  setBridgeIp(ip) {
    this.hueService.setBridgeIp(ip);
  }

}
