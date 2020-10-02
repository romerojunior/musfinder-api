export interface User {
    guid?: string,
    name: {
      first: string,
      last: string,
    }
    about: string;
    instruments: [string];
    genres: [string];
  }