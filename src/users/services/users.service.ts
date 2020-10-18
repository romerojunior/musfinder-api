import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { Geolocation, User } from '../models';
import { SearchUserDto } from '../dto';
import { map, intersection, isEmpty } from 'lodash';
import { Collections } from '../../common/constants';
import * as firebase from 'firebase-admin';
import * as geofirestore from 'geofirestore';
import * as geokit from 'geokit';

@Injectable()
export class UsersService {

  private fs = firebase.firestore();
  private GeoFirestore = geofirestore.initializeApp(this.fs);
  private geocollection = this.GeoFirestore.collection(Collections.USERS);

  /**
   * The `create` method takes an instance of `CreateUserDto` as an argument and creates
   * it in the persistency layer.
   *
   * @param userID a string representing the guid of a user.
   * @param createUserDto an instance of `CreateUserDto`.
   */
  async create(userID: string, createUserDto: CreateUserDto): Promise<void> {
    await this.geocollection.doc(userID).set({
      name: {
        first: createUserDto.name.first,
        last: createUserDto.name.last
      },
      about: createUserDto.about,
      genres: createUserDto.genres,
      instruments: createUserDto.instruments,
      coordinates: new firebase.firestore.GeoPoint(
        createUserDto.coordinates.latitude,
        createUserDto.coordinates.longitude
      )
    });
  }

  /**
   * The `search` method takes an instance of `SearchUserDto` as an agument and executes a
   * geoquery based on the required properties of `SearchUserDto` (`_.radius`, `_.latitude`,
   * `_.longitude`), it will then filter the results obtained from this geoquery using the
   * optional properties of `SearchUserDto` (`_.instruments` and `_.genres`).
   *
   * @param searchUserDto an instance of `SearchUserDto`.
   *
   * @returns a list of `User`.
   */
  async search(searchUserDto: SearchUserDto): Promise<User[]> {
    const query = this.geocollection.near({
      radius: searchUserDto.radius,
      center: new firebase.firestore.GeoPoint(
        searchUserDto.coordinates.latitude,
        searchUserDto.coordinates.longitude
      )
    });

    const geosnapshot = await query.get();

     const response: Array<User> = map(geosnapshot.docs, doc => {
      const data: any = doc.data();

      const match: boolean = (!searchUserDto.instruments && !searchUserDto.genres) ||
        !isEmpty(intersection(searchUserDto.instruments, data.instruments)) ||
        !isEmpty(intersection(searchUserDto.genres, data.genres));

      if (match) {
        return<User>{
          guid: doc.id,
          about: data.about,
          distance: `${doc.distance.toFixed(2)} km`,
          name: {
            first: data.name.first,
            last: data.name.last
          },
          genres: data.genres,
          instruments: data.instruments,
        };
      }
    });

    return response
  }

  /**
   * The `get` method tries to fetch an user by its `_.guid` property, throwing a
   * `NotFoundException` in case the user cannot be found.
   *
   * @param userID a string representing the guid of a user.
   *
   * @returns an instance of `User`.
   *
   * @throws {NotFoundException} if the guid cannot be found.
   */
  async get(userID: string): Promise<User> {
    const userRef = this.fs.collection(Collections.USERS).doc(userID);

    const user = await userRef.get();
    if (!user.exists) {
      throw new NotFoundException();
    }

    const data: any = user.data();
    return <User>{
      guid: userRef.id,
      name: {
        first: data.name.first,
        last: data.name.last,
      },
      about: data.about,
      instruments: data.instruments,
      genres: data.genres,
    }
  }

  /**
   * The `getWithGeolocation` method tries to fetch an user by its `_.guid` property,
   * throwing a `NotFoundException` in case the user cannot be found. The instance of
   * `User` returned by this method contains the `_.coordinates` property.
   *
   * @param userID a string representing the guid of a user.
   *
   * @returns an instance of `User`.
   *
   * @throws {NotFoundException} if the guid cannot be found.
   */
  async getWithGeolocation(userID: string): Promise<User> {
    const userRef = this.fs.collection(Collections.USERS).doc(userID);

    const user = await userRef.get();
    if (!user.exists) {
      throw new NotFoundException();
    }

    const data: any = user.data();
    return <User>{
      guid: userRef.id,
      name: {
        first: data.name.first,
        last: data.name.last,
      },
      about: data.about,
      instruments: data.instruments,
      genres: data.genres,
      coordinates: <Geolocation>{
        latitude: data.coordinates.latitude,
        longitude: data.coordinates.longitude
      }
    }
  }

  /**
   * The `calculateDistanceBetweenIDs` method tries to fetch both users identified by
   * the arguments `starUserID` and `endUserID`, throwing a `NotFoundException` in
   * case it cannot find any. It then calculates the distance in kilometers between users
   * based on their `_.coordinates` property.
   *
   * @param starUserID a string representing the guid of a user.
   * @param endUserID a string representing the guid of a user.
   *
   * @returns the distance in kilometers.
   *
   * @throws {NotFoundException} if any of the guid cannot be found.
   */
  async calculateDistanceBetweenIDs(starUserID: string, endUserID: string): Promise<number> {
    const starUser = await this.getWithGeolocation(starUserID);
    if (!starUser) {
      throw new NotFoundException();
    }

    const endUser = await this.getWithGeolocation(endUserID);
    if (!endUser) {
      throw new NotFoundException();
    }

    return geokit.distance(
      { lat: starUser.coordinates.latitude, lng: starUser.coordinates.longitude },
      { lat: endUser.coordinates.latitude, lng: endUser.coordinates.longitude }
    );
  }
}
