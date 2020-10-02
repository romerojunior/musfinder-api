import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Geolocation, UserRelativeToPoint } from './interfaces';
import * as firebase from 'firebase-admin';
import * as geofirestore from 'geofirestore';


@Injectable()
export class UsersService {

  fs = firebase.firestore();
  GeoFirestore = geofirestore.initializeApp(this.fs);
  geocollection = this.GeoFirestore.collection('users');

  /**
   * The `create` method takes an instance of `CreateUserDto` and creates it
   * in the persistency layer.
   *
   * @param createUserDto A `CreateUserDto` instance.
   *
   * @returns void.
   */
  async create(createUserDto: CreateUserDto): Promise<void> {
    await this.geocollection.doc(createUserDto.guid).set({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      about: createUserDto.about,
      genres: createUserDto.genres,
      instruments: createUserDto.instruments,
      coordinates: new firebase.firestore.GeoPoint(
        createUserDto.latitude,
        createUserDto.longitude
      )
    })
  }

  /**
   * The `locate` method takes a radius and a geolocation as argument and
   * returns all users currently reported within that area.
   *
   * @param radius A number (integer) representing the radius of search.
   * @param geolocation An instance of `Geolocation` representing the center of
   * search.
   *
   * @returns A promise that resolves to a list of `UserRelativeToPoint`.
   */
  async locate(radius: number, geolocation: Geolocation): Promise<UserRelativeToPoint[]> {
    const query = this.geocollection.near({
      radius: radius,
      center: new firebase.firestore.GeoPoint(
        geolocation.latitude,
        geolocation.longitude
      )
    });

    const geosnapshot = await query.get();

    const response: Array<UserRelativeToPoint> = [];

    for (var doc of geosnapshot.docs){
      const data: any = doc.data();
      const user: UserRelativeToPoint = {
        about: data.about,
        distance: `${doc.distance.toFixed(2)} km`,
        firstName: data.firstName,
        lastName: data.lastName,
        genres: data.genres,
        instruments: data.instruments,
      }
      response.push(user);
    }
    return response
  }

}
