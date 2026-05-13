declare namespace Express {
    interface Request {
        user?: {
            sub: string;
            sid?: string;
            email?: string;
        };
    }
}
