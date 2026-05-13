export interface UserPayload {
    sub: string;
    sid?: string;
    email?: string;
}

export interface User {
    id: string;
    code_unique: string;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
    dob: Date;
    bio: string;
    status: string;
    email_verified: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface UserRegisDTO {
    id?: string;
    code_unique: string;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    role_id: string;
}

export interface UserLoginDTO {
    email: string;
    password: string;
}