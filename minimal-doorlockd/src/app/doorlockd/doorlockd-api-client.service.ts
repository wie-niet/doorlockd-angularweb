import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { Observable, throwError, observable } from 'rxjs';
import { catchError,tap, timeout } from 'rxjs/operators';

import { iTag,iUser,iUnknownTag,iObjType, iChangelog, AuthResp,iHardwareItem } from './interfaces';

import { JwtHelperService } from "@auth0/angular-jwt";
import { analyzeFileForInjectables, NullTemplateVisitor } from '@angular/compiler';


@Injectable({
  providedIn: 'root'
})
export class DoorlockdApiClientService {
  private jwt_helper = new JwtHelperService();
  public loggedInUsername = null;
  public loggedInUid = null;
  private tokenRefreshEvent = null;

  public offset_sec_servertime = 0;

  // public apiServer = "http://localhost:8000/api";
  // public apiServer = "http://192.168.7.2:8000/api";
  public apiServer = "/api";

  public httpOptions = {
    // observe: 'response',
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  }
  
  
  constructor(private httpClient: HttpClient) {
    // restoring runtime variables and token_refresh events
    if (this.loggedIn) {
      console.log('welcome back', this);
      
      // read offset_sec_servertime from storage
      this.offset_sec_servertime = +localStorage.getItem('offset_sec_servertime');

      // restart schedule Refresher:
      this.scheduleRefreshEvent();
      this.getLoggedInUsername();  
    }
   }
  
    get access_token() {
      // gettter for JWT token
      return localStorage.getItem('access_token');
    }
    set access_token(token) {
      // settter for JWT token
      if (token !== null) {
        // update/set Authorization header 
        localStorage.setItem('access_token', token);
        // calculate servertime offset in seconds:
        let decodedToken = this.jwt_helper.decodeToken(token);
        let offset_sec = decodedToken.iat - Math.floor(Date.now() / 1000);
        localStorage.setItem('offset_sec_servertime',  offset_sec.toString()) ;
        this.offset_sec_servertime = offset_sec
      } else {
        // remove Authorization header 
        localStorage.removeItem('access_token');
      }
    }

    login(email_password, schedule_refresh=true) {
      // email:string, password:string
      return this.httpClient.post<AuthResp>(this.apiServer + '/login/', JSON.stringify(email_password), this.httpOptions)
      .pipe(tap(res => {
        if (res.status) {
          // localStorage.setItem('access_token', res.token);
          this.access_token = res.token;
          this.scheduleRefreshEvent(schedule_refresh);
          this.getLoggedInUsername(email_password.email);

        } else {
          // this.errorHandler(res)
          console.log("Something went wrong", res)
          return throwError(res);
        }
      }))

    }
    scheduleRefreshEvent(schedule_refresh=true) {
      if (!schedule_refresh) {
        // do nothing
        console.log('scheduleRefreshEvent() done nothing.');
        return(false);
      }

      /* schedul an timeout event to request a new token */
      let access_token:string = this.access_token;
      let decodedToken = this.jwt_helper.decodeToken(access_token);

      // schedule 60 seconds before exp date - issue date 
      // let s = decodedToken.exp - decodedToken.iat - 60;
      let offset:number  = +localStorage.getItem('offset_sec_servertime');
      let s = decodedToken.exp - Math.floor(Date.now() / 1000) - offset - 60; // 60sec before exp.
      // include server time offset:

      console.log('schedule refresh in secs:', s);

      this.tokenRefreshEvent = setTimeout(function() {
        console.log('let\'s run refresh_token....');
        this.refresh_token(schedule_refresh).subscribe(
          console.log('token refreshed...'));
      }.bind(this), s * 1000);
  
    }

