import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/delay';

import { CognitoUtil } from './cognito.service';

@Injectable()
export class ApigwService {
  constructor(public httpClient: HttpClient, private cognitoUtil: CognitoUtil) {}

  // upon a Rest Request, we need to get our cognito stuff
  // build a request object
  // then do a get or post to the api endpoint

  public restRequest(options, body) {

    console.log('Body Params' + JSON.stringify(body));
    console.log('Options Params' + JSON.stringify(options));

    //   var pathArray = requestParams.url.split('/');
    //   var host = pathArray[2];
    //   var path = pathArray.slice(3).join('/');
    //   path = '/' + path;
    //   requestParams.host = host;
    //   requestParams.path = path;
    const httpClient = this.httpClient;
    const cognitoUser = this.cognitoUtil.getCurrentUser();

    if (cognitoUser != null) {
      console.log('cognito user not null');
      cognitoUser.getSession(function (err, session) {
        if (err) {
          console.log('UserParametersService: Couldnt retrieve the user');
        } else {

          // this should be good for 1 hour and repeated calls will get a new token automatically behind the scenes
          const idToken = session.getIdToken().getJwtToken();
          console.log(JSON.stringify(idToken));

          if (options.method === 'GET') {
            httpClient
              .get(options.url, {
                headers: new HttpHeaders().set('Authorization', idToken),
              })
              .subscribe();
          } else {
            httpClient
              .post(options.url, body, {
                headers: new HttpHeaders().set('Authorization', idToken),
              })
              .subscribe();
          }

          // ok, we are ready to make our call as long as we have an idToken




//            var creds = this.cognitoUtil.buildCognitoCreds(idToken);

          /*          session.getIdToken().getJwtToken(function (err, result) {
           if (err) {
           console.log('UserParametersService: in getParameters: ' + err);
           } else {
           //              callback.callbackWithParam(result);
           console.log('Cognito User Results:' + JSON.stringify(result));
           }
           });
           */
        }

      });
    } else {
//      callback.callbackWithParam(null);
      console.log('Cognito User Null');
    }
    /*
     for (let i = 0; i < result.length; i++) {
     let parameter = new Parameters();
     parameter.name = result[i].getName();
     parameter.value = result[i].getValue();
     this.me.parameters.push(parameter);
     }
     let param = new Parameters()
     param.name = "cognito ID";
     param.value = this.cognitoUtil.getCognitoIdentity();
     this.me.parameters.push(param)


     if (sessionStorage.getItem('awsCredentials') != null) {
     const awsCredentials = JSON.parse(sessionStorage.getItem('awsCredentials'));

     let signedRequest = aws4.sign(requestParams,
     {
     secretAccessKey: awsCredentials.secretAccessKey,
     accessKeyId: awsCredentials.accessKeyId,
     sessionToken: awsCredentials.sessionToken
     });

     delete signedRequest.headers['Host'];
     delete signedRequest.headers['Content-Length'];

     console.log(signedRequest);



     signedRequest.data = signedRequest.body;
     */

    /*
     return axios(signedRequest)
     .then((response) => {
     return response.data;
     })
     .catch(function (error) {
     console.log(error);
     throw error;
     });

     } else {

     let unsignedRequest = requestParams.url;
     if(requestParams.method == 'GET') {
     return axios.get(unsignedRequest);
     }
     else if(requestParams.method == 'POST') {
     return axios.post(unsignedRequest);
     }


     }
     */
  }

}



/*
 checkProjectNotTaken(project: string) {
 // Need to add the ability to debounce so not too many calls are made
 // tested this and it does not work now, not sure what the issue is, but could be
 // that I am not returning an observable - need to understand rxjs better.
 // .debounceTime(500).distinctUntilChanged().first()

 return this.http
 .get('assets/accounts.json')
 .delay(1000)
 .map(res => res.json())
 .map(accounts => accounts.filter(account => account.Project === project))
 .map(users => !users.length);
 }
 */


