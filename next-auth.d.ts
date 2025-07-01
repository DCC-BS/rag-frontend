import type { DefaultSession } from "next-auth";

declare module "next-auth" {
    /* Returned by `useAuth`, `getSession` and `getServerSession` */
    interface Session extends DefaultSession {
        user: {
            id: string;
            name: string;
            email: string;
            picture: string;
            organizations: string[];
        } & DefaultSession["user"];
        accessToken?: string;
        idToken?: string;
        error?: string;
    }
}

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `getToken` */
    interface JWT {
        idToken?: string;
        accessToken?: string;
        refreshToken?: string;
        expiresAt?: number;
        provider?: string;
        error?: string;
        // Azure AD profile data
        sub?: string;
        email?: string;
        name?: string;
        picture?: string;
        roles?: string[];
    }
}
