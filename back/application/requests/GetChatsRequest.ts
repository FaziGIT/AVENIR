export class GetChatsRequest {
    constructor(
        readonly userId: string,
        readonly userRole: string,
    ) {}
}
