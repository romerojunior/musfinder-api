import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { Conversation, Message } from '../models';
import { SendMessageDto } from '../dto';
import * as firebase from 'firebase-admin';
import { Collections } from '../../common/constants';
import { each, map, first, orderBy, includes } from 'lodash';

@Injectable()
export class ConversationService {
  constructor(private readonly usersService: UsersService) {}

  private fs = firebase.firestore();

  /**
   * The `create` method fetches all users in `membersIDs` argument and then creates a
   * conversation among them.
   *
   * @param membersIDs an array of strings represending IDs of members.
   *
   * @returns the ID of the conversation.
   */
  async create(membersIDs: string[]): Promise<string> {
    each(membersIDs, async userID => {
      await this.usersService.get(userID);
    });

    const docRef = this.fs.collection(Collections.CONVERSATIONS).doc();
    const now = firebase.firestore.Timestamp.fromDate(new Date());
    await docRef.set({
      members: orderBy(membersIDs),
      createdAt: now,
    });
    return docRef.id;
  }

  /**
   * The `readMessages` method takes a member ID and conversation ID as arguments, if
   * member belongs to conversation, all messages from conversation will be fetched,
   * else a unauthorized exception is thrown.
   *
   * @param memberID a string representing the member ID.
   * @param conversationID a string representing the conversation ID.
   *
   * @returns an array of messages.
   */
  async readMessages(memberID: string, conversationID: string,): Promise<Message[]> {
    const docRef = await this.fs
      .collection(Collections.CONVERSATIONS)
      .doc(conversationID)
      .get();

    const { members } = docRef.data();
    if (!includes(members, memberID)) {
      throw new UnauthorizedException();
    }

    return this.getMessages(conversationID);
  }

  /**
   * The `getMessages` takes a conversation ID as argument and returns fetches all
   * messages ordered from newest to oldest.
   *
   * @param memberID a string representing the member ID.
   * @param conversationID a string representing the conversation ID.
   *
   * @returns an array of messages.
   */
  async getMessages(conversationID: string): Promise<Message[]> {
    const docRef = await this.fs
      .collection(Collections.CONVERSATIONS)
      .doc(conversationID)
      .collection(Collections.MESSAGES)
      .orderBy('createdAt', 'desc')
      .get();

    const messages: Array<Message> = map(docRef.docs, doc => {
      const data: any = doc.data();
      const createdAt = <FirebaseFirestore.Timestamp>data.createdAt;
      return <Message>{
        guid: doc.id,
        from: data.from,
        content: data.content,
        createdAt: createdAt.toDate().toUTCString(),
      };
    });

    return messages;
  }

  /**
   * The `getBetween` methods takes an array of members ID and gets the conversation
   * between the members if it exists, returning `null` otherwise.
   *
   * @param membersIDs an array of strings represending IDs of members.
   *
   * @returns a conversation or null.
   */
  async getBetween(memberIDs: string[]): Promise<Conversation> | null {
    const conversationRef = await this.fs
      .collection(Collections.CONVERSATIONS)
      .where('members', '==', orderBy(memberIDs))
      .get();

    const conversation = first(conversationRef.docs);
    if (!conversation) {
      return null;
    }

    return <Conversation>{
      guid: conversation.id,
      members: memberIDs,
    };
  }

  /**
   * The `getLatestMessage` methods takes a conversation ID and if messages are found
   * returns the latest, else returns `null`.
   *
   * @param membersIDs an array of strings represending IDs of members.
   *
   * @returns a conversation or null.
   */
  async getLatestMessage(conversationID: string): Promise<Message> | null {
    const latestMessageRef = await this.fs
      .collection(Collections.CONVERSATIONS)
      .doc(conversationID)
      .collection(Collections.MESSAGES)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    const message = first(latestMessageRef.docs);
    if (!message) {
      return null;
    }

    const data: any = message.data();
    const createdAt = <FirebaseFirestore.Timestamp>data.createdAt;
    return <Message>{
      guid: message.id,
      from: data.from,
      content: data.content,
      createdAt: createdAt.toDate().toUTCString(),
    }
  }

  /**
   * The `getByMember` methods takes a member ID and returns all conversations that
   * includes this member.
   *
   * @param memberID a string representing the member ID.
   *
   * @returns an array of conversations.
   */
  async getByMember(memberID: string): Promise<Conversation[]> {
    const conversationsRef = await this.fs
      .collection(Collections.CONVERSATIONS)
      .where('members', 'array-contains', memberID)
      .get();

    const conversations = await Promise.all(
      map(conversationsRef.docs, async doc => {
        const data: any = doc.data();
        const createdAt = <FirebaseFirestore.Timestamp>data.createdAt;
        const latestMessage = await this.getLatestMessage(doc.id);

        return <Conversation>{
          guid: doc.id,
          members: data.members,
          createdAt: createdAt.toDate().toUTCString(),
          latestMessage: latestMessage ? latestMessage : null,
        };
      }),
    );

    return conversations;
  }

  /**
   * The `addMessage` methods adds a message to a conversation based on its ID. It takes
   * a conversation ID and a message DTO as arguments.
   *
   * @param conversationID a string representing the conversation ID.
   * @param sendMessageDto a DTO with the necessary data to send a message.
   */
  async addMessage(conversationID: string, message: Message): Promise<void> {
    const now = firebase.firestore.Timestamp.fromDate(new Date());
    await this.fs
      .collection(Collections.CONVERSATIONS)
      .doc(conversationID)
      .collection(Collections.MESSAGES)
      .doc()
      .set({
        content: message.content,
        from: message.from,
        createdAt: now,
      });
  }

  /**
   * The `sendMessage` methods takes
   *
   * @param conversationID a string representing the conversation ID.
   * @param sendMessageDto a DTO with the necessary data to send a message.
   */
  async sendMessage(senderID: string, sendMessageDto: SendMessageDto): Promise<void> {
    const message: Message = {
      from: senderID,
      content: sendMessageDto.content
    }
    const conversation = await this.getBetween([sendMessageDto.to, senderID]);
    if (!conversation) {
      const conversationID = await this.create([sendMessageDto.to, senderID]);
      await this.addMessage(conversationID, message);
      return;
    }

    await this.addMessage(conversation.guid, message);
  }
}
