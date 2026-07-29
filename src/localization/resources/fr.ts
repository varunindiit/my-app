import type { TranslationSchema } from "./en";

/**
 * French translations.
 *
 * Typed as `TranslationSchema`, so adding a key to en.ts without adding it here
 * is a compile error rather than a blank string in the UI.
 */
const fr: TranslationSchema = {
  common: {
    appName: "Mon application",
    continue: "Continuer",
    next: "Suivant",
    back: "Retour",
    cancel: "Annuler",
    confirm: "Confirmer",
    save: "Enregistrer",
    saveChanges: "Enregistrer les modifications",
    done: "Terminé",
    submit: "Envoyer",
    skip: "Passer",
    edit: "Modifier",
    delete: "Supprimer",
    remove: "Retirer",
    add: "Ajouter",
    apply: "Appliquer",
    retry: "Réessayer",
    close: "Fermer",
    ok: "OK",
    yes: "Oui",
    no: "Non",
    search: "Rechercher",
    seeAll: "Tout voir",
    loading: "Chargement…",
    optional: "Facultatif",
    required: "Obligatoire",
    today: "Aujourd'hui",
    tomorrow: "Demain",
    date: "Date",
    time: "Heure",
    name: "Nom",
    email: "E-mail",
    phone: "Téléphone",
    select: "Sélectionner",
    selectDate: "Choisir une date",
    update: "Mettre à jour",
    reset: "Réinitialiser",
    somethingWrong: "Une erreur s'est produite. Veuillez réessayer.",
    uploadImage: "Téléverser une image",
    uploadFormatsHint: "Formats acceptés : JPG, PNG et PDF",
  },

  errors: {
    network: "Serveur injoignable. Vérifiez votre connexion et réessayez.",
    timeout: "La requête a expiré. Veuillez réessayer.",
    unauthorized: "Votre session a expiré. Veuillez vous reconnecter.",
    forbidden: "Vous n'avez pas accès à cet élément.",
    notFound: "Nous n'avons pas trouvé ce que vous cherchiez.",
    server: "Une erreur est survenue de notre côté. Réessayez sous peu.",
    unknown: "Une erreur s'est produite. Veuillez réessayer.",
  },

  validation: {
    required: "Ce champ est obligatoire",
    invalidEmail: "Saisissez une adresse e-mail valide",
    tooShort: "Doit contenir au moins {{count}} caractères",
    passwordsMismatch: "Les mots de passe ne correspondent pas",
  },

  auth: {
    loginTitle: "Bon retour",
    loginSubtitle: "Connectez-vous pour continuer",
    signUpTitle: "Créez votre compte",
    signUpSubtitle: "Cela ne prend qu'une minute",
    emailAddress: "Adresse e-mail",
    enterEmail: "vous@exemple.com",
    password: "Mot de passe",
    enterPassword: "Saisissez votre mot de passe",
    forgotPassword: "Mot de passe oublié ?",
    login: "Se connecter",
    signUp: "S'inscrire",
    logOut: "Se déconnecter",
    logOutConfirm: "Voulez-vous vraiment vous déconnecter ?",
    noAccount: "Vous n'avez pas de compte ?",
    haveAccount: "Vous avez déjà un compte ?",
    orContinueWith: "ou continuer avec",
    verifyTitle: "Vérifiez votre compte",
    verifySubtitle:
      "Saisissez le code à {{count}} chiffres que nous vous avons envoyé.",
    resendCode: "Renvoyer le code",
    resendIn: "Renvoyer dans {{seconds}} s",
    verify: "Vérifier",
  },

  tabs: {
    home: "Accueil",
    components: "Composants",
    profile: "Profil",
  },

  profile: {
    title: "Profil",
    editProfile: "Modifier le profil",
    accountSettings: "Paramètres du compte",
    appearance: "Apparence",
    appearanceSystem: "Système",
    appearanceLight: "Clair",
    appearanceDark: "Sombre",
    notifications: "Notifications",
    language: "Langue",
    privacyPolicy: "Politique de confidentialité",
    termsConditions: "Conditions générales",
    helpSupport: "Aide et assistance",
  },

  language: {
    settingsTitle: "Langue",
    settingsSubtitle: "Choisissez la langue utilisée dans l'application.",
    selectLabel: "Langue",
    changedTo: "Langue changée en {{language}}",
  },

  notifications: {
    title: "Notifications",
    preferences: "Préférences de notification",
    push: "Notifications push",
    email: "Notifications par e-mail",
    sms: "Notifications par SMS",
    empty: "Aucune notification",
    emptySubtitle: "Nous vous préviendrons dès qu'il se passe quelque chose.",
    markAllRead: "Tout marquer comme lu",
  },

  emptyState: {
    title: "Rien pour le moment",
    subtitle: "Le contenu apparaîtra ici dès qu'il y en aura.",
  },

  imagePicker: {
    title: "Ajouter une photo",
    updatePhoto: "Mettre à jour la photo",
    subtitle: "Choisissez comment définir votre photo",
    openCamera: "Ouvrir l'appareil photo",
    openCameraCaption: "Prendre une nouvelle photo",
    chooseFromGallery: "Choisir dans la galerie",
    galleryCaption: "Sélectionner depuis votre bibliothèque",
    removePhoto: "Supprimer la photo",
    permissionDenied: "Autorisation refusée. Activez l'accès dans les Réglages.",
  },
};

export default fr;
