export class SendMessageRequest {
    constructor(
        readonly chatId: string,
        readonly senderId: string,
        readonly content: string,
    ) {}
}
