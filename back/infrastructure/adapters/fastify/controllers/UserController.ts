import { FastifyRequest, FastifyReply } from 'fastify';
import { GetUserUseCase } from '../../../../application/usecases/user/GetUserUseCase';
import { GetUsersUseCase } from '../../../../application/usecases/user/GetUsersUseCase';
import { AddUserUseCase } from '../../../../application/usecases/user/AddUserUseCase';
import { RegisterUserUseCase } from '../../../../application/usecases/user/RegisterUserUseCase';
import { VerifyEmailUseCase } from '../../../../application/usecases/user/VerifyEmailUseCase';
import { LoginUserUseCase } from '../../../../application/usecases/user/LoginUserUseCase';
import { GetAdvisorClientsWithChatsAndLoansUseCase } from '../../../../application/usecases/user/GetAdvisorClientsWithChatsAndLoansUseCase';
import { GetAllClientsWithDetailsUseCase } from '../../../../application/usecases/user/GetAllClientsWithDetailsUseCase';
import { CheckClientAdvisorUseCase } from '../../../../application/usecases/user/CheckClientAdvisorUseCase';
import { BanUserWithAssetsHandlingUseCase } from '../../../../application/usecases/user/BanUserWithAssetsHandlingUseCase';
import { ActivateUserUseCase } from '../../../../application/usecases/user/ActivateUserUseCase';
import { DeleteUserWithIBANTransferUseCase } from '../../../../application/usecases/user/DeleteUserWithIBANTransferUseCase';
import {
    AddUserRequest,
    RegisterUserRequest,
    VerifyEmailRequest,
    LoginUserRequest,
    GetAdvisorClientsWithChatsAndLoansRequest,
    GetAllClientsWithDetailsRequest,
    CheckClientAdvisorRequest,
    ActivateUserRequest
} from '../../../../application/requests';
import { GetUserRequest } from '../../../../application/requests';
import { GetUsersRequest } from '../../../../application/requests';
import { UserNotFoundError } from '../../../../domain/errors';
import { UserAlreadyExistsError } from '../../../../domain/errors';
import { BannedAccountError } from '../../../../domain/errors';
import { ValidationError } from '../../../../application/errors';
import { JwtService } from '../../auth/JwtService';

