import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import * as firebase from 'firebase-admin';
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
      request.token = await firebase.auth().verifyIdToken(token);
      return true;
    } catch (err) {
      console.log(err.message);
    }

    return false;
  }
}