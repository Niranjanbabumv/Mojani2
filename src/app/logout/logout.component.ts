import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

import {LoginAuthenticationService } from '../services/login-authentication.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})

export class LogoutComponent implements OnInit{
    loggedInUser : string;
    userRole : string;

    constructor(private authService: LoginAuthenticationService, private router: Router) {}
    ngOnInit() {
      this.loggedInUser =this.authService.getLoggedInUser();
      this.userRole = this.authService.getLoggedInRole();
    }
    
    
    logout() { 
      //redirect to login screen after logout
      this.authService.logoutUser();
      this.router.navigateByUrl('/Login');
    }

}
