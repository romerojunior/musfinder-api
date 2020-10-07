import { Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { collections } from '../../common/constants';
import { Statuses } from '../../common/enums';
import { UpdateFriendshipDto, RequestFriendshipDto } from '../dto';
import * as firebase from 'firebase-admin';
import { each, union } from 'lodash';

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

    const createdAt: FirebaseFirestore.Timestamp = firebase.firestore.Timestamp.fromDate(new Date());
    const friendshipRef = this.fs.collection(collections.FRIENDSHIPS).doc();

    await friendshipRef.set({
        from: fromUserGUID,
        to: requestFriendshipDto.user,
        status: Statuses.REQUESTED,
        createdAt: createdAt,
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
    const updatedAt: FirebaseFirestore.Timestamp = firebase.firestore.Timestamp.fromDate(new Date());

    let status: Statuses;
    if (updateFriendshipDto.status == Statuses.ACCEPTED) { status = Statuses.ACCEPTED };
    if (updateFriendshipDto.status == Statuses.ACCEPTED) { status = Statuses.REJECTED };

    await this.fs.collection(collections.FRIENDSHIPS)
      .doc(friendshipGUID)
      .update({
        status: status,
        updatedAt: updatedAt,
      });
  }

  /**
   * The `get` method takes `friendshipGUID` as argument and returns an object
   * representing the friendship document.
   *
   * @param userGUID
   */
  async get(userGUID: string): Promise<any> {
    const friendshipsRef = this.fs.collection(collections.FRIENDSHIPS);

    const from = await friendshipsRef.where('from', '==', userGUID).get();
    const to = await friendshipsRef.where('to', '==', userGUID).get();

    const response: Array<any> = [];

    each(union(from.docs, to.docs), doc => {
      let data = doc.data();
      data.guid = doc.id;
      response.push(data);
    });

    return response;
  }

}
