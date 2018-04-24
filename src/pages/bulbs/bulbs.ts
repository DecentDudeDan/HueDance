import { HueBridge } from './../../core/models/hue-bridge';
import { HueService } from './../../core/services/hue-service.service';
import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Light } from '../../core/models/light';

@Component({
  selector: 'page-bulbs',
  templateUrl: 'bulbs.html'
})
export class BulbsPage implements OnInit {

  foundLights: Light[] = [];
  enabledLights: Light[] = [];
  constructor(public navCtrl: NavController, private hueService: HueService) {

  }

  ngOnInit() {
    this.hueService.getLights().subscribe(resp => {
      Object.keys(resp).forEach(k => {
        let light: Light = resp[k];
        light.enabled = true;
        light.id = k;
        this.foundLights.push(light);
      });
      this.hueService.setLights(resp);
    });

  }
}
