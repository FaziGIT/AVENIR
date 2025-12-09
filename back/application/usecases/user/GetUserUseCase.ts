import { UserRepository } from "../../../domain/repositories/UserRepository";
import { GetUserRequest } from "../../requests/GetUserRequest";
import { GetUserResponse, GetUserResponseMapper } from "../../responses/GetUserResponse";
import { UserNotFoundError } from "../../../domain/errors/UserNotFoundError";
import { ValidationError } from "../../errors/ValidationError";

export class GetUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(request: GetUserRequest): Promise<GetUserResponse> {
        // Validation
        if (!request.id || request.id.trim().length === 0) {
            throw new ValidationError("User ID is required", "id");
        }

        // Récupérer l'utilisateur
        const user = await this.userRepository.getById(request.id);
        
        if (!user) {
            throw new UserNotFoundError(request.id);
        }

        return GetUserResponseMapper.toResponse(user);
    }
}
