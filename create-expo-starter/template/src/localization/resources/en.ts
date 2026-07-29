/**
 * English translations — the source of truth for all UI copy.
 *
 * Keys are grouped by namespace; reuse `common.*` wherever possible. Keep keys
 * stable and additive, and mirror every key in fr.ts (the `TranslationSchema`
 * type below makes a missing key a compile error, not a runtime blank).
 */
const en = {
  common: {
    appName: "My App",
    continue: "Continue",
    next: "Next",
    back: "Back",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    saveChanges: "Save changes",
    done: "Done",
    submit: "Submit",
    skip: "Skip",
    edit: "Edit",
    delete: "Delete",
    remove: "Remove",
    add: "Add",
    apply: "Apply",
    retry: "Retry",
    close: "Close",
    ok: "OK",
    yes: "Yes",
    no: "No",
    search: "Search",
    seeAll: "See all",
    loading: "Loading…",
    optional: "Optional",
    required: "Required",
    today: "Today",
    tomorrow: "Tomorrow",
    date: "Date",
    time: "Time",
    name: "Name",
    email: "Email",
    phone: "Phone",
    select: "Select",
    selectDate: "Select date",
    update: "Update",
    reset: "Reset",
    somethingWrong: "Something went wrong. Please try again.",
    uploadImage: "Upload image",
    uploadFormatsHint: "Supports JPG, PNG and PDF",
  },

  errors: {
    network: "Can't reach the server. Check your connection and try again.",
    timeout: "The request timed out. Please try again.",
    unauthorized: "Your session expired. Please sign in again.",
    forbidden: "You don't have access to this.",
    notFound: "We couldn't find what you were looking for.",
    server: "Something went wrong on our end. Please try again shortly.",
    unknown: "Something went wrong. Please try again.",
  },

  validation: {
    required: "This field is required",
    invalidEmail: "Enter a valid email address",
    tooShort: "Must be at least {{count}} characters",
    passwordsMismatch: "Passwords don't match",
  },

  auth: {
    loginTitle: "Welcome back",
    loginSubtitle: "Sign in to continue",
    signUpTitle: "Create your account",
    signUpSubtitle: "It only takes a minute",
    emailAddress: "Email address",
    enterEmail: "you@example.com",
    password: "Password",
    enterPassword: "Enter your password",
    forgotPassword: "Forgot password?",
    login: "Sign in",
    signUp: "Sign up",
    logOut: "Sign out",
    logOutConfirm: "Are you sure you want to sign out?",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    orContinueWith: "or continue with",
    verifyTitle: "Verify your account",
    verifySubtitle: "Enter the {{count}}-digit code we sent you.",
    resendCode: "Resend code",
    resendIn: "Resend in {{seconds}}s",
    verify: "Verify",
  },

  tabs: {
    home: "Home",
    components: "Components",
    profile: "Profile",
  },

  profile: {
    title: "Profile",
    editProfile: "Edit profile",
    accountSettings: "Account settings",
    appearance: "Appearance",
    appearanceSystem: "System",
    appearanceLight: "Light",
    appearanceDark: "Dark",
    notifications: "Notifications",
    language: "Language",
    privacyPolicy: "Privacy policy",
    termsConditions: "Terms & conditions",
    helpSupport: "Help & support",
  },

  language: {
    settingsTitle: "Language",
    settingsSubtitle: "Choose the language used across the app.",
    selectLabel: "Language",
    changedTo: "Language changed to {{language}}",
  },

  notifications: {
    title: "Notifications",
    preferences: "Notification preferences",
    push: "Push notifications",
    email: "Email notifications",
    sms: "SMS notifications",
    empty: "No notifications yet",
    emptySubtitle: "We'll let you know when something happens.",
    markAllRead: "Mark all as read",
  },

  emptyState: {
    title: "Nothing here yet",
    subtitle: "Content will appear here once there's something to show.",
  },

  imagePicker: {
    title: "Add photo",
    updatePhoto: "Update photo",
    subtitle: "Choose how you'd like to set your picture",
    openCamera: "Open camera",
    openCameraCaption: "Take a new photo",
    chooseFromGallery: "Choose from gallery",
    galleryCaption: "Pick from your library",
    removePhoto: "Remove photo",
    permissionDenied: "Permission denied. Enable access in Settings.",
  },
};

export type TranslationSchema = typeof en;
export default en;
