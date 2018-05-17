import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';

import { Http } from '@angular/http';
import { ActivatedRoute, Params , Router} from '@angular/router'; 
import { Location } from '@angular/common';
import { FileUploadService } from '../services/file-upload.service';
import { ManageLandRecordsService } from '../services/managelandrecords.service';
import { LandRecord } from '../models/LandRecord';


@Component({
  selector: 'app-layout-application',
  templateUrl: './layout-application.component.html',
  styleUrls: ['./layout-application.component.css']
})
export class LayoutApplicationComponent implements OnInit {
  private layoutForm: FormGroup;
  private landRecord: LandRecord = new LandRecord(); //initialize land record object
  private submitSuccess: boolean = false;
  private lat :number;
  private long : number; 
  private filesToUpload: Array<File> = [];
  private formData: FormData = new FormData();
  private sub : any;

  constructor(private formBuilder: FormBuilder, private manageLandRecordsService: ManageLandRecordsService,
    private http: Http, private filUploadService: FileUploadService, private router : Router, 
    private route : ActivatedRoute, private location : Location) { }

  ngOnInit() {
    this.createForm();
  }
  
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  createForm() {
    this.submitSuccess = false;
    this.lat=null;
    this.long = null;
    this.layoutForm = this.formBuilder.group({
      pid: [''],
      wardNo: [null, Validators.required],
      areaCode: [null, Validators.required],
      siteNo: [null, Validators.required],
      geoData: this.formBuilder.group({
          latitude: [null, Validators.required],
          longitude: [null, Validators.required],
          length: [null, Validators.required],
          width: [null, Validators.required],
          totalArea: '',
          address: [null, Validators.required]
      }),
      ownerDetails: this.formBuilder.group({
          ownerName: [null, Validators.required],
          gender: [null, Validators.required],
          aadharNo: [null, Validators.required],
          mobileNo: [null, Validators.required],
          emailID: [null, Validators.required],
          address: [null, Validators.required]
      })
    });
    
    
   this.sub =this.route.queryParams.subscribe(params => {
            let pid = +params['pid'] || 0; // + converts string pid to number
            this.manageLandRecordsService.getLandRecordsMojaniByPid(pid).subscribe(response => {
                  console.log("res received getLandRecordbyPid service" + JSON.stringify(response));
                  //parse the reponse for already existing record
                  if (response !=null && response.success && response.landRecords) {
                    this.landRecord =<LandRecord> response.landRecords; 
                    console.log("landRecord object received:" + this.landRecord);
                    this.layoutForm.patchValue(this.landRecord); //set the form model object from data model object
                    this.setGeoCordinates();
                  }
            }); 
        }); 
  }

  isFieldValid(field: string) {
    return !this.layoutForm.get(field).valid && this.layoutForm.get(field).touched;
  }

  displayFieldCss(field: string) {
    return {
      'has-error': this.isFieldValid(field),
      'has-feedback': this.isFieldValid(field)
    };
  }


  setGeoCordinates(){
        this.lat = parseFloat(this.layoutForm.get('geoData.latitude').value);
        this.long =parseFloat( this.layoutForm.get('geoData.longitude').value);
  }
  calculateTotalArea(){
        let length =  parseFloat(this.layoutForm.get('geoData.length').value);
        let width =  parseFloat(this.layoutForm.get('geoData.width').value);
        let totalArea = length * width ; 
        if(!isNaN(totalArea)){
          console.log("Total Area: " + totalArea);
        this.layoutForm.patchValue({'geoData' : {'totalArea' : totalArea}});
        }
  }
  
  onSubmit() {
    if (this.layoutForm.valid) {
      console.log('form valid success');
      //sync the form model with the data model
      this.landRecord = <LandRecord>this.layoutForm.value;
      this.landRecord.pid =parseInt(this.landRecord.wardNo.toString().substr(0, 3) + this.landRecord.areaCode.toString().substr(0, 3) + this.landRecord.siteNo.toString().substr(0, 3));
      console.log("pid generated: " + this.landRecord.pid);
      this.landRecord.isMojaniSubmitted = true; // make the submitted flag as true
      this.manageLandRecordsService.updateMojaniSubmitRecord(this.landRecord)
      .subscribe(
        response => {
          console.log("res received updateLandRecord service" + JSON.stringify(response));
            if (response !=null && response.success) {
              let files: Array<File> = this.filesToUpload;
              if (files.length > 0) {
                let file: File = files[0];//construct file name before upload
                let fileName = file['name'].split(".")[0] + "_" + this.landRecord.pid +"."+ file['name'].split(".")[1];
                this.formData.append("uploads[]",file, fileName);
                console.log("file name :" + file['name']);
                //Upload the files to server
                this.filUploadService.uploadFiles(this.formData)
                    .subscribe(files => console.log('files uploaded :' + files));
                  this.submitSuccess = true;
              }
            }
        });
    } else {
      this.validateAllFormFields(this.layoutForm);
    }
  }

  goBack() {

     this.location.back();
  }

  fileChange(event) { 
   this.filesToUpload= <Array<File>>event.target.files;
  }

  submitNew() {
    this.createForm();
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      console.log(field);
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
}
