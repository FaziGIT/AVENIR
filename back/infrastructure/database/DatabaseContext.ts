import { UserRepository } from '../../application/ports/repositories/UserRepository';

export interface DatabaseContext {
    userRepository: UserRepository;
    close(): Promise<void>;
}
