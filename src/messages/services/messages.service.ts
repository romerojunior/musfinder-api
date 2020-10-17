import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { Message } from '../models';
import { SendMessageDto } from '../dto';
import * as firebase from 'firebase-admin';
import { Collections } from '../../common/constants';
import { each, union } from 'lodash';

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
      readAt: data.readAt
    }
  }

  async send(fromID: string, sendMessageDto: SendMessageDto): Promise<void> {
    await this.usersService.get(sendMessageDto.to);
    const now = firebase.firestore.Timestamp.fromDate(new Date());

    await this.fs.collection(Collections.MESSAGES).doc().set({
      from: fromID,
      to: sendMessageDto.to,
      content: sendMessageDto.content,
      createdAt: now,
    });
  }

  async markAsRead(messageID: string): Promise<void> {
    try {
      await this.fs.collection(Collections.MESSAGES).doc(messageID).update({
        readAt: firebase.firestore.Timestamp.fromDate(new Date())
      });
    } catch {
      throw new NotFoundException();
    }
  }

  async countUnread(toID: string): Promise<number> {
    const colRef = this.fs.collection(Collections.MESSAGES);
    const { size } = await colRef.where('to', '==', toID).orderBy('readAt').get();
    return size;
  }

  async getConversation(userID: string, peerUserID: string): Promise<Message[]> {
    const colRef = this.fs.collection(Collections.MESSAGES);
    const firstDocRef = await colRef.where('to', '==', userID).where('from','==',peerUserID).get();
    const secondDocRef = await colRef.where('from', '==', peerUserID).where('to','==',userID).get();

    const response: Array<Message> = [];
    each(union(firstDocRef.docs, secondDocRef.docs), doc => {
      const data: any = doc.data();
      response.push(<Message>{
        guid: doc.id,
        from: data.from,
        to: data.to,
        content: data.content,
        readAt: data.readAt,
        createdAt: data.createdAt,
      });
    });
    return response
  }

  async getLatest(toID: string): Promise<Message[]> {
    const colRef = this.fs.collection(Collections.MESSAGES);
    console.log(toID);
    const docRef = await colRef.where('to', '==', toID).orderBy('createdAt', 'desc').limit(1).get();

    const response: Array<Message> = [];
    each(docRef.docs, doc => {
      const data: any = doc.data();
      const createdAt = <FirebaseFirestore.Timestamp>data.createdAt;
      const updatedAt = <FirebaseFirestore.Timestamp>data.updatedAt;
      const readAt = <FirebaseFirestore.Timestamp>data.readAt;
      response.push(<Message>{
        guid: doc.id,
        from: data.from,
        to: data.to,
        content: data.content,
        updatedAt: updatedAt? updatedAt.toDate().toUTCString(): null,
        readAt: readAt? readAt.toDate().toUTCString(): null,
        createdAt: createdAt? createdAt.toDate().toUTCString(): null,
      });
    });
    return response
  }
}
