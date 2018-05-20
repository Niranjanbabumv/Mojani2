import { Component, OnInit } from '@angular/core';
import { LandRecord } from '../models/LandRecord';
import { ManageLandRecordsService } from '../services/managelandrecords.service';
import { Observable } from 'rxjs';
import { SurveyDataService } from "../services/survey-data.service";

@Component({
  selector: 'app-submit-layout-survey',
  templateUrl: './submit-layout-survey.component.html',
  styleUrls: ['./submit-layout-survey.component.css']
})

export class SubmitLayoutSurveyComponent implements OnInit {
  private wardNo : number;
  private areaCode : number;
  private fetchComplete : boolean = false;
  private noSearchResults : boolean = false;
  private landRecords : LandRecord[];
  
  constructor(private manageLandRecordsService : ManageLandRecordsService,private surveyDataService: SurveyDataService) { }

  ngOnInit() {
    this.surveyDataService.currentWardNo.subscribe(records => {
      if(records)
        this.wardNo = Number(records);
    });
    this.surveyDataService.currentAreaCode.subscribe(records => {
      if(records)
        this.areaCode = Number(records);
    });

    //search the results if areacode and ward number present

    let criteria = {"wardNo" : this.wardNo, "areaCode" : this.areaCode};
    if(this.wardNo!=null && this.areaCode!=null){
      this.manageLandRecordsService.getLandRecordsMojaniInLayout(criteria)
      .subscribe(
        response => {
              console.log("res received from getLandRecords service" + JSON.stringify(response));
              if (response !=null) {
                delete response.landRecords['sketch'];
                  this.landRecords = <LandRecord[]> response.landRecords;
              if(this.landRecords!=null && this.landRecords.length > 0){
                  this.noSearchResults= false;
              }else{
                  this.noSearchResults = true;
              }
                  this.fetchComplete = true;     
              }
            });
    }
  }

  search(){
    console.log("ward No & Area Code:" + this.wardNo + "-" + this.areaCode);
    let criteria = {"wardNo" : this.wardNo, "areaCode" : this.areaCode};
    this.manageLandRecordsService.getLandRecordsMojaniInLayout(criteria)
    .subscribe(
      response => {
            console.log("res received from getLandRecords service" + JSON.stringify(response));
            if (response !=null) {
                delete response.landRecords['sketch'];
                this.landRecords = <LandRecord[]> response.landRecords;
             if(this.landRecords!=null && this.landRecords.length > 0){
                this.noSearchResults= false;
             }else{
                this.noSearchResults = true;
             }
                this.fetchComplete = true;     
                this.surveyDataService.updateWardNo(this.wardNo);
                this.surveyDataService.updateAreaCode(this.areaCode);
            }
          });
          
  }
}
