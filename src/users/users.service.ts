import { Injectable } from '@nestjs/common';
import { User } from './interfaces/user.interface';
import { getDistance } from 'geolib';

const axios = require('axios').default;

@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  create(user: User) {
    this.users.push(user);
  }

  async findByGeolocation(latitude: number, longitude: number): Promise<any> {
    const mock = {
      users: [
        {
          name: "Butters",
          geolocation: {
            latitude: 52.091052,
            longitude: 5.1070728
          }
        },
        {
          name: "Cartman",
          geolocation: {
            latitude: 51.12345,
            longitude: 5.301023
          }
        },
        {
          name: "Kenny",
          geolocation: {
            latitude: 51.12545,
            longitude: 5.101123
          }
        },
      ]
    };

    var resp = { users: [] };

    for (const key in mock.users) {
      const user = mock.users[key];
      const distance = getDistance(user.geolocation, {latitude, longitude});
      resp.users.push({ name: user.name, distance: distance/1000 });
    }
    resp.users.sort((a, b) => (a.distance > b.distance) ? 1 : -1);
    return resp;
  }


  async getLocationByUserId(id: string) {
    return `${id}`
  }


  async updateLocationByUserId(id: string, data: any) {
    return `${id} -> ${data}`
  }

  findAll(): any {
    return {
      "users": [
        {
          "name": "Butters",
          "geolocation": {
            "latitude": 5.1070728,
            "longitude": 52.091052
          }
        },
        {
          "name": "Cartman",
          "geolocation": {
            "latitude": 5.301023,
            "longitude": 51.12345
          }
        },
      ]
    };
  }

}





