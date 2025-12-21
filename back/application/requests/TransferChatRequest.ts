export class TransferChatRequest {
    constructor(
        readonly chatId: string,
        readonly currentAdvisorId: string | undefined, // Optionnel pour l'assignation par DIRECTOR
        readonly newAdvisorId: string,
    ) {}
}
