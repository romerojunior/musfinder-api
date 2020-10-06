import { Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { Collections, Statuses } from '../../common/constants';
import * as firebase from 'firebase-admin';


@Injectable()
export class FriendshipService {
  constructor(private readonly usersService: UsersService) {}
  private fs = firebase.firestore();

  async invite(fromUserGUID: string, toUserGUID: string): Promise<string> {
    // verify if users exist
    await this.usersService.get(fromUserGUID);
    await this.usersService.get(toUserGUID);

    // create a friendship
    const friendship: any = await this.fs.collection(Collections.FRIENDS).add({
      status: Statuses.PENDING
    })

    // add a friendship to users
    await this.fs.collection(Collections.USERS)
      .doc(fromUserGUID)
      .collection('friends')
      .doc(friendship.id)
      .set({});

      // add a friendship to users
    await this.fs.collection(Collections.USERS)
      .doc(fromUserGUID)
      .collection('friends')
      .doc(friendship.id)
      .set({});

    return friendship.id
  }

  async acceptInvite(friendshipGUID: string): Promise<void> {
   await this.fs.collection(Collections.FRIENDS).doc(friendshipGUID).update(
     {
       status: Statuses.ACCEPTED
     }
   )
  }

  async declineInvite(friendshipGUID: string): Promise<void> {
    await this.fs.collection(Collections.FRIENDS).doc(friendshipGUID).update(
      {
        status: Statuses.DECLINED
      }
    )
  }

  async get(friendshipGUID: string): Promise<any> {
    return (await this.fs.collection(Collections.FRIENDS).doc(friendshipGUID).get()).data()
  }

}
