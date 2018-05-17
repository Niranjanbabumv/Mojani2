import { Component, OnInit,Input } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-gmaps',
  templateUrl: './agmaps.component.html',
  styleUrls: ['./agmaps.component.css']
})
export class GmapsComponent implements OnInit {
  @Input() lat:number;
  @Input() lng:number;
  constructor(){
  }
  ngOnInit() {
  }
}
