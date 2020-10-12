import { Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { collections } from '../../common/constants';
import { Statuses } from '../../common/enums';
import { UpdateFriendshipDto, RequestFriendshipDto } from '../dto';
import * as firebase from 'firebase-admin';
import { each, union } from 'lodash';
import { Friendship } from '../models';

@Injectable()
export class UsersFriendshipService {
  constructor(private readonly usersService: UsersService) { }
  private fs = firebase.firestore();

  /**
   * The `request` method verifies if both users exist, if so, it will update the
   * collection with a representation of the association.
   *
   * @param fromUserGUID a string representing the GUID of a user.
   * @param toUserGUID a string representing the GUID of a user.
   *
   * @returns {string} a string representing the GUID of the new friendship.
   */
  async request(fromUserGUID: string, requestFriendshipDto: RequestFriendshipDto): Promise<void> {
    await this.usersService.get(fromUserGUID);
    await this.usersService.get(requestFriendshipDto.user);

    const now = firebase.firestore.Timestamp.fromDate(new Date());
    const friendshipRef = this.fs.collection(collections.FRIENDSHIPS).doc();

    await friendshipRef.set({
      from: fromUserGUID,
      to: requestFriendshipDto.user,
      status: Statuses.REQUESTED,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * The `update` method takes a task as argument and applies updates the state of an
   * existing association. It can either `Tasks.ACCEPT` or `Tasks.REJECT` an association.
   *
   * @param action a value from `Actions` enum.
   * @param friendshipGUID a string representing the GUID of a friendship.
   */
  async update(friendshipGUID: string, updateFriendshipDto: UpdateFriendshipDto): Promise<void> {
    const now = firebase.firestore.Timestamp.fromDate(new Date());

    let status: Statuses;
    if (updateFriendshipDto.status == Statuses.ACCEPTED) { status = Statuses.ACCEPTED };
    if (updateFriendshipDto.status == Statuses.ACCEPTED) { status = Statuses.REJECTED };

    await this.fs.collection(collections.FRIENDSHIPS)
      .doc(friendshipGUID)
      .update({
        status: status,
        updatedAt: now,
      });
  }

  /**
   * The `get` method takes `friendshipGUID` as argument and returns an object
   * representing the friendship document.
   *
   * @param userGUID
   */
  async get(userGUID: string): Promise<Friendship[]> {
    const friendshipsRef = this.fs.collection(collections.FRIENDSHIPS);

    const from = await friendshipsRef.where('from', '==', userGUID).get();
    const to = await friendshipsRef.where('to', '==', userGUID).get();

    const response: Array<Friendship> = [];

    each(union(from.docs, to.docs), doc => {
      const friendship: any = doc.data();
      const createdAt = <FirebaseFirestore.Timestamp>friendship.createdAt;
      const updatedAt = <FirebaseFirestore.Timestamp>friendship.updatedAt;
      response.push({
        createdAt: createdAt.toDate().toUTCString(),
        updatedAt: updatedAt.toDate().toUTCString(),
        guid: doc.id,
        to: friendship.to,
        from: friendship.from,
        status: friendship.status,
      })
    });

    return response;
  }

}
