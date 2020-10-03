import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as functions from 'firebase-functions';
import * as firebase from 'firebase-admin';
import * as constants from '../constants';
import { isEmpty, replace } from 'lodash';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest(request: any): Promise<boolean> {
    const authorizationHeader = request.get('Authorization');
    if (isEmpty(authorizationHeader)) {
      console.log('no authorization header');
      return;
    }

    const token = replace(authorizationHeader ?? '', 'Bearer ', '');
    functions.logger.info(`*** Token *** ${token}`);

    try {
      const decodedIdToken = await firebase.auth().verifyIdToken(token);
      request.headers[constants.HEADERS.X_MUSFINDER_USER_ID] = decodedIdToken.user_id;
      return true;
    } catch (err) {
      functions.logger.info(`Failed authentication...`);
      return true;
    }
  }
}