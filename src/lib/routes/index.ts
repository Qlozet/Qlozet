export const AUTH_ROUTES = {
    accountVerification: "/account-verification",
    login: "/login",
    signin: "/auth/signin",
    signIn: "/auth/sign-in",
    register: "/register",
    signup: "/signup",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/reset-password",
    createNewPassword: "/auth/create-new-password",
    verification: "/auth/verification",
    verifyAccountMessage: "/verify-account-message",
    authPropertyDetails: "/auth-property-details",
} as const;

export const APP_ROUTES = {
    home: "/",
    dashboard: "/dashboard",
    products: "/products",
    productsCloth: "/products/cloths",
    productsFabrics: "/products/fabrics",
    add: "/add",
    details: "/details",
    cookiePolicy: "/cookie-policy",
    privacyPolicy: "/privacy-policy",
    termsOfService: "/terms-of-service",
} as const;