    refresh_token(schedule_refresh=true) {
      console.log(' refresh token', schedule_refresh);
      return this.httpClient.post<AuthResp>(this.apiServer + '/refresh_token/', JSON.stringify({'iets': 'niets'}), this.httpOptions)
      .pipe(tap(res => {
        if (res.status) {

          // localStorage.setItem('access_token', res.token);
          this.access_token = res.token;
          this.scheduleRefreshEvent(schedule_refresh);
          this.getLoggedInUsername(null, true); // force refresh
        } else {
          console.log("Something went wrong with refreshing token, you will be logged out!")
          this.errorHandler(res);
          // localStorage.removeItem('access_token');
          this.access_token = null;
        }

      }))
    }
    logout() {
      localStorage.removeItem('access_token');
      this.getLoggedInUsername();

      // cancel refresh token event
      clearTimeout(this.tokenRefreshEvent);

      // clear server time offset warning:
      this.offset_sec_servertime = 0;
      localStorage.removeItem('offset_sec_servertime');

    }
        
    public get loggedIn(): boolean{
      let access_token:string = this.access_token;

      if(access_token == null) {
        return false;
      }

      // // disabled when server time is out of sync/ timeerror
      // return !this.jwt_helper.isTokenExpired(access_token);
      let offset_sec:number = + localStorage.getItem('offset_sec_servertime');


      try {
        // catch malformed + expired tokens
        if (this.jwt_helper.isTokenExpired(access_token, offset_sec)) {
          throw new Error('token expired')
        } else {
          // logged on ok:
          return(true)
        }
      } catch (error) {
        console.log('access_token:' + error)

        // time to cleanup the token and other info
        this.logout()
        // is not loggedIn
        return(false)
      }
    }
    
    getLoggedInUsername(setuser = null, force_refresh=false) {
      let access_token:string = localStorage.getItem('access_token');
      if(access_token == null) {
        this.loggedInUsername = null;
        this.loggedInUid = null;
      } else {
        let decodedToken = this.jwt_helper.decodeToken(access_token);
        this.loggedInUid = decodedToken.uid;
        console.log('in loggedInUsername : decodedToken.uid :', decodedToken.uid );

      if(!force_refresh) {
        // incase we are just logging in
        if(setuser != null ) {
          this.loggedInUsername = setuser;
          return;
        }

        // incase we have stored the username
        if(this.remember_me_name) {
          this.loggedInUsername = this.remember_me_name;
          return;
        }
      }

        // decodedToken.uid
        this.getUserById(decodedToken.uid ).subscribe((user: iUser)=>{
          this.loggedInUsername = user.email;

          // store remember_me_name if remember_me is set to true
          if(this.remember_me) {
            this.remember_me_name = this.loggedInUsername;
          }
        
        });
      }





    }

    /*
    boolean for "remember me" option on login screen.
    this feature will remember only the login/email name.

    it will either store noting|false or some username/email.
    */
    public get remember_me(): boolean {
      return localStorage.getItem('remember_me') !== null;
    }    

    public set remember_me(remember_me: boolean) {
      if (!remember_me) {
        // remove all data from localStorage 
        localStorage.removeItem('remember_me')
        localStorage.removeItem('remember_me_name')
      } else {
        // set to true, unless a username is already available
        let username = this.loggedInUsername !== null ? this.loggedInUsername : true;
        localStorage.setItem('remember_me', username)
      }

    }

    public get remember_me_name(): string {
      return localStorage.getItem('remember_me_name');
    }

    public set remember_me_name(username: string) {
      localStorage.setItem('remember_me_name', username);
    }

    public get tokenInfo(): object {
      let ti = {} as any;
      let access_token:string = localStorage.getItem('access_token');
      
      ti.logged_in = this.loggedIn;
      ti.decodedToken = this.jwt_helper.decodeToken(access_token);
      ti.isTokenExpired = this.jwt_helper.isTokenExpired(access_token);

      ti.user = this.loggedInUsername;

      ti.refresh_event = this.tokenRefreshEvent;
      return ti;
    }
    
