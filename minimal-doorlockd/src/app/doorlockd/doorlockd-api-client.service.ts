import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { Observable, throwError, observable } from 'rxjs';
import { catchError,tap, timeout } from 'rxjs/operators';

import { iTag,iUser,iUnknownTag,iObjType, iChangelog, AuthResp } from './interfaces';

import { JwtHelperService } from "@auth0/angular-jwt";
import { NullTemplateVisitor } from '@angular/compiler';



@Injectable({
  providedIn: 'root'
})
export class DoorlockdApiClientService {
  private jwt_helper = new JwtHelperService();
  public loggedInUsername = null;
  private tokenRefreshEvent = null;

  
  private apiServer = "http://192.168.7.2:8000/api";
  httpOptions = {
    // observe: 'response',
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
    }
  
  
  constructor(private httpClient: HttpClient) {
    // restoring runtime variables and token_refresh events
    if (this.loggedIn) {
      console.log('welcome back', this);
      this.scheduleRefreshEvent();
      this.getLoggedInUsername();  
    }
   }
  
    login(email_password, schedule_refresh=true) {
      // email:string, password:string
      return this.httpClient.post<AuthResp>(this.apiServer + '/login/', JSON.stringify(email_password), this.httpOptions)
      .pipe(tap(res => {
        if (res.status) {
          localStorage.setItem('access_token', res.token);
          this.scheduleRefreshEvent(schedule_refresh);
          this.getLoggedInUsername();

        } else {
          this.errorHandler(res)
        }
        
      }))
    }
    scheduleRefreshEvent(schedule_refresh=true) {
      if (!schedule_refresh) {
        // do nothing
        return(false);
      }

      /* schedul an timeout event to request a new token */
      let access_token:string = localStorage.getItem('access_token');
      let decodedToken = this.jwt_helper.decodeToken(access_token);

      // schedule 60 seconds before exp date - issue date 
      let s = decodedToken.exp - decodedToken.iat - 60;

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

          localStorage.setItem('access_token', res.token);
          this.scheduleRefreshEvent(schedule_refresh);
          this.getLoggedInUsername();
        } else {
          this.errorHandler(res)
        }

      }))
    }
    logout() {
      localStorage.removeItem('access_token');
      this.getLoggedInUsername();

      // cancel refresh token event
      clearTimeout(this.tokenRefreshEvent);
    }
        
    public get loggedIn(): boolean{
      let access_token:string = localStorage.getItem('access_token');

      if(access_token == null) {
        return false;
      }

      return !this.jwt_helper.isTokenExpired(access_token);
    }
    
    getLoggedInUsername() {
      let access_token:string = localStorage.getItem('access_token');
      if(access_token == null) {
        this.loggedInUsername = null;
      }

      let decodedToken = this.jwt_helper.decodeToken(access_token);
      console.log('in loggedInUsername : decodedToken.uid :', decodedToken.uid);


      // decodedToken.uid
       this.getUserById(decodedToken.uid ).subscribe((user: iUser)=>{
        this.loggedInUsername = user.email;

        // store remember_me_name if remember_me is set to true
        if(this.remember_me) {
          this.remember_me_name = this.loggedInUsername;
        }
        
      });


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
      } else {
        // set to true, unless a username is already available
        let username = this.loggedInUsername !== null ? this.loggedInUsername : true;
        localStorage.setItem('remember_me', username)
      }

    }

    public get remember_me_name(): string {
      return localStorage.getItem('remember_me');
    }

    public set remember_me_name(username: string) {
      localStorage.setItem('remember_me', username);
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
      return this.httpClient.get<iTag|iUser|iUnknownTag[]>(this.apiServer +'/'+ objType +'/')
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

    formDelete(objType:iObjType,item_id) {
      if(confirm('Do you really want to delete this Tag?')) {
        this.delete(objType, item_id).subscribe(
        )  
      }
    }

    errorHandler(error) {
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
          window.alert("Likely you ran into an HTTP 204 response in safari.., refresh page to solve.\n");
          // TODO , return something so it looks like no error has happened
          // return throwError(error);
        }

        // if validation error:
        else if (error.error.type == "validation") {
          console.log("Validation error: " + error.error.message);
          window.alert("Validation error,\n" + error.error.message);
        }          
         // if something is wrong with our auth token:
        else if (error.error.error == "token error") {
          console.log('your token is broken, re-login please...');
          window.alert('your token is broken, re-login please...');
          // loggin out
          let doorlockClientService = new DoorlockdApiClientService(null);
          doorlockClientService.logout();

        } else {
          window.alert("Some error,\n" + errorMessage);
          // 
        }


       }
      //  console.log(response.status);
       console.log(errorMessage);
       return throwError(errorMessage);
    }
  
}
