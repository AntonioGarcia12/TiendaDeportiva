import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { Community, Country, Province } from '@app/models/locations';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly api = `${environment.apiBaseUrl}/location`;
  private readonly http = inject(HttpClient);

  getCountries() {
    return this.http.get<Country[]>(`${this.api}/countries`);
  }
  getCommunities() {
    return this.http.get<Community[]>(`${this.api}/communities`);
  }
  getProvinces(cid: string) {
    return this.http.get<Province[]>(`${this.api}/provinces/${cid}`);
  }
}
