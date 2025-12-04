import { User } from "../../../domain/entities/User";
import { UserRepository } from "../../ports/repositories/UserRepository";

export class GetUserUseCase {
    public constructor(
        private readonly userRepository: UserRepository,
    ) {}

    public async execute(id: string): Promise<User | null> {
        return await this.userRepository.getById(id);
    }
}


