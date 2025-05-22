import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { NuxtAuthHandler } from "#auth";

export default NuxtAuthHandler({
    secret: useRuntimeConfig().authSecret,
    providers: [
        // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
        GoogleProvider.default({
            clientId: useRuntimeConfig().googleClientId,
            clientSecret: useRuntimeConfig().googleClientSecret,
            authorization: { params: { scope: "openid email profile" } },
        }),
        // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
        AzureADProvider.default({
            clientId: useRuntimeConfig().azureAdClientId,
            clientSecret: useRuntimeConfig().azureAdClientSecret,
            tenantId: useRuntimeConfig().azureAdTenantId,
            authorization: { params: { scope: "openid email profile" } },
        }),
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account?.id_token) {
                token.idToken = account.id_token;
            }

            if (account?.access_token) {
                token.accessToken = account.access_token;
            }

            return token;
        },
        async session({ session, token }) {
            if (token.idToken) {
                (session as any).idToken = token.idToken;
            }

            if (token.accessToken) {
                (session as any).accessToken = token.accessToken;
            }

            return session;
        },
    },
});
