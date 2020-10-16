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
      readAt: data.readAt,
      isRead: data.isRead
    }
  }

  async send(message: SendMessageDto): Promise<void> {
    const now = firebase.firestore.Timestamp.fromDate(new Date());

    await this.fs.collection(Collections.MESSAGES).doc().set({
      to: message.to,
      from: message.from,
      content: message.content,
      createdAt: now,
      isRead: false,
    });
  }

  async markAsRead(messageID: string): Promise<void> {
    try {
      await this.fs.collection(Collections.MESSAGES).doc(messageID).set({
        readAt: firebase.firestore.Timestamp.fromDate(new Date()),
        isRead: true,
      });
    } catch {
      throw new NotFoundException();
    }
  }

  async countUnread(toID: string): Promise<number> {
    const colRef = this.fs.collection(Collections.MESSAGES);
    const { size } = await colRef.where('to', '==', toID).where('isRead','==',true).get();
    return size;
  }

  async getConversation(firstRcptID: string, secondRcptID: string): Promise<Message[]> {
    const colRef = this.fs.collection(Collections.MESSAGES);
    const firstDocRef = await colRef.where('to', '==', firstRcptID).where('from','==',secondRcptID).get();
    const secondDocRef = await colRef.where('from', '==', secondRcptID).where('to','==',firstRcptID).get();

    const response: Array<Message> = [];
    each(union(firstDocRef.docs, secondDocRef.docs), doc => {
      const data: any = doc.data();
      response.push(<Message>{
        guid: doc.id,
        from: data.from,
        to: data.to,
        content: data.content,
        isRead: data.isRead,
        readAt: data.readAt,
        createdAt: data.createdAt,
      });
    });
    return response
  }

  async getLatest(toID: string): Promise<Message[]> {
    const colRef = this.fs.collection(Collections.MESSAGES);
    const docRef = await colRef.where('to', '==', toID).orderBy('createdAt').limit(1).get();

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
        isRead: data.isRead,
        updatedAt: updatedAt? updatedAt.toDate().toUTCString(): null,
        readAt: readAt? readAt.toDate().toUTCString(): null,
        createdAt: createdAt? createdAt.toDate().toUTCString(): null,
      });
    });
    return response
  }
}
