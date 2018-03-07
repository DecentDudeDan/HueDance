import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class HueService {
    constructor(private httpClient: HttpClient) {
     }


     public discoverBridges(): Observable<any> {
        return this.httpClient.get('https://www.meethue.com/api/nupnp');
     }

     public getLights(ipAddress: string, username: string): Observable<any> {
         return this.httpClient.get(`http://${ipAddress}/api/${username}/lights`);
     }
    
}