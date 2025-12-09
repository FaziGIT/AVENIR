import { UserRole } from "../../domain/enumerations/UserRole";

export interface AddUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    identityNumber: string;
    passcode: string;
    role: UserRole;
}
