import { UserRepository } from '../../domain/repositories/UserRepository';

export interface DatabaseContext {
    userRepository: UserRepository;
    close(): Promise<void>;
}
