import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { Conversation, Message } from '../models';
import { SendMessageDto } from '../dto';
import * as firebase from 'firebase-admin';
import { Collections } from '../../common/constants';
import { each, map, first, orderBy, includes } from 'lodash';

@Injectable()
export class ConversationService {
  constructor(private readonly usersService: UsersService) { }

  private fs = firebase.firestore();

  async create(membersIDs: string[]): Promise<string> {
    each(membersIDs, async userID => { await this.usersService.get(userID) });
    const now = firebase.firestore.Timestamp.fromDate(new Date());
    const docRef = this.fs.collection(Collections.CONVERSATIONS).doc();
    await docRef.set({
      members: orderBy(membersIDs),
      createdAt: now,
    });
    return docRef.id;
  }

  async readMessages(memberID: string, conversationID: string): Promise<Message[]> {
    const docRef = await this.fs.collection(Collections.CONVERSATIONS).doc(conversationID).get();
    const { members } = docRef.data();
    if (includes(members,memberID)) {
      return this.getMessages(conversationID);
    }
    throw new UnauthorizedException();
  }


  async getMessages(conversationID: string): Promise<Message[]> {
    const messages: Array<Message> = [];
    const docRef = await this.fs.collection(Collections.CONVERSATIONS).doc(conversationID).collection(Collections.MESSAGES).get();

    each(docRef.docs, doc => {
      const data: any = doc.data();
      messages.push(
        <Message>{
          guid: doc.id,
          content: data.content,
          from: data.from,
          to: data.to,
          createdAt: data.createdAt,
        }
      );

    });
    return messages;
  }

  async getBetween(memberIDs: string[]): Promise<Conversation> {
    const conversationRef = await this.fs.collection(Collections.CONVERSATIONS)
      .where("members", "==", orderBy(memberIDs))
      .get();

    if (!conversationRef.size) {
      return null;
    }

    const conversationID = first(conversationRef.docs).id;
    const messagesDoc = await this.fs.collection(Collections.CONVERSATIONS)
      .doc(conversationID)
      .collection(Collections.MESSAGES)
      .get();

    const messages: Array<Message> = [];
    each(messagesDoc.docs, doc => {
      const data: any = doc.data();
      messages.push({
        guid: doc.id,
        from: data.from,
        to: data.to,
        content: data.content,
        createdAt: data.createdAt,
      });
    })

    return <Conversation>{
      guid: conversationID,
      members: memberIDs,
      messages: messages,
    }
  }

  async getByMember(memberID: string): Promise<Conversation[]> {
    const conversationsRef = await this.fs.collection(Collections.CONVERSATIONS)
    .where("members", "array-contains", memberID)
    .get();

    const conversations = await Promise.all(
      map(conversationsRef.docs, async (doc) => {
        const latestMessageRef = await this.fs.collection(Collections.CONVERSATIONS)
          .doc(doc.id)
          .collection(Collections.MESSAGES)
          .orderBy("createdAt", "desc")
          .limit(1)
          .get();
        const latestMessage = (latestMessageRef.size > 0) ? first(latestMessageRef.docs).data() : null;

        const conversation: any = doc.data();

        return <Conversation>{
          guid: doc.id,
          members: conversation.members,
          createdAt: conversation.createdAt,
          latestMessage: (latestMessage) ? {
            to: latestMessage.to,
            from: latestMessage.from,
            content: latestMessage.content,
            createdAt: latestMessage.createdAt,
            guid: first(latestMessageRef.docs).id
          } : null,
        };
      })
    );

    return conversations;
  }

  async addMessage(conversationID: string, sendMessageDto: SendMessageDto): Promise<void> {
    const now = firebase.firestore.Timestamp.fromDate(new Date());
    await this.fs.collection(Collections.CONVERSATIONS).doc(conversationID)
      .collection(Collections.MESSAGES).doc().set({
        content: sendMessageDto.content,
        from: sendMessageDto.from,
        to: sendMessageDto.to,
        createdAt: now,
      })
  }

  async sendMessage(sendMessageDto: SendMessageDto): Promise<void> {
    const { to, from } = sendMessageDto;
    const conversation = await this.getBetween([to, from]);
    if (conversation) {
      await this.addMessage(conversation.guid, sendMessageDto);
    } else {
      const conversationID = await this.create([to, from]);
      await this.addMessage(conversationID, sendMessageDto);
    }
  }
}
