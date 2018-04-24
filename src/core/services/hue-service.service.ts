import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Light } from '../models/light';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';


@Injectable()
export class HueService {

    bridgeIp: string = '192.168.1.121';
    username: string = 'ulP1Lm81jkgZpHztKhGDdglfVzPGQlTyErH6b1Uc';
    lightMap;
    lastUpdate;
    constructor(private httpClient: HttpClient) {
    }


    public discoverBridges(): Observable<any> {
        return this.httpClient.get('https://www.meethue.com/api/nupnp');
    }

    public getLights(): Observable<any> {
        return this.httpClient.get(`http://${this.bridgeIp}/api/${this.username}/lights`).do(resp => {
            this.lightMap = resp;
        });
    }

    public getAllLights(): Array<Light> {
        return Object.keys(this.lightMap).map(k => {
            return this.lightMap[k];
        });
    }

    public setLightState(id, state) {
        const time = new Date().getTime();
        let diff = 0;

        if (this.lastUpdate) {
            diff = time - this.lastUpdate;
        } else {
            this.lastUpdate = time;
        }

        console.log('diff is: ', diff);
        if (diff > 100) {
            this.lastUpdate = time;
            console.log('updating light ', id);
            return this.httpClient.put(`http://${this.bridgeIp}/api/${this.username}/lights/${id}/state`, state);
        }

        return Observable.of({});
    }

    setLights(lightMap: any) {
        this.lightMap = lightMap;
    }

    public init() {
        return this.httpClient.post(`http://${this.bridgeIp}/api`, {
            devicetype: 'HueDance'
        });
    }

    public setBridgeIp(ip: string) {
        this.bridgeIp = ip;
    }
}