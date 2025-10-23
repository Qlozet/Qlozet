export const AUTH_ROUTES = {
  accountVerification: '/account-verification',
  signIn: '/auth/sign-in',
  register: '/register',
  signup: '/auth/sign-up',
  forgotPassword: '/auth/forgot-password',
  passwordResetCodeSent: '/auth/forgot-password/code-sent',
  resetPassword: '/auth/reset-password',
  createNewPassword: '/auth/create-new-password',
  verification: '/auth/verification',
  verifyAccountMessage: '/verify-account-message',
  awaitingVerification: '/auth/sign-up/awaiting-verification',
} as const;

export const APP_ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  products: '/products',
  productsCloth: '/products/cloths',
  productsFabrics: '/products/fabrics',
  add: '/add',
  details: '/details',
  cookiePolicy: '/cookie-policy',
  privacyPolicy: '/privacy-policy',
  termsOfService: '/terms-of-service',
} as const;
