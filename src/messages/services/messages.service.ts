import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { Message } from '../models';
import * as firebase from 'firebase-admin';
import { Collections } from '../../common/constants';

@Injectable()
export class MessagesService {
  constructor(private readonly usersService: UsersService) { }

  private fs = firebase.firestore();

  async getOne(messageID: string): Promise<Message> {
    const docRef = this.fs.collection(Collections.MESSAGES).doc(messageID);

    const messageDoc = await docRef.get();
    if (!messageDoc.exists) {
      throw new NotFoundException();
    }

    const data: any = messageDoc.data();
    return <Message>{
      guid: docRef.id,
      from: data.from,
      to: data.to,
      content: data.content,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      readAt: data.readAt,
    }
  }
}
