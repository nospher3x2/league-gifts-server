import { EventEmitter, Stream } from 'stream';
import tls from 'tls';
import { Nameset } from './nameset.interface';

export class ChatSession extends EventEmitter {
  private readonly socket: tls.TLSSocket;
  private readonly stream: Stream;

  constructor(socket: tls.TLSSocket, stream: Stream) {
    super();

    this.socket = socket;
    this.stream = stream;

    this.stream.on('data', (chunk: Buffer) => {
      this.emit('message', chunk.toString());
    });
  }

  public sendFriendRequest(friendRequestId: number, nameset: Nameset): void {
    this.socket.write(
      `<iq type="set" id="roster_add_${friendRequestId}"><query xmlns="jabber:iq:riotgames:roster"><item subscription="pending_out" name="${nameset.alias.game_name}#${nameset.alias.tag_line}"><lol name="${nameset.alias.game_name}#${nameset.alias.tag_line}"/></item></query></iq>`,
    );
  }
}
