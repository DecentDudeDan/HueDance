import { Component } from '@angular/core';
import { BulbsPage } from '../bulbs/bulbs';
import { SetupPage } from '../setup/setup';
import { HomePage } from '../home/home';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = BulbsPage;
  tab3Root = SetupPage;

  constructor() {

  }
}
