import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Geolocation, User } from './models';
import * as firebase from 'firebase-admin';
import * as geofirestore from 'geofirestore';
import { SearchUserDto } from './dto';

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
   * @returns Instance of `User`.
   */
  async create(createUserDto: CreateUserDto): Promise<void> {
    await this.geocollection.doc(createUserDto.guid).set({
      name: {
        first: createUserDto.name.first,
        last:  createUserDto.name.last
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
   * The `locate` method takes a radius and a geolocation as argument and
   * returns all users currently reported within that area according to
   * search parameters defined within `searchUserDto`.
   *
   * @param searchUserDto An instance of `SearchUserDto`.
   *
   * @returns A promise that resolves to a list of `User`.
   */
  async locate(searchUserDto: SearchUserDto): Promise<User[]> {
    const query = this.geocollection.near({
      radius: searchUserDto.radius,
      center: new firebase.firestore.GeoPoint(
        searchUserDto.latitude,
        searchUserDto.longitude
      )
    });

    const geosnapshot = await query.get();
    const response: Array<User> = [];

    for (var doc of geosnapshot.docs){
      const data: any = doc.data();
      let match: boolean = false;

      if (!searchUserDto.instruments && !searchUserDto.genres) {
        match = true;
      } else {
        if (searchUserDto.instruments) {
          searchUserDto.instruments.forEach(instrument => {
            if (data.instruments.includes(instrument)) {
              match = true;
            }
          });
        }
        if (searchUserDto.genres) {
          searchUserDto.genres.forEach(genre => {
            if (data.genres.includes(genre)) {
              match = true;
            }
          });
        }
      }

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
    }

    return response
  }

  /**
   * The `getByGUID` method takes a GUID as argument and searches for that
   * entry within the persistency layer, returning the matched instance.
   *
   * @param guid A UUID/GUID string representing the unique identify of a user.
   *
   * @returns A promise that resolves to `User` or `null` if nothing is found.
   */
  async getByGUID(guid: string): Promise<User|null> {
    const userRef = this.fs.collection('users').doc(guid);

    const user = await userRef.get();
    if (!user.exists) {
      return null;
    }

    const data = user.data();
    return <User>{
      guid: userRef.id,
      name: {
        first: data.name.first,
        last: data.name.last
      },
      about: data.about,
      instruments: data.instruments,
      genres: data.genres
    }
  }

  /**
   * The `getGeolocationByGUID` method takes a GUID as arguement and searches for that
   * entry within the persistency layer, returning the geolocation for that entry.
   *
   * @param guid A UUID/GUID string representing the unique identify of a user.
   *
   * @returns A promise that resolves to `Geolocation` or `null` if nothing is found.
   */
  async getGeolocationByGUID(guid: string): Promise<Geolocation|null> {
    const userRef = this.fs.collection('users').doc(guid);

    const user = await userRef.get();
    if (!user.exists) {
      return null;
    }

    const data = user.data();
    return <Geolocation>{
      latitude: data.coordinates.latitude,
      longitude: data.coordinates.longitude
    }
  }

}
