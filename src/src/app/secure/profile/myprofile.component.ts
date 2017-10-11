import {Component} from '@angular/core';
import {UserLoginService} from '../../service/user-login.service';
import {Callback, CognitoUtil, LoggedInCallback} from '../../service/cognito.service';
import {UserParametersService} from '../../service/user-parameters.service';
import {Router} from '@angular/router';

import { ApigwService } from '../../service/apigw.service';

@Component({
    selector: 'awscognito-angular2-app',
    templateUrl: './myprofile.html'
})
export class MyProfileComponent implements LoggedInCallback {

    public parameters: Array<Parameters> = [];
    public cognitoId: String;

    constructor(public router: Router, public userService: UserLoginService, public userParams: UserParametersService, public cognitoUtil: CognitoUtil, public apigw: ApigwService) {
        this.userService.isAuthenticated(this);
        console.log('In MyProfileComponent');
    }

    isLoggedIn(message: string, isLoggedIn: boolean) {
        if (!isLoggedIn) {
            this.router.navigate(['/home/login']);
        } else {
            this.userParams.getParameters(new GetParametersCallback(this, this.cognitoUtil));
        }
    }

    onSubmit() {
      var options = {
        url: 'https://yqqd1uhx47.execute-api.us-east-1.amazonaws.com/dev/demo/',
        method: 'GET'
      };
      /*
      var options = {
        url: 'https://5k1rpevt6g.execute-api.us-east-1.amazonaws.com/dev/accounts',
        method: 'GET'
      };
      */
      var value = "";

      this.apigw.restRequest(options, value);

    }

}

export class Parameters {
    name: string;
    value: string;
}

export class GetParametersCallback implements Callback {

    constructor(public me: MyProfileComponent, public cognitoUtil: CognitoUtil) {

    }

    callback() {

    }

    callbackWithParam(result: any) {

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
    }
}
