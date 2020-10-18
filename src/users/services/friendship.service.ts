import { ConflictException, Injectable } from '@nestjs/common';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { Collections } from '../../common/constants';
import { Statuses } from '../../common/enums';
import { RespondFriendshipDto, RequestFriendshipDto } from '../dto';
import { each, map, union } from 'lodash';
import { Friendship } from '../models';
import * as firebase from 'firebase-admin';

@Injectable()
export class FriendshipService {
  constructor(private readonly usersService: UsersService) { }

  private fs = firebase.firestore();

  /**
   * The `get` method takes `friendshipID` as argument and returns an object representing
   * the friendship entity.
   *
   * @param friendshipID a string representing the guid of a friendship.
   *
   * @returns an instance of `Friendship`.
   *
   * @throws {NotFoundException} if `friendshipID` cannot be found.
   */
  async get(friendshipID: string): Promise<Friendship> {
    const docRef = this.fs.collection(Collections.FRIENDSHIPS).doc(friendshipID);

    const friendshipDoc = await docRef.get();
    if (!friendshipDoc.exists) {
      throw new NotFoundException();
    }

    const data: any = friendshipDoc.data();
    return <Friendship>{
      guid: docRef.id,
      status: data.status,
      from: data.from,
      to: data.to,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }
  }

  /**
   * The `getByUser` method takes `userID` as argument and returns an object
   * representing an array of Friendship model.
   *
   * @param userID a string representing the guid of a user.
   *
   * @returns an array of `Friendship` instances.
   */
  async getByUser(userID: string): Promise<Friendship[]> {
    const colRef = this.fs.collection(Collections.FRIENDSHIPS);

    const fromDocRef = await colRef.where('from', '==', userID).get();
    const toDocRef = await colRef.where('to', '==', userID).get();

    const response: Array<Friendship> = map(
      union(fromDocRef.docs, toDocRef.docs), doc => {
        const data: any = doc.data();
        const createdAt = <FirebaseFirestore.Timestamp>data.createdAt;
        const updatedAt = <FirebaseFirestore.Timestamp>data.updatedAt;
        return <Friendship>{
          createdAt: createdAt.toDate().toUTCString(),
          updatedAt: updatedAt.toDate().toUTCString(),
          guid: doc.id,
          to: data.to,
          from: data.from,
          status: data.status,
        }
      });

    return response;
  }

  /**
   * The `request` method verifies if both users exist, if so, it will update the
   * collection with a representation of the association.
   *
   * @param fromUserID a string representing the guid of a user.
   * @param requestFriendshipDto an instance of `RequestFriendshipDto`.
   */
  async request(fromUserID: string, requestFriendshipDto: RequestFriendshipDto): Promise<void> {
    await this.usersService.get(fromUserID);
    await this.usersService.get(requestFriendshipDto.user);

    const colRef = this.fs.collection(Collections.FRIENDSHIPS);
    const fromTo = await colRef.where('from', '==', fromUserID).where('to', '==', requestFriendshipDto.user).get();
    const toFrom = await colRef.where('to', '==', fromUserID).where('from', '==', requestFriendshipDto.user).get();

    if (union(fromTo.docs, toFrom.docs).length > 0) {
      throw new ConflictException();
    }

    const now = firebase.firestore.Timestamp.fromDate(new Date());
    const docRef = this.fs.collection(Collections.FRIENDSHIPS).doc();

    await docRef.set({
      from: fromUserID,
      to: requestFriendshipDto.user,
      status: Statuses.REQUESTED,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * The `respond` method takes an authenticated userID, a friendshipID and an instance of
   * `UpdateFriendshipDto` as arguments. If the userID is the same user who received the
   * friendship invitation, then the `respondFriendshipDto` will be considered, else a
   * `UnauthorizedException` is thrown.
   *
   * @param userID a string representing the guid of a user.
   * @param friendshipID a string representing the guid of a friendship.
   * @param respondFriendshipDto an instance of `UpdateFriendshipDto`.
   *
   * @throws {UnauthorizedException} if it does not match the business conditions.
   */
  async respond(userID: string, friendshipID: string, respondFriendshipDto: RespondFriendshipDto): Promise<void> {
    const now = firebase.firestore.Timestamp.fromDate(new Date());
    const friendship = await this.get(friendshipID);

    let update: boolean = (friendship.to == userID) && (
      (respondFriendshipDto.status == Statuses.ACCEPTED) ||
      (respondFriendshipDto.status == Statuses.REJECTED)
    )
    if (!update) {
      throw new UnauthorizedException();
    }

    await this.fs.collection(Collections.FRIENDSHIPS)
      .doc(friendshipID)
      .update({
        status: respondFriendshipDto.status,
        updatedAt: now,
      });
  }

  /**
   * The `unfriend` method takes a userID and a friendshipID as arguments. If the userID
   * is the same user who received or sent the friendship invitation, then the document
   * representing the friendship entity will be purged.
   *
   * @param userID a string representing the guid of a user.
   * @param friendshipID a string representing the guid of a friendship.
   *
   * @throws {UnauthorizedException} if it does not match the business conditions.
   */
  async unfriend(userID: string, friendshipID: string): Promise<void> {
    const friendship = await this.get(friendshipID);
    if ((friendship.to == userID) || (friendship.from == userID)) {
      await this.fs.collection(Collections.FRIENDSHIPS).doc(friendshipID).delete();
    } else {
      throw new UnauthorizedException();
    }
  }
}
