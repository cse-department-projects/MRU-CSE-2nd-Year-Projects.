export interface IMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}
