import { Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { collections } from '../../common/constants';
import { Statuses, Tasks } from '../../common/enums';
import * as firebase from 'firebase-admin';


@Injectable()
export class UsersAssociationService {
  constructor(private readonly usersService: UsersService) { }
  private fs = firebase.firestore();

  /**
   * The `update` method takes a task as argument and applies updates the state of an
   * existing association. It can either `Tasks.ACCEPT` or `Tasks.REJECT` an association.
   *
   * @param task A value from `Tasks` enum.
   * @param starUserGUID A string representing the GUID of a user.
   * @param endUserGUID A string representing the GUID of a user.
   */
  async update(task: Tasks, fromUserGUID: string, toUserGUID: string): Promise<void> {
    await this.usersService.get(fromUserGUID);
    await this.usersService.get(toUserGUID);

    const updatedAt: FirebaseFirestore.Timestamp = firebase.firestore.Timestamp.fromDate(new Date());

    let status: Statuses;
    if (task == Tasks.ACCEPT) { status = Statuses.ACCEPTED };
    if (task == Tasks.REJECT) { status = Statuses.REJECTED };

    await this.fs.collection(collections.USERS)
      .doc(fromUserGUID)
      .collection(collections.ASSOCIATIONS)
      .doc(toUserGUID).update({
        updatedAt: updatedAt,
        status: status,
      });

    await this.fs.collection(collections.USERS)
      .doc(fromUserGUID)
      .collection(collections.ASSOCIATIONS)
      .doc(fromUserGUID).update({
        updatedAt: updatedAt,
        status: status,
      });
  }

  /**
   * The `init` method verifies if both users exist, if so, it updates them accordingly
   * with a subcollection containing de-normalized data. 
   *
   * @param starUserGUID A string representing the GUID of a user.
   * @param endUserGUID A string representing the GUID of a user.
   */
  async init(fromUserGUID: string, toUserGUID: string): Promise<void> {
    await this.usersService.get(fromUserGUID);
    await this.usersService.get(toUserGUID);

    const createdAt: FirebaseFirestore.Timestamp = firebase.firestore.Timestamp.fromDate(new Date());

    await this.fs.collection(collections.USERS)
      .doc(fromUserGUID)
      .collection(collections.ASSOCIATIONS)
      .doc(toUserGUID).set({
        createdAt: createdAt,
        status: Statuses.PENDING,
      });

    await this.fs.collection(collections.USERS)
      .doc(fromUserGUID)
      .collection(collections.ASSOCIATIONS)
      .doc(fromUserGUID).set({
        createdAt: createdAt,
        status: Statuses.RECEIVED,
      });
  }
}
