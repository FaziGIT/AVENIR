import { UserRepository } from "../../../domain/repositories/UserRepository";
import * as bcrypt from "bcrypt";
import { LoginUserRequest } from "../../requests";
import { UserState } from "../../../domain/enumerations/UserState";
import { InvalidCredentialsError, InactiveAccountError, BannedAccountError } from "../../../domain/errors";
import { User } from "../../../domain/entities/User";

export class LoginUserUseCase {
    constructor(
        private readonly userRepository: UserRepository
    ) {}

    async execute(request: LoginUserRequest): Promise<User> {
        // Find user by identity number
        const user = await this.userRepository.getByIdentityNumber(request.identityNumber);

        if (!user) {
            throw new InvalidCredentialsError();
        }

        // Check if account is banned
        if (user.state === UserState.BANNED) {
            throw new BannedAccountError();
        }

        // Check if account is active (email verified)
        if (user.state !== UserState.ACTIVE) {
            throw new InactiveAccountError();
        }

        // Verify passcode
        const isPasscodeValid = await bcrypt.compare(request.passcode, user.passcode);

        if (!isPasscodeValid) {
            throw new InvalidCredentialsError();
        }

        return user;
    }
}
