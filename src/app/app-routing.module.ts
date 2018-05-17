import {LayoutApplicationComponent  } from './layout-application/layout-application.component';
import {SubmitLayoutSurveyComponent} from "./submit-layout-survey/submit-layout-survey.component";
import {ApproveSurveyComponent} from "./approve-survey/approve-survey.component";
import {LoginComponent} from "./login/login.component";
import {NgModule } from '@angular/core';
import {Routes, RouterModule } from '@angular/router';
import {ViewlandrecordComponent } from './view-land-record/view-land-record.component';
import {AuthGuard} from './guards/auth-guard';

const routes: Routes = [
  { path: 'submitLayoutSurvey', component: SubmitLayoutSurveyComponent,canActivate: [AuthGuard] },
  { path: 'layoutApplication', component: LayoutApplicationComponent,canActivate: [AuthGuard] },
  { path: 'layoutApplication/:id', component: LayoutApplicationComponent,canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'approveSurveys', component: ApproveSurveyComponent,canActivate: [AuthGuard] },
  { path: 'viewLandRecord/:id', component: ViewlandrecordComponent,canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login',pathMatch:'full'},
  { path: '**', pathMatch:'full', redirectTo: '/login'}
] 

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})


export class AppRoutingModule { }
