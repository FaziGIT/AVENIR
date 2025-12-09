import { User } from "../../domain/entities/User";

export interface AddUserResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    identityNumber: string;
    role: string;
    state: string;
    createdAt: Date;
}

export class AddUserResponseMapper {
    static toResponse(user: User): AddUserResponse {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            identityNumber: user.identityNumber,
            role: user.role,
            state: user.state,
            createdAt: user.createdAt,
        };
    }
}