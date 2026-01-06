import { UserRepository } from "../../../domain/repositories/UserRepository";
import { ChatRepository } from "../../../domain/repositories/ChatRepository";
import { LoanRepository } from "../../../domain/repositories/LoanRepository";
import { InvalidCredentialsError, UserNotFoundError } from "../../../domain/errors";
import { UserRole } from "../../../domain/enumerations/UserRole";
import { GetAdvisorClientsWithChatsAndLoansRequest } from "../../requests";
import {
    ClientResponse,
    GetAdvisorClientsWithChatsAndLoansResponse,
    GetAdvisorClientsWithChatsAndLoansResponseMapper
} from "../../responses/GetAdvisorClientsWithChatsAndLoansResponse";
import {MessageRepository} from "../../../domain/repositories/MessageRepository";

export class GetAdvisorClientsWithChatsAndLoansUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly chatRepository: ChatRepository,
        private readonly loanRepository: LoanRepository,
        private readonly messageRepository: MessageRepository
    ) {}

    async execute(request: GetAdvisorClientsWithChatsAndLoansRequest): Promise<GetAdvisorClientsWithChatsAndLoansResponse> {
        const advisor = await this.userRepository.getById(request.advisorId);
        if (!advisor) {
            throw new UserNotFoundError(request.advisorId);
        }
        if (advisor.role !== UserRole.ADVISOR) {
            throw new InvalidCredentialsError();
        }

        const clients = await this.userRepository.getClientsByAdvisorId(request.advisorId);
        const advisorChats = await this.chatRepository.getByAdvisorId(request.advisorId);

        const clientsWithDetails: ClientResponse[] = await Promise.all(
            clients.map(async (client) => {
                const clientChats = advisorChats.filter(chat => chat.client.id === client.id);
                const clientLoans = await this.loanRepository.getLoansByClientId(client.id);

                const sortedLoans = clientLoans.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );

                return {
                    id: client.id,
                    firstName: client.firstName,
                    lastName: client.lastName,
                    email: client.email,
                    identityNumber: client.identityNumber,
                    state: client.state,
                    createdAt: client.createdAt,
                    chats: await Promise.all(clientChats.map(async (chat) => {
                        const firstMessage = await this.messageRepository.getFirstMessageByChatId(chat.id);
                        return {
                            id: chat.id,
                            status: chat.status,
                            createdAt: chat.createdAt,
                            updatedAt: chat.updatedAt,
                            firstMessage: firstMessage ? {
                                id: firstMessage.id,
                                content: firstMessage.content,
                            } : undefined,
                        };
                    })),
                    loans: sortedLoans.map(loan => {
                        const startDate = loan.createdAt;
                        const endDate = new Date(startDate);
                        endDate.setMonth(endDate.getMonth() + loan.duration);

                        return {
                            id: loan.id,
                            name: loan.name,
                            amount: loan.amount,
                            duration: loan.duration,
                            annualInterestRate: loan.annualInterestRate,
                            insuranceRate: loan.insuranceRate,
                            monthlyPayment: loan.monthlyPayment,
                            totalCost: loan.totalCost,
                            totalInterest: loan.totalInterest,
                            insuranceCost: loan.insuranceCost,
                            remainingPayment: loan.remainingPayment,
                            paidAmount: loan.paidAmount,
                            progressPercentage: loan.progressPercentage,
                            monthsPaid: loan.monthsPaid,
                            status: loan.status,
                            startDate: startDate,
                            endDate: endDate,
                            nextPaymentDate: loan.nextPaymentDate,
                            createdAt: loan.createdAt,
                            updatedAt: loan.updatedAt,
                        };
                    })
                };
            })
        );

        return GetAdvisorClientsWithChatsAndLoansResponseMapper.toResponse(clientsWithDetails);
    }
}
