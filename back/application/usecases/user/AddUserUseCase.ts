import { User } from "../../../domain/entities/User";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { randomUUID } from "crypto";
import { UserState } from "../../../domain/enumerations/UserState";
import { AddUserRequest } from "../../requests/AddUserRequest";
import { AddUserResponse, AddUserResponseMapper } from "../../responses/AddUserResponse";
import { UserAlreadyExistsError } from "../../../domain/errors/UserAlreadyExistsError";   

export class AddUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(request: AddUserRequest): Promise<AddUserResponse> {  
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await this.userRepository.getByEmail(request.email);
        if (existingUser) {
            throw new UserAlreadyExistsError(request.email);
        }

        // Créer l'utilisateur
        const user = new User(
            randomUUID(),
            request.firstName,
            request.lastName,
            request.email,
            request.identityNumber,
            request.passcode,
            request.role,
            UserState.ACTIVE,
            [],
            [],
            [],
            new Date()
        );

        const savedUser = await this.userRepository.add(user);
        return AddUserResponseMapper.toResponse(savedUser);
    }
}
