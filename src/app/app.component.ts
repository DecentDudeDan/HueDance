import { Component, OnInit } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import { BackgroundMode } from '@ionic-native/background-mode';
import { HueService } from '../core/services/hue-service.service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp implements OnInit {
  rootPage:any = TabsPage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private backgroundMode: BackgroundMode, private hueService: HueService) {
    platform.ready().then(() => {
      backgroundMode.enable();
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

  ngOnInit() {
    this.hueService.getLights();
  }
}
