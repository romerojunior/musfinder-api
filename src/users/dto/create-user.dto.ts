export interface CreateUserDto {
  firstName: string;
  lastName: string;
  geolocation: {
    latitude: number;
    longitude: number;
  };
  profile_description: string;
  instruments: [string],
  genres: [string],
}