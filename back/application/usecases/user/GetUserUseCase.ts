import { User } from "../../../domain/entities/User";
import { UserRepository } from "../../ports/repositories/UserRepository";

export class GetUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(id: string): Promise<User | null> {
        return this.userRepository.getById(id);
    }
}
