import AzureADProvider from "next-auth/providers/azure-ad";
import { NuxtAuthHandler } from "#auth";

// Interface for extended token with expiration info
interface ExtendedToken {
    idToken?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    provider?: string;
    error?: string;
}

// Function to refresh Azure AD access token
async function refreshAzureAccessToken(
    token: ExtendedToken,
): Promise<ExtendedToken> {
    try {
        if (!token.refreshToken) {
            return {
                ...token,
                error: "RefreshAccessTokenError",
            };
        }

        const tenantId = useRuntimeConfig().azureAdTenantId;
        const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: useRuntimeConfig().azureAdClientId,
                client_secret: useRuntimeConfig().azureAdClientSecret,
                grant_type: "refresh_token",
                refresh_token: token.refreshToken,
                scope: "openid email profile",
            }),
            method: "POST",
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw refreshedTokens;
        }

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            idToken: refreshedTokens.id_token,
            expiresAt: Math.floor(
                Date.now() / 1000 + refreshedTokens.expires_in,
            ),
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };
    } catch (error) {
        console.error("Error refreshing Azure access token:", error);
        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}

export default NuxtAuthHandler({
    secret: useRuntimeConfig().authSecret,
    providers: [
        // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
        AzureADProvider.default({
            clientId: useRuntimeConfig().azureAdClientId,
            clientSecret: useRuntimeConfig().azureAdClientSecret,
            tenantId: useRuntimeConfig().azureAdTenantId,
            authorization: {
                params: {
                    scope: "openid email profile offline_access", // offline_access for refresh token
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            const extendedToken = token as ExtendedToken;

            // Initial sign in
            if (account) {
                extendedToken.idToken = account.id_token;
                extendedToken.accessToken = account.access_token;
                extendedToken.refreshToken = account.refresh_token;
                extendedToken.provider = account.provider;
                // Set expiration time (default to 1 hour if not provided)
                extendedToken.expiresAt =
                    account.expires_at ?? Math.floor(Date.now() / 1000 + 3600);
                return extendedToken;
            }

            // Return previous token if the access token has not expired yet
            if (
                extendedToken.expiresAt &&
                Date.now() < extendedToken.expiresAt * 1000
            ) {
                return extendedToken;
            }

            // Access token has expired, try to refresh it
            console.log("Token expired, attempting to refresh...");

            if (extendedToken.refreshToken) {
                if (extendedToken.provider === "azure-ad") {
                    return await refreshAzureAccessToken(extendedToken);
                }
            }

            // If refresh failed or no refresh token, return error
            return {
                ...extendedToken,
                error: "RefreshAccessTokenError",
            };
        },
        async session({ session, token }) {
            const extendedToken = token as ExtendedToken;

            // Pass error to session if token refresh failed
            if (extendedToken.error) {
                (session as any).error = extendedToken.error;
            }

            if (extendedToken.idToken) {
                (session as any).idToken = extendedToken.idToken;
            }

            if (extendedToken.accessToken) {
                (session as any).accessToken = extendedToken.accessToken;
            }

            return session;
        },
    },
});
