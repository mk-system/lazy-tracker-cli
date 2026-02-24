import { get, post, put, del } from './client.js';
import type {
  JpMkscLazytrackerApiModelsChatChatResponse as ChatResponse,
  JpMkscLazytrackerApiModelsChatChatCreateRequest,
  JpMkscLazytrackerApiModelsChatChatUpdateRequest,
} from './__generated__/data-contracts.js';

export type Chat = ChatResponse;
export type ChatCreateRequest = JpMkscLazytrackerApiModelsChatChatCreateRequest;
export type ChatUpdateRequest = JpMkscLazytrackerApiModelsChatChatUpdateRequest;

export async function getChatsByTicket(ticketId: string): Promise<Chat[]> {
  return get<Chat[]>(`/tickets/${ticketId}/chats`);
}

export async function createChat(ticketId: string, data: ChatCreateRequest): Promise<Chat> {
  return post<Chat>(`/tickets/${ticketId}/chats`, data);
}

export async function updateChat(chatId: string, data: ChatUpdateRequest): Promise<Chat> {
  return put<Chat>(`/chats/${chatId}`, data);
}

export async function deleteChat(chatId: string): Promise<void> {
  return del<void>(`/chats/${chatId}`);
}
