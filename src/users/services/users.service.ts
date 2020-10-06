import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { Geolocation, User } from '../models';
import { SearchUserDto } from '../dto';
import { each, intersection, isEmpty } from 'lodash';
import { collections } from '../../common/constants';
import * as firebase from 'firebase-admin';
import * as geofirestore from 'geofirestore';
import * as geokit from 'geokit';

@Injectable()
export class UsersService {

  private fs = firebase.firestore();
  private GeoFirestore = geofirestore.initializeApp(this.fs);
  private geocollection = this.GeoFirestore.collection(collections.USERS);

  /**
   * The `create` method takes an instance of `CreateUserDto` as an argument and creates
   * it in the persistency layer.
   *
   * @param createUserDto An instance of `CreateUserDto`.
   */
  async create(createUserDto: CreateUserDto): Promise<void> {
    await this.geocollection.doc(createUserDto.guid).set({
      name: {
        first: createUserDto.name.first,
        last: createUserDto.name.last
      },
      about: createUserDto.about,
      genres: createUserDto.genres,
      instruments: createUserDto.instruments,
      coordinates: new firebase.firestore.GeoPoint(
        createUserDto.latitude,
        createUserDto.longitude
      )
    });
  }

  /**
   * The `search` method takes an instance of `SearchUserDto` as an agument and executes a
   * geoquery based on the required properties of `SearchUserDto` (`_.radius`, `_.latitude`,
   * `_.longitude`), it will then filter the results obtained from this geoquery using the
   * optional properties of `SearchUserDto` (`_.instruments` and `_.genres`).
   *
   * @param searchUserDto An instance of `SearchUserDto`.
   *
   * @returns A list of `User`.
   */
  async search(searchUserDto: SearchUserDto): Promise<User[]> {
    const query = this.geocollection.near({
      radius: searchUserDto.radius,
      center: new firebase.firestore.GeoPoint(
        searchUserDto.latitude,
        searchUserDto.longitude
      )
    });

    const geosnapshot = await query.get();
    const response: Array<User> = [];

    each(geosnapshot.docs, doc => {
      const data: any = doc.data();

      const match: boolean = (!searchUserDto.instruments && !searchUserDto.genres) ||
        !isEmpty(intersection(searchUserDto.instruments, data.instruments)) ||
        !isEmpty(intersection(searchUserDto.genres, data.genres));

      if (match) {
        response.push(<User>{
          guid: doc.id,
          about: data.about,
          distance: `${doc.distance.toFixed(2)} km`,
          name: {
            first: data.name.first,
            last: data.name.last
          },
          genres: data.genres,
          instruments: data.instruments,
        });
      }
    });

    return response
  }

  /**
   * The `get` method tries to fetch an user by its `_.guid` property, throwing a
   * `NotFoundException` in case the user cannot be found.
   *
   * @param guid string representing the GUID of a user.
   *
   * @returns An instance of `User`.
   *
   * @throws {NotFoundException} If the GUID cannot be found.
   */
  async get(guid: string): Promise<User> {
    const userRef = this.fs.collection(collections.USERS).doc(guid);

    const user = await userRef.get();
    if (!user.exists) {
      throw new NotFoundException();
    }

    const data = user.data();
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
   * @param guid string representing the GUID of a user.
   *
   * @returns An instance of `User`.
   *
   * @throws {NotFoundException} If the GUID cannot be found.
   */
  async getWithGeolocation(guid: string): Promise<User> {
    const userRef = this.fs.collection(collections.USERS).doc(guid);

    const user = await userRef.get();
    if (!user.exists) {
      throw new NotFoundException();
    }

    const data = user.data();
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
   * The `calculateDistanceBetweenGUIDs` method tries to fetch both users identified by
   * the arguments `startUserGUID` and `endUserGUID`, throwing a `NotFoundException` in
   * case it cannot find any. It then calculates the distance in kilometers between users
   * based on their `_.coordinates` property.
   *
   * @param starUserGUID A string representing the GUID of a user.
   * @param endUserGUID A string representing the GUID of a user.
   *
   * @returns A number representing the distance in kilometers.
   *
   * @throws {NotFoundException} If any of the GUIDs cannot be found.
   */
  async calculateDistanceBetweenGUIDs(starUserGUID: string, endUserGUID: string): Promise<number> {
    const starUser = await this.getWithGeolocation(starUserGUID);
    if (!starUser) {
      throw new NotFoundException();
    }

    const endUser = await this.getWithGeolocation(endUserGUID);
    if (!endUser) {
      throw new NotFoundException();
    }

    return geokit.distance(
      { lat: starUser.coordinates.latitude, lng: starUser.coordinates.longitude },
      { lat: endUser.coordinates.latitude, lng: endUser.coordinates.longitude }
    );
  }
}
