import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '',
      port: 5432,
      username: 'postgres',
      password: '',
      database: 'musfinder',
      entities: [User],
      synchronize: true,
    }),
    UsersModule,
  ],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
