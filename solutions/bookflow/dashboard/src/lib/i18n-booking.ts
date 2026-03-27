export type BookingLocale = 'fr' | 'en';

const translations = {
  fr: {
    // Stepper
    stepService: 'Service',
    stepDate: 'Date',
    stepTime: 'Horaire',
    stepInfo: 'Infos',
    stepperAria: 'Progression de la réservation',
    stepCompleted: 'complété',
    stepCurrent: 'en cours',
    stepAriaText: (current: number, total: number, label: string) =>
      `Étape ${current} sur ${total} : ${label}`,

    // Day labels (short)
    daySun: 'Dim',
    dayMon: 'Lun',
    dayTue: 'Mar',
    dayWed: 'Mer',
    dayThu: 'Jeu',
    dayFri: 'Ven',
    daySat: 'Sam',

    // Day labels (full)
    dayFullSun: 'Dimanche',
    dayFullMon: 'Lundi',
    dayFullTue: 'Mardi',
    dayFullWed: 'Mercredi',
    dayFullThu: 'Jeudi',
    dayFullFri: 'Vendredi',
    dayFullSat: 'Samedi',

    // Month labels (short)
    months: ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'] as readonly string[],

    // ServiceStep
    selectService: 'Choisissez un service',
    noServices: 'Aucun service disponible.',
    free: 'Gratuit',
    continue: 'Continuer',

    // DateStep
    selectDate: 'Choisissez une date',
    today: 'Auj.',
    back: 'Retour',

    // TimeStep
    selectTime: 'Choisissez un horaire',
    noSlots: 'Aucun créneau disponible pour cette date.',
    pickAnotherDate: 'Choisissez une autre date.',

    // InfoStep — form
    yourInfo: 'Vos informations',
    firstName: 'Prénom',
    firstNamePlaceholder: 'Votre prénom',
    phone: 'Téléphone',
    phonePlaceholder: '+689 87 XX XX XX',
    optional: '(optionnel)',
    email: 'Email',
    emailPlaceholder: 'votre@email.com',
    confirming: 'Confirmation...',
    confirm: 'Confirmer',
    dateAtTime: 'à',

    // InfoStep — confirmation
    confirmed: 'Réservation confirmée !',
    confirmedMsg: (businessName: string) => `Vous avez un rendez-vous chez ${businessName}`,
    labelDate: 'Date',
    labelTime: 'Horaire',
    labelService: 'Service',
    contact: 'Contact',
    share: 'Partager',
    calendar: 'Calendrier',
    reference: 'Référence :',

    // Errors
    genericError: 'Une erreur est survenue. Veuillez réessayer.',
    networkError: 'Impossible de contacter le serveur. Vérifiez votre connexion.',
    phoneInvalid: 'Numéro de téléphone invalide.',

    // Cancellation
    cancelBefore: (hours: number) => `Annulation gratuite jusqu'à ${hours}h avant le rendez-vous.`,

    // Footer
    poweredBy: 'Propulsé par',

    // Error page
    invalidLink: 'Lien invalide',
    invalidLinkMsg: 'Ce lien de réservation est invalide.',

    // Share / GCal
    bookAt: (businessName: string) => `Réservez chez ${businessName}`,
    bookedVia: "Réservé via Ve'a",
    linkCopied: 'Lien copié !',

    // Language toggle
    switchLang: 'EN',
  },
  en: {
    // Stepper
    stepService: 'Service',
    stepDate: 'Date',
    stepTime: 'Time',
    stepInfo: 'Info',
    stepperAria: 'Booking progress',
    stepCompleted: 'completed',
    stepCurrent: 'current',
    stepAriaText: (current: number, total: number, label: string) =>
      `Step ${current} of ${total}: ${label}`,

    // Day labels (short)
    daySun: 'Sun',
    dayMon: 'Mon',
    dayTue: 'Tue',
    dayWed: 'Wed',
    dayThu: 'Thu',
    dayFri: 'Fri',
    daySat: 'Sat',

    // Day labels (full)
    dayFullSun: 'Sunday',
    dayFullMon: 'Monday',
    dayFullTue: 'Tuesday',
    dayFullWed: 'Wednesday',
    dayFullThu: 'Thursday',
    dayFullFri: 'Friday',
    dayFullSat: 'Saturday',

    // Month labels (short)
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as readonly string[],

    // ServiceStep
    selectService: 'Select a service',
    noServices: 'No services available.',
    free: 'Free',
    continue: 'Continue',

    // DateStep
    selectDate: 'Pick a date',
    today: 'Today',
    back: 'Back',

    // TimeStep
    selectTime: 'Select a time',
    noSlots: 'No available slots for this date.',
    pickAnotherDate: 'Pick another date.',

    // InfoStep — form
    yourInfo: 'Your information',
    firstName: 'First name',
    firstNamePlaceholder: 'Your first name',
    phone: 'Phone',
    phonePlaceholder: '+689 87 XX XX XX',
    optional: '(optional)',
    email: 'Email',
    emailPlaceholder: 'your@email.com',
    confirming: 'Confirming...',
    confirm: 'Confirm',
    dateAtTime: 'at',

    // InfoStep — confirmation
    confirmed: 'Booking confirmed!',
    confirmedMsg: (businessName: string) => `You have an appointment at ${businessName}`,
    labelDate: 'Date',
    labelTime: 'Time',
    labelService: 'Service',
    contact: 'Contact',
    share: 'Share',
    calendar: 'Calendar',
    reference: 'Reference:',

    // Errors
    genericError: 'Something went wrong. Please try again.',
    networkError: 'Unable to reach the server. Check your connection.',
    phoneInvalid: 'Invalid phone number.',

    // Cancellation
    cancelBefore: (hours: number) => `Free cancellation up to ${hours}h before the appointment.`,

    // Footer
    poweredBy: 'Powered by',

    // Error page
    invalidLink: 'Invalid link',
    invalidLinkMsg: 'This booking link is invalid.',

    // Share / GCal
    bookAt: (businessName: string) => `Book at ${businessName}`,
    bookedVia: "Booked via Ve'a",
    linkCopied: 'Link copied!',

    // Language toggle
    switchLang: 'FR',
  },
} as const;

export type BookingTranslations = typeof translations['fr'] | typeof translations['en'];

export function useBookingI18n(locale: BookingLocale) {
  return translations[locale];
}
