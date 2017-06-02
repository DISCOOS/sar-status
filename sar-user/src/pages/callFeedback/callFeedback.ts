import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Mission,  MissionResponse, Alarm, SARUser, Tracking } from '../../models/models';
import { SARService } from '../../services/sar.service';
import { Alarms } from '../alarms/alarms';
import { TabsPage } from '../tabs/tabs';
import { Login } from '../login/login';
import { AuthService } from '../../services/auth.service';
import { GeoService } from '../../services/geo.service';
import { ExceptionService } from '../../services/exception.service';

@Component({
  selector: 'page-callFeedback',
  templateUrl: 'callFeedback.html'
})

export class CallFeedback {
    feedbackType: boolean;
    missionResponse: MissionResponse;
    missionId: number;
    alarmId: number;
    arrival: string;
    tracking: Tracking;
    alarm: Alarm;
    user: SARUser;

  constructor(public navCtrl: NavController, public SARService: SARService, public params:NavParams, private AuthService: AuthService, public GeoService: GeoService, private ExceptionService: ExceptionService) {   
    this.feedbackType = params.get("feedbackType");
    this.missionId = params.get("missionId");
    this.alarmId = params.get("alarmId");

    if(!this.feedbackType) {
      this.submit();
    }
  }

  /**
   * Formats data from form and creates MissionRespons-object to be persisted to database.
   * @param type user input for type of response true/false
   */

  submit() { 
    console.log("hit før geo");

    this.user = this.SARService.getUser();
    let input = this.arrival;
    this.user.isTrackable = true; // Må bort
 
    let missionResponse = new MissionResponse(this.alarm, this.user, this.feedbackType, 10, input, null);

    if(this.feedbackType && this.user.isTrackable) {
      console.log("hit geo");
      this.GeoService.startTracking(missionResponse);
    }

    console.log("hit etter geo");
    this.SARService.postMissionResponse(missionResponse)
      .subscribe( res => {
        this.navCtrl.push(Alarms)
          .catch((error) => {
            console.log(error);
            this.ExceptionService.expiredSessionError();
            this.navCtrl.setRoot(Login);
          }); // end catch
      }, (error) => {
        this.navCtrl.push(Alarms);
      }); // end subscribe 
  }

  backButton() {
    this.navCtrl.push(TabsPage)
      .catch((error) => {
        this.ExceptionService.expiredSessionError();
        this.navCtrl.setRoot(Login);
      });
  }



  /**
   * Method for validating user input from form
   * @param input string with raw user input
   * @return escaped string
   */

  private validateInput(input: string) {
    return encodeURI(input);  
  }
  
  ionViewCanEnter() {
    return this.AuthService.isLoggedIn();
  }

  ionViewDidLoad() {
    this.SARService.getAlarm(this.alarmId)
      .subscribe(
        data => { this.alarm = data; }, 
        error => { this.navCtrl.setRoot(TabsPage); })
  }
}