export class UserController {
    private readonly jwtService: JwtService;
    private readonly cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
    };
    private readonly ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
    private readonly REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

    constructor(
        private readonly getUserUseCase: GetUserUseCase,
        private readonly getUsersUseCase: GetUsersUseCase,
        private readonly addUserUseCase: AddUserUseCase,
        private readonly registerUserUseCase?: RegisterUserUseCase,
        private readonly verifyEmailUseCase?: VerifyEmailUseCase,
        private readonly loginUserUseCase?: LoginUserUseCase,
        private readonly getAdvisorClientsWithChatsAndLoansUseCase?: GetAdvisorClientsWithChatsAndLoansUseCase,
        private readonly getAllClientsWithDetailsUseCase?: GetAllClientsWithDetailsUseCase,
        private readonly checkClientAdvisorUseCase?: CheckClientAdvisorUseCase,
        private readonly banUserWithAssetsHandlingUseCase?: BanUserWithAssetsHandlingUseCase,
        private readonly activateUserUseCase?: ActivateUserUseCase,
        private readonly deleteUserUseCase?: DeleteUserWithIBANTransferUseCase,
    ) {
        this.jwtService = new JwtService();
    }

    async getUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const getUserRequest: GetUserRequest = {
                id: request.params.id,
            };

            const response = await this.getUserUseCase.execute(getUserRequest);
            return reply.code(200).send(response);
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                return reply.code(404).send({
                    error: 'User not found',
                    message: error.message,
                });
            }

            if (error instanceof ValidationError) {
                return reply.code(400).send({
                    error: 'Validation error',
                    message: error.message,
                });
            }

            console.error('Unexpected error:', error);
            return reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async getUsers(request: FastifyRequest<{ Querystring: { role?: string } }>, reply: FastifyReply) {
        try {
            const getUsersRequest: GetUsersRequest = {
                role: request.query.role,
            };

            const response = await this.getUsersUseCase.execute(getUsersRequest);
            return reply.code(200).send(response);
        } catch (error) {
            console.error('Unexpected error:', error);
            return reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async addUser(request: FastifyRequest<{ Body: AddUserRequest }>, reply: FastifyReply) {
        try {
            const addUserRequest: AddUserRequest = request.body;
            const response = await this.addUserUseCase.execute(addUserRequest);
            return reply.code(201).send(response);
        } catch (error) {
            if (error instanceof UserAlreadyExistsError) {
                return reply.code(409).send({
                    error: 'User already exists',
                    message: error.message,
                });
            }

            if (error instanceof ValidationError) {
                return reply.code(400).send({
                    error: 'Validation error',
                    message: error.message
                });
            }

            console.error('Unexpected error:', error);
            return reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async registerUser(request: FastifyRequest<{ Body: RegisterUserRequest }>, reply: FastifyReply) {
        if (!this.registerUserUseCase) {
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'RegisterUserUseCase not configured',
            });
        }

        try {
            const registerUserRequest: RegisterUserRequest = request.body;
            const response = await this.registerUserUseCase.execute(registerUserRequest);
            return reply.code(201).send(response);
        } catch (error) {
            if (error instanceof UserAlreadyExistsError) {
                return reply.code(409).send({
                    error: 'User already exists',
                    message: error.message,
                });
            }

            if (error instanceof ValidationError) {
                return reply.code(400).send({
                    error: 'Validation error',
                    message: error.message
                });
            }

            console.error('Unexpected error:', error);
            return reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async loginUser(request: FastifyRequest<{ Body: LoginUserRequest }>, reply: FastifyReply) {
        if (!this.loginUserUseCase) {
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'LoginUserUseCase not configured',
            });
        }

        try {
            const loginUserRequest: LoginUserRequest = request.body;
            const user = await this.loginUserUseCase.execute(loginUserRequest);

            // Create JWT session after successful login
            this.setAuthCookies(reply, user.id, user.email);

            return reply.code(200).send({
                success: true,
                message: 'Connexion réussie. Bienvenue !',
            });
        } catch (error) {
            if (error instanceof BannedAccountError) {
                return reply.code(403).send({
                    error: 'Account banned',
                    message: error.message,
                    isBanned: true,
                });
            }

            if (error instanceof Error) {
                return reply.code(401).send({
                    error: 'Authentication failed',
                    message: error.message,
                });
            }

            console.error('Unexpected error:', error);
            return reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async verifyEmail(request: FastifyRequest<{ Querystring: { token: string } }>, reply: FastifyReply) {
        if (!this.verifyEmailUseCase) {
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'VerifyEmailUseCase not configured',
            });
        }

        try {
            const verifyEmailRequest: VerifyEmailRequest = {
                token: request.query.token
            };
            const response = await this.verifyEmailUseCase.execute(verifyEmailRequest);

            // Create JWT session after successful verification
            this.setAuthCookies(reply, response.user.id, response.user.email);

            return reply.code(200).send(response);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('Invalid') || error.message.includes('expired')) {
                    return reply.code(400).send({
                        error: 'Invalid token',
                        message: error.message,
                    });
                }
                if (error.message.includes('already verified')) {
                    return reply.code(409).send({
                        error: 'Already verified',
                        message: error.message,
                    });
                }
            }

            console.error('Unexpected error:', error);
            return reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
        try {
            console.log('[getCurrentUser] request.user:', request.user);

            if (!request.user) {
                return reply.code(401).send({
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                });
            }

            console.log('[getCurrentUser] request.user.userId:', request.user.userId);

            const getUserRequest: GetUserRequest = {
                id: request.user.userId,
            };

            const response = await this.getUserUseCase.execute(getUserRequest);

            // Return only specific fields for /me endpoint
            return reply.code(200).send({
                user: {
                    id: response.id,
                    firstName: response.firstName,
                    lastName: response.lastName,
                    email: response.email,
                    role: response.role,
                    state: response.state,
                }
            });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                return reply.code(404).send({
                    error: 'User not found',
                    message: error.message,
                });
            }

            console.error('Unexpected error:', error);
            return reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async logout(request: FastifyRequest, reply: FastifyReply) {
        try {
            reply
                .clearCookie('accessToken', this.cookieOptions)
                .clearCookie('refreshToken', this.cookieOptions);

            return reply.code(200).send({
                success: true,
                message: 'Logged out successfully',
            });
        } catch (error) {
            console.error('Unexpected error:', error);
            return reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async refreshToken(request: FastifyRequest, reply: FastifyReply) {
        try {
            const refreshToken = request.cookies.refreshToken;

            if (!refreshToken) {
                return reply.code(401).send({
                    error: 'Unauthorized',
                    message: 'Refresh token missing',
                });
            }

            const payload = this.jwtService.verifyRefreshToken(refreshToken);

            if (!payload) {
                return reply.code(401).send({
                    error: 'Unauthorized',
                    message: 'Invalid or expired refresh token',
                });
            }

            const tokens = this.jwtService.generateTokens({
                userId: payload.userId,
                email: payload.email,
            });

            reply
                .setCookie('accessToken', tokens.accessToken, {
                    ...this.cookieOptions,
                    maxAge: this.ACCESS_TOKEN_MAX_AGE,
                })
                .setCookie('refreshToken', tokens.refreshToken, {
                    ...this.cookieOptions,
                    maxAge: this.REFRESH_TOKEN_MAX_AGE,
                });

            return reply.code(200).send({
                success: true,
                message: 'Token refreshed successfully',
            });
        } catch (error) {
            console.error('Unexpected error:', error);
            return reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async getAdvisorClients(request: FastifyRequest<{ Params: { advisorId: string } }>, reply: FastifyReply) {
        if (!this.getAdvisorClientsWithChatsAndLoansUseCase) {
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'GetAdvisorClientsWithChatsAndLoansUseCase not configured',
            });
        }

        try {
            const getAdvisorClientsRequest = new GetAdvisorClientsWithChatsAndLoansRequest(
                request.params.advisorId
            );

            const response = await this.getAdvisorClientsWithChatsAndLoansUseCase.execute(getAdvisorClientsRequest);
            return reply.code(200).send(response);
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                return reply.code(404).send({
                    error: 'User not found',
                    message: error.message,
                });
            }

            if (error instanceof Error && error.message === 'User is not an advisor') {
                return reply.code(403).send({
                    error: 'Forbidden',
                    message: error.message,
                });
            }

            return reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async checkClientAdvisor(
        request: FastifyRequest<{ Params: { clientId: string; advisorId: string } }>,
        reply: FastifyReply
    ) {
        if (!this.checkClientAdvisorUseCase) {
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'CheckClientAdvisorUseCase not configured',
            });
        }

        try {
            const checkClientAdvisorRequest = new CheckClientAdvisorRequest(
                request.params.clientId,
                request.params.advisorId
            );

            const response = await this.checkClientAdvisorUseCase.execute(checkClientAdvisorRequest);
            return reply.code(200).send(response);
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                return reply.code(404).send({
                    error: 'User not found',
                    message: error.message,
                });
            }

            return reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async getAllClientsWithDetails(
        request: FastifyRequest<{ Params: { directorId: string } }>,
        reply: FastifyReply
    ) {
        if (!this.getAllClientsWithDetailsUseCase) {
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'GetAllClientsWithDetailsUseCase not configured',
            });
        }

        try {
            const getAllClientsRequest = new GetAllClientsWithDetailsRequest(
                request.params.directorId
            );

            const response = await this.getAllClientsWithDetailsUseCase.execute(getAllClientsRequest);
            return reply.code(200).send(response);
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                return reply.code(404).send({
                    error: 'User not found',
                    message: error.message,
                });
            }

            if (error instanceof Error && error.message === 'User is not a director') {
                return reply.code(403).send({
                    error: 'Forbidden',
                    message: error.message,
                });
            }

            return reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }


    async banUser(request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
        try {
            if (!this.banUserWithAssetsHandlingUseCase) {
                return reply.code(501).send({
                    error: 'Not Implemented',
                    message: 'Ban user use case is not available',
                });
            }

            const result = await this.banUserWithAssetsHandlingUseCase.execute({
                userId: request.params.userId,
            });

            return reply.code(200).send({
                message: 'User banned successfully',
                details: result,
            });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                return reply.code(404).send({
                    error: 'User not found',
                    message: error.message,
                });
            }

            return reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async activateUser(request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
        try {
            if (!this.activateUserUseCase) {
                return reply.code(501).send({
                    error: 'Not Implemented',
                    message: 'Activate user use case is not available',
                });
            }

            const activateRequest: ActivateUserRequest = {
                userId: request.params.userId,
            };

            await this.activateUserUseCase.execute(activateRequest);

            return reply.code(200).send({
                message: 'User activated successfully',
            });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                return reply.code(404).send({
                    error: 'User not found',
                    message: error.message,
                });
            }

            return reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async deleteUser(
        request: FastifyRequest<{
            Params: { userId: string };
            Body: { transferIBAN: string };
        }>,
        reply: FastifyReply
    ) {
        try {
            if (!this.deleteUserUseCase) {
                return reply.code(501).send({
                    error: 'Not Implemented',
                    message: 'Delete user use case is not available',
                });
            }

            const result = await this.deleteUserUseCase.execute({
                userId: request.params.userId,
                transferIBAN: request.body.transferIBAN,
            });

            return reply.code(200).send({
                message: 'User deleted successfully',
                data: result,
            });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                return reply.code(404).send({
                    error: 'User not found',
                    message: error.message,
                });
            }

            if (error instanceof ValidationError) {
                return reply.code(400).send({
                    error: 'Validation error',
                    message: error.message,
                });
            }

            return reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    private setAuthCookies(reply: FastifyReply, userId: string, email: string) {
        const tokens = this.jwtService.generateTokens({ userId, email });

        reply
            .setCookie('accessToken', tokens.accessToken, {
                ...this.cookieOptions,
                maxAge: this.ACCESS_TOKEN_MAX_AGE,
            })
            .setCookie('refreshToken', tokens.refreshToken, {
                ...this.cookieOptions,
                maxAge: this.REFRESH_TOKEN_MAX_AGE,
            });
    }
}
