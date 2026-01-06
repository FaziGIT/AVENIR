import { Request, Response } from 'express';
import { GetUserUseCase } from '../../../../application/usecases/user/GetUserUseCase';
import { GetUsersUseCase } from '../../../../application/usecases/user/GetUsersUseCase';
import { AddUserUseCase } from '../../../../application/usecases/user/AddUserUseCase';
import { RegisterUserUseCase } from '../../../../application/usecases/user/RegisterUserUseCase';
import { VerifyEmailUseCase } from '../../../../application/usecases/user/VerifyEmailUseCase';
import { LoginUserUseCase } from '../../../../application/usecases/user/LoginUserUseCase';
import { GetAdvisorClientsWithChatsAndLoansUseCase } from '../../../../application/usecases/user/GetAdvisorClientsWithChatsAndLoansUseCase';
import { CheckClientAdvisorUseCase } from '../../../../application/usecases/user/CheckClientAdvisorUseCase';
import {
    AddUserRequest,
    RegisterUserRequest,
    VerifyEmailRequest,
    LoginUserRequest,
    GetAdvisorClientsWithChatsAndLoansRequest,
    CheckClientAdvisorRequest,
} from '../../../../application/requests';
import { GetUserRequest } from '../../../../application/requests';
import { GetUsersRequest } from '../../../../application/requests';
import { UserNotFoundError } from '../../../../domain/errors';
import { UserAlreadyExistsError } from '../../../../domain/errors';
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
        private readonly checkClientAdvisorUseCase?: CheckClientAdvisorUseCase
    ) {
        this.jwtService = new JwtService();
    }

    async getUser(req: Request<{ id: string }>, res: Response) {
        try {
            const getUserRequest: GetUserRequest = {
                id: req.params.id,
            };

            const response = await this.getUserUseCase.execute(getUserRequest);
            return res.status(200).json(response);
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                return res.status(404).json({
                    error: 'User not found',
                    message: error.message,
                });
            }

            if (error instanceof ValidationError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.message,
                });
            }

            console.error('Unexpected error:', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async getUsers(req: Request<{}, {}, {}, { role?: string }>, res: Response) {
        try {
            const getUsersRequest: GetUsersRequest = {
                role: req.query.role,
            };

            const response = await this.getUsersUseCase.execute(getUsersRequest);
            return res.status(200).json(response);
        } catch (error) {
            console.error('Unexpected error:', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async addUser(req: Request<{}, {}, AddUserRequest>, res: Response) {
        try {
            const addUserRequest: AddUserRequest = req.body;
            const response = await this.addUserUseCase.execute(addUserRequest);
            return res.status(201).json(response);
        } catch (error) {
            if (error instanceof UserAlreadyExistsError) {
                return res.status(409).json({
                    error: 'User already exists',
                    message: error.message,
                });
            }

            if (error instanceof ValidationError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.message,
                });
            }

            console.error('Unexpected error:', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async registerUser(req: Request<{}, {}, RegisterUserRequest>, res: Response) {
        if (!this.registerUserUseCase) {
            return res.status(500).json({
                error: 'Internal server error',
                message: 'RegisterUserUseCase not configured',
            });
        }

        try {
            const registerUserRequest: RegisterUserRequest = req.body;
            const response = await this.registerUserUseCase.execute(registerUserRequest);
            return res.status(201).json(response);
        } catch (error) {
            if (error instanceof UserAlreadyExistsError) {
                return res.status(409).json({
                    error: 'User already exists',
                    message: error.message,
                });
            }

            if (error instanceof ValidationError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.message,
                });
            }

            console.error('Unexpected error:', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async loginUser(req: Request<{}, {}, LoginUserRequest>, res: Response) {
        if (!this.loginUserUseCase) {
            return res.status(500).json({
                error: 'Internal server error',
                message: 'LoginUserUseCase not configured',
            });
        }

        try {
            const loginUserRequest: LoginUserRequest = req.body;
            const user = await this.loginUserUseCase.execute(loginUserRequest);

            // Create JWT session after successful login
            this.setAuthCookies(res, user.id, user.email);

            return res.status(200).json({
                success: true,
                message: 'Connexion réussie. Bienvenue !',
            });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(401).json({
                    error: 'Authentication failed',
                    message: error.message,
                });
            }

            console.error('Unexpected error:', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async verifyEmail(req: Request<{}, {}, {}, { token: string }>, res: Response) {
        if (!this.verifyEmailUseCase) {
            return res.status(500).json({
                error: 'Internal server error',
                message: 'VerifyEmailUseCase not configured',
            });
        }

        try {
            const verifyEmailRequest: VerifyEmailRequest = {
                token: req.query.token,
            };
            const response = await this.verifyEmailUseCase.execute(verifyEmailRequest);

            // Create JWT session after successful verification
            this.setAuthCookies(res, response.user.id, response.user.email);

            return res.status(200).json(response);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('Invalid') || error.message.includes('expired')) {
                    return res.status(400).json({
                        error: 'Invalid token',
                        message: error.message,
                    });
                }
                if (error.message.includes('already verified')) {
                    return res.status(409).json({
                        error: 'Already verified',
                        message: error.message,
                    });
                }
            }

            console.error('Unexpected error:', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async getCurrentUser(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                });
            }

            const getUserRequest: GetUserRequest = {
                id: req.user.userId,
            };

            const response = await this.getUserUseCase.execute(getUserRequest);

            // Return only specific fields for /me endpoint
            return res.status(200).json({
                user: {
                    id: response.id,
                    firstName: response.firstName,
                    lastName: response.lastName,
                    email: response.email,
                    role: response.role,
                },
            });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                return res.status(404).json({
                    error: 'User not found',
                    message: error.message,
                });
            }

            console.error('Unexpected error:', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async logout(req: Request, res: Response) {
        try {
            res.clearCookie('accessToken', this.cookieOptions);
            res.clearCookie('refreshToken', this.cookieOptions);

            return res.status(200).json({
                success: true,
                message: 'Logged out successfully',
            });
        } catch (error) {
            console.error('Unexpected error:', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async refreshToken(req: Request, res: Response) {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Refresh token missing',
                });
            }

            const payload = this.jwtService.verifyRefreshToken(refreshToken);

            if (!payload) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid or expired refresh token',
                });
            }

            const tokens = this.jwtService.generateTokens({
                userId: payload.userId,
                email: payload.email,
            });

            res.cookie('accessToken', tokens.accessToken, {
                ...this.cookieOptions,
                maxAge: this.ACCESS_TOKEN_MAX_AGE,
            });
            res.cookie('refreshToken', tokens.refreshToken, {
                ...this.cookieOptions,
                maxAge: this.REFRESH_TOKEN_MAX_AGE,
            });

            return res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
            });
        } catch (error) {
            console.error('Unexpected error:', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async getAdvisorClients(req: Request<{ advisorId: string }>, res: Response) {
        if (!this.getAdvisorClientsWithChatsAndLoansUseCase) {
            return res.status(500).json({
                error: 'Internal server error',
                message: 'GetAdvisorClientsWithChatsAndLoansUseCase not configured',
            });
        }

        try {
            const getAdvisorClientsRequest = new GetAdvisorClientsWithChatsAndLoansRequest(req.params.advisorId);

            const response = await this.getAdvisorClientsWithChatsAndLoansUseCase.execute(getAdvisorClientsRequest);
            return res.status(200).json(response);
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                return res.status(404).json({
                    error: 'User not found',
                    message: error.message,
                });
            }

            if (error instanceof Error && error.message === 'User is not an advisor') {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: error.message,
                });
            }

            return res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async checkClientAdvisor(req: Request<{ clientId: string; advisorId: string }>, res: Response) {
        if (!this.checkClientAdvisorUseCase) {
            return res.status(500).json({
                error: 'Internal server error',
                message: 'CheckClientAdvisorUseCase not configured',
            });
        }

        try {
            const checkClientAdvisorRequest = new CheckClientAdvisorRequest(
                req.params.clientId,
                req.params.advisorId
            );

            const response = await this.checkClientAdvisorUseCase.execute(checkClientAdvisorRequest);
            return res.status(200).json(response);
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                return res.status(404).json({
                    error: 'User not found',
                    message: error.message,
                });
            }

            return res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    private setAuthCookies(res: Response, userId: string, email: string) {
        const tokens = this.jwtService.generateTokens({ userId, email });

        res.cookie('accessToken', tokens.accessToken, {
            ...this.cookieOptions,
            maxAge: this.ACCESS_TOKEN_MAX_AGE,
        });
        res.cookie('refreshToken', tokens.refreshToken, {
            ...this.cookieOptions,
            maxAge: this.REFRESH_TOKEN_MAX_AGE,
        });
    }
}
