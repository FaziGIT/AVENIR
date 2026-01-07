import { UserRepository } from "../../../domain/repositories/UserRepository";
import { NotificationRepository } from "../../../domain/repositories/NotificationRepository";
import { UserNotFoundError } from "../../../domain/errors";
import { ActivateUserRequest } from "../../requests";
import { UserState } from "../../../domain/enumerations/UserState";
import { User } from "../../../domain/entities/User";
import { Notification } from "../../../domain/entities/Notification";
import { NotificationType } from "@avenir/shared/enums";
import { randomUUID } from "crypto";

export class ActivateUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly notificationRepository: NotificationRepository
    ) {}

    async execute(request: ActivateUserRequest): Promise<void> {
        const user = await this.userRepository.getById(request.userId);
        if (!user) {
            throw new UserNotFoundError(request.userId);
        }

        // Créer un nouvel utilisateur avec le state ACTIVE
        const activatedUser = new User(
            user.id,
            user.firstName,
            user.lastName,
            user.email,
            user.identityNumber,
            user.passcode,
            user.role,
            UserState.ACTIVE,
            user.accounts,
            user.loans,
            user.orders,
            user.createdAt,
            user.verificationToken,
            user.verifiedAt,
            user.advisorId
        );

        await this.userRepository.update(activatedUser);

        const notification = new Notification(
            randomUUID(),
            request.userId,
            "Compte réactivé",
            "Votre compte a été réactivé. Vous pouvez à nouveau accéder à vos services bancaires. Si vous aviez des crédits en cours, ils restent dans l'état où ils étaient lors du bannissement.",
            NotificationType.LOAN,
            "Système",
            false,
            new Date()
        );

        await this.notificationRepository.addNotification(notification);
    }
}
