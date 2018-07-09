import { Component, OnInit,NgModule } from '@angular/core';
import { LandRecord } from '../models/LandRecord';
import { ManageLandRecordsService } from '../services/managelandrecords.service';
import { Observable } from 'rxjs';
import { SurveyDataService } from "../services/survey-data.service";

@Component({
  selector: 'app-approve-survey',
  templateUrl: './approve-survey.component.html',
  styleUrls: ['./approve-survey.component.css']
})
export class ApproveSurveyComponent implements OnInit {
  approveSuccess : boolean = false;
  landRecords : LandRecord[];
  approvedRecords : LandRecord[];
  wardNo : number;
  fetchComplete : boolean = false;
  noSearchResults : boolean = false;
  approveAction : boolean = false;
  blockExplorerURL: string;
  
  constructor(private manageLandRecordsService : ManageLandRecordsService, private surveyDataService : SurveyDataService) {
   }

  ngOnInit() {
    this.surveyDataService.currentLandRecords.subscribe(records => {
      this.landRecords = records;
      if(this.landRecords!=null && this.landRecords.length > 0){
        this.fetchComplete = true;
        this.noSearchResults= false;
      }
    });
  }

  onSubmit(){
    console.log("ApplicationData" + JSON.stringify(this.landRecords));
    this.approveAction = true;
    //To add records to block chain
    this.approvedRecords =  this.landRecords.filter(
    (rec) => rec.isMojaniApproved);
    this.manageLandRecordsService.updateMojaniApprovedRecords(this.approvedRecords)
    .subscribe(
      response => {
        console.log("res received updateLandrecordMojani service" + JSON.stringify(response));
        if (response !=null && response.success) {
          this.approveSuccess = true; 
          this.blockExplorerURL = "https://blockdatalandrecord.mybluemix.net/";
        }   
      });
    
  }

  onReject(){
    this.approveAction = false;
    console.log("ApplicationData" + JSON.stringify(this.landRecords));
    this.approvedRecords =  this.landRecords.filter(
    (rec) => rec.isMojaniApproved);

    this.approvedRecords.forEach(
    (record,index) => {
        record.isMojaniRejected = true;
        record.isMojaniApproved= false;
    });
    this.manageLandRecordsService.updateMojaniApprovedRecords(this.approvedRecords)
    .subscribe(
      response => {
        console.log("res received updateLandrecordMojani service" + JSON.stringify(response));
        if (response !=null && response.success) {
          this.approveSuccess = true; 
        }   
      });
    
  }
  

  submitNew(){
        this.landRecords = [];
        this.approveSuccess= false;
        this.wardNo = null;
        this.fetchComplete = false;
  }

  search(){
    console.log("ward No :" + this.wardNo);
    this.manageLandRecordsService.getLandRecordsMojaniByWard(this.wardNo)
    .subscribe(
      response => {
            console.log("res received from getLandRecords service" + JSON.stringify(response));
            if (response !=null) {
              //  this.router.navigate(['/success', this.landRecord.pid]);
              this.landRecords = <LandRecord[]> response.landRecords.filter(landRec => !landRec.isMojaniApproved);
             if(this.landRecords!=null && this.landRecords.length > 0){
               this.noSearchResults= false;
             }else{
               this.noSearchResults = true;
             }
              this.fetchComplete = true;     
              this.surveyDataService.updateLandRecords(this.landRecords);
            }
          });
  }


}



