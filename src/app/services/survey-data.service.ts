import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {LandRecord} from '../models/LandRecord';

@Injectable()
export class SurveyDataService {
  private landRecords = new BehaviorSubject<LandRecord[]>([]);
  currentLandRecords = this.landRecords.asObservable();

  private wardNo = new BehaviorSubject("");
  currentWardNo = this.wardNo.asObservable();

  private siteNo = new BehaviorSubject("");
  currentSiteNo = this.siteNo.asObservable();

  private areaCode = new BehaviorSubject("");
  currentAreaCode = this.areaCode.asObservable();

  constructor() { 
    
  }
  updateLandRecords(records : LandRecord[]) {
      this.landRecords.next(records);
  }

  updateWardNo(wardNo :any){
      this.wardNo.next(wardNo);
  }
  updateSiteNo(siteNo :any){
    this.siteNo.next(siteNo);
  }
  updateAreaCode(areaCode :any){
    this.areaCode.next(areaCode);
  }

}
