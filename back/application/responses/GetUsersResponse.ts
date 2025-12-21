import { User } from "../../domain/entities/User";

export interface GetUsersResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    identityNumber: string;
    role: string;
    state: string;
    createdAt: string;
}

export class GetUsersResponseMapper {
    static toResponse(user: User): GetUsersResponse {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            identityNumber: user.identityNumber,
            role: user.role,
            state: user.state,
            createdAt: user.createdAt.toISOString(),
        };
    }

    static toResponseList(users: User[]): GetUsersResponse[] {
        return users.map(user => this.toResponse(user));
    }
}
