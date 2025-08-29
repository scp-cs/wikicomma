import * as zmq from "zeromq"

export enum MessageType {
    Handshake,
    Preflight,
    Progress,
    ErrorFatal,
    ErrorNonfatal,
    FinishSuccess,
    PageDone,
    PagePostponed
}

export enum Status {
    BuildingSitemap,
    PagesMain,
    ForumsMain,
    PagesPending,
    FilesPending,
    Compressing,
    FatalError,
    Other
}

export enum ErrorKind {
    ErrorClientOffline,
    ErrorMalformedSitemap,
    ErrorVoteFetch,
    ErrorFileFetch,
    ErrorLockStatusFetch,
    ErrorForumListFetch,
    ErrorForumPostFetch,
    ErrorFileMetaFetch,
    ErrorFileUnlink,
    ErrorForumCountMismatch,
    ErrorWikidotInternal,
    ErrorWhatTheFuck,
    ErrorMetaMissing,
    ErrorGivingUp,
    ErrorTokenInvalidated
}


export interface MessageData {
    total?: number
    postponed?: number
    done?: number
    status?: Status
    name?: string
    errorKind?: ErrorKind
    errorStr?: string
}

export class ScuttleConnector {

    private log(message: string) {
        console.log(`[con-${this.tag}]: ${message}`);
    }

    private async send(message: Object) {
        await fetch(this.address+"/backup/status", {
            method: "POST",
            body: JSON.stringify(message)
        }).catch(e => {this.log("Exception: " + e)})
    }

    public async sendMessage(type: MessageType, data?: MessageData) {
        switch (type) {
            case MessageType.Handshake:
            case MessageType.FinishSuccess:
            case MessageType.PageDone:
            case MessageType.PagePostponed:
                await this.send(JSON.stringify({"tag": this.tag, "type": type}))
                break;

            case MessageType.Preflight:
                await this.send(JSON.stringify({"tag": this.tag, "type": type, "total": data?.total}))
                break;
            
            case MessageType.Progress:
            case MessageType.ErrorFatal:
            case MessageType.ErrorNonfatal:
                await this.send(JSON.stringify({"tag": this.tag, "type": type, ...data}))
                break;

            default:
                this.log("ERROR: Undefined message type")
                break;
        }
    }

    constructor(private tag: string, private address: string) {
        
    }

    public async init() {
        this.log("Sending handshake message")
        await this.sendMessage(MessageType.Handshake)
    }
}