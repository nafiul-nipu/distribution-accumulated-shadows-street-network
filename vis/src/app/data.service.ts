import { environment } from '../environments/environment.prod';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {


  constructor(private http: HttpClient) { }

  getDistribution(arr: any []): Observable<any> {
    //
    let headers = new HttpHeaders();
    headers.append('Content-Type','application/json');
    return this.http.post(environment.filesurl+"distribution", arr, {headers})
  }
}
