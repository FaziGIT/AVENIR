export class CreateChatRequest {
    constructor(
        readonly initialMessage: string,
        readonly clientId: string
    ) {}
}