    create(objType:iObjType, item): Observable<iTag|iUser|iUnknownTag> {
      return this.httpClient.post<iTag|iUser|iUnknownTag>(this.apiServer +'/'+ objType +'/', JSON.stringify(item), this.httpOptions)
      .pipe(
        catchError(this.errorHandler)
      )
    }  
    getUserById(id): Observable<iUser> {
      return this.httpClient.get<iUser>(this.apiServer + '/users/' + id)
      .pipe(
        catchError(this.errorHandler)
      )
    }

    getById(objType:iObjType,id): Observable<iTag|iUser|iUnknownTag> {
      return this.httpClient.get<iTag|iUser|iUnknownTag>(this.apiServer + '/'+ objType +'/' + id)
      .pipe(
        catchError(this.errorHandler)
      )
    }

    getAll(objType:iObjType): Observable<iTag|iUser|iUnknownTag[]> {
      console.log("this.httpOptions: ", this.httpOptions);
      return this.httpClient.get<iTag|iUser|iUnknownTag[]>(this.apiServer +'/'+ objType +'/', this.httpOptions)
      .pipe(
        catchError(this.errorHandler)
      )
    }

    update(objType:iObjType,id, item): Observable<iTag|iUser|iUnknownTag> {
      return this.httpClient.put<iTag|iUser|iUnknownTag>(this.apiServer +'/'+ objType +'/'+ id, JSON.stringify(item), this.httpOptions)
      .pipe(
        catchError(this.errorHandler)
      )
    }

    delete(objType:iObjType, id){
      return this.httpClient.delete<iTag|iUser|iUnknownTag>(this.apiServer +'/'+ objType +'/'+ id, this.httpOptions)
      .pipe(
        catchError(this.errorHandler)
        
      )
    }

    getChangelogs(objType:iObjType, id) {
      return this.httpClient.get<iChangelog[]>(this.apiServer +'/changelogs/'+ objType +'/'+ id +'/') 
      .pipe(
        catchError(this.errorHandler)
      )

    }

    getHwByID(id): Observable<iHardwareItem> {
      let objType = 'hw';
      return this.httpClient.get<iHardwareItem>(this.apiServer + '/'+ objType +'/' + id)
      .pipe(
        catchError(this.errorHandler)
      )
    }

    updateHwByID(id, item): Observable<iHardwareItem> {
      let objType = 'hw';
      return this.httpClient.put<iHardwareItem>(this.apiServer +'/'+ objType +'/'+ id, JSON.stringify(item), this.httpOptions)
      .pipe(
        catchError(this.errorHandler)
      )
    }

    errorHandler(error) {
      console.log('errorHandler: ' + error);

       let errorMessage = '';
       if(error.error instanceof ErrorEvent) {
         // Get client-side error
         errorMessage = error.error.message;
         console.log('error here 1')
       } else {
         // Get server-side error
         errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
         console.log('error object: ' , error);
         console.log('error here 2')

        if (error.status == 0) {
          console.log('asume it is an DELETE HTTP 204 response bug...  ');
          // window.alert("Likely you ran into an HTTP 204 response in safari.., refresh page to solve.\n");
          // TODO , return something so it looks like no error has happened
          return throwError(error);
        }

        // if validation error:
        else if (error.error.type == "validation") {
          console.log("Validation error: " + error.error.message);
          // window.alert("Validation error,\n" + error.error.message);
          return throwError(error);
        }          
        // if access denied error:
        else if (error.error.error == "access denied") {
          console.log("Access Denied: " + error.error.message);
          // window.alert("Access Denied:,\n" + error.error.message);
        }          
         // if something is wrong with our auth token:
        else if (error.error.error == "token error") {
          console.log('your token is broken, re-login please...');
          window.alert('your token is broken, re-login please...');
          // loggin out
          let doorlockClientService = new DoorlockdApiClientService(null);
          doorlockClientService.logout();
          // quick fix when above doesn't work
          localStorage.removeItem('access_token');

        } else {
          window.alert("Some error,\n" + errorMessage);
          // 
        }
        return throwError(error);


       }
      //  console.log(response.status);
       console.log(errorMessage);
       return throwError(errorMessage);
    }
  
}
