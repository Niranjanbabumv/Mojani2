import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import {LoginAuthenticationService } from '../services/login-authentication.service';
import { Router} from '@angular/router';
import { Form } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  login: any = {};
  loading = false;
  authMessage : string;

  constructor(private loginAuthService : LoginAuthenticationService, private router: Router) {}

  ngOnInit() {
   // document.body.classList.add("loginPage");
          document.body.style.backgroundImage = "url('/assets/images/survey-bg.jpg')";
          document.body.style.backgroundSize = "cover";
          document.getElementById("loginbox").classList.add("loginLabels");
          document.getElementById("headerTitle").classList.add("header");

  }

  ngOnDestroy() {
   // document.body.classList.remove("loginPage");
   document.body.removeAttribute("style");
  }
  onSubmit(userlogin : NgForm){
    if(userlogin.valid){
        this.loading = true; // validation in progress
        console.log("Form values :" + JSON.stringify(this.login));
        let user = {"userId" : this.login.username, "password" : this.login.password};
        //check for user authentication
        this.loginAuthService.isUserAuthenticated (user)
        .subscribe(
        authenticated => {
            this.loading=false;
            console.log("res received authentication service :" + authenticated);
            if (authenticated) {
              this.authMessage=null;
              //if auth success route according to the role
              console.log("logged in role :" + this.loginAuthService.getLoggedInRole());
              if(this.loginAuthService.getLoggedInRole() == "Mojani_Surveyor"){
                console.log("inside mojani survey");
                this.router.navigateByUrl('/submitLayoutSurvey');
              }
              else if(this.loginAuthService.getLoggedInRole() == "Mojani_Approver"){
                console.log("Inside mojani approver");
                this.router.navigateByUrl('/approveSurveys');
              }            
            }else{
                this.authMessage = this.loginAuthService.getAuthMessage();
            }
         });
     }
  }

}
