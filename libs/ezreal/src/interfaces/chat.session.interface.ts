import { Stream } from 'stream';
import { TLSSocket } from 'tls';

export interface ChatSession {
  session: TLSSocket;
  stream: Stream;
}
