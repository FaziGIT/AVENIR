import { UserRepository } from "../../../domain/repositories/UserRepository";
import { GetUsersRequest } from "../../requests";
import { GetUsersResponse, GetUsersResponseMapper } from "../../responses";

export class GetUsersUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(request: GetUsersRequest): Promise<GetUsersResponse[]> {
        const users = await this.userRepository.getAll();

        let filteredUsers = users;
        if (request.role) {
            filteredUsers = users.filter(user => user.role === request.role);
        }

        return GetUsersResponseMapper.toResponseList(filteredUsers);
    }
}
