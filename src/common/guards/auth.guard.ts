import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import { apiHeaders } from '../contants';
import { isEmpty, replace } from 'lodash';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest(request: any): Promise<boolean> {
    const authorizationHeader = request.get('Authorization');
    if (isEmpty(authorizationHeader)) {
      return false;
    }

    const token = replace(authorizationHeader ?? '', 'Bearer ', '');

    try {
      const decodedIdToken = await firebase.auth().verifyIdToken(token);
      request.headers[apiHeaders.X_MUSFINDER_USER_ID] = decodedIdToken.user_id;
      return true;
    } catch (err) {
      console.log(err.message);
    }

    return false;
  }
}