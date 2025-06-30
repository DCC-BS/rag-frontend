/**
 * User model representing the authenticated user's information
 */
export interface User {
    id: string;
    username: string;
    email: string;
    picture: string;
    organizations: string[];
}

/**
 * API response from GET /users/me endpoint
 */
export interface UserResponse extends User {}
