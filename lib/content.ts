/**
 * Every wedding fact on the site lives here, verbatim from the original
 * invitation. Presentation may change freely — these strings may not.
 */

export const couple = {
  groom: 'Ronald Varghese',
  bride: 'Amala Wilson',
  monogram: { left: 'R', amp: '&', right: 'A' },
  short: 'Ronald & Amala',
} as const;

export const day = {
  weekday: 'Monday',
  dayNumeral: '14',
  monthYear: 'September 2026',
  time: 'at 11:30 in the morning',
  compact: '14 · 09 · 2026',
  /** 11:30 IST on the wedding morning — drives the countdown. */
  iso: '2026-09-14T11:30:00+05:30',
} as const;

export const hosts = {
  father: 'Mr. Varghese George',
  mother: 'Mrs. Liza Varghese',
  motherKnownAs: '(Usha)',
  address: 'Kripa, Ananya Nagar, Tangasseri, Kollam',
  invite: 'with their families,\nyou are invited to celebrate the union of',
} as const;

export const bride = {
  parents: 'daughter of Mr. Wilson A & Mrs. Leelamma J',
  house: 'Leela Mandiram, Sinkarapally',
  post: 'Koduvila P.O., East Kallada, Kollam',
} as const;

export const events = {
  engagement: {
    label: 'Engagement',
    venue: 'Millennium Hall, Tangasseri',
    when: 'Sunday, 6 September 2026 at 11:30 am',
    map: 'https://maps.google.com/?q=Millennium+Hall+Tangasseri+Kollam',
    qr: '/assets/qr/engagement.svg',
    qrAlt: 'QR code linking to the map location of Millennium Hall, Tangasseri',
  },
  ceremony: {
    label: 'The Ceremony',
    venue: 'St. Casimir’s Church, Kadavoor',
    detailA: 'Diocesan Pilgrimage Centre',
    detailB: 'Diocese of Kollam',
    map: 'https://maps.google.com/?q=St+Casimirs+Church+Kadavoor+Kollam',
    qr: '/assets/qr/church.svg',
    qrAlt: "QR code linking to the map location of St. Casimir's Church, Kadavoor",
  },
  reception: {
    label: 'Reception to follow',
    venue: 'Bishop Jerome Convention Hall',
    map: 'https://maps.google.com/?q=Bishop+Jerome+Convention+Hall+Kollam',
    qr: '/assets/qr/reception.svg',
    qrAlt: 'QR code linking to the map location of Bishop Jerome Convention Hall',
  },
  scanCaption: 'scan for directions',
} as const;

export const farewell = {
  lede: 'With warm regards from',
  name: 'Roshan Varghese',
} as const;

export const meta = {
  title: 'Ronald & Amala · 14 September 2026',
  description:
    'Ronald Varghese and Amala Wilson invite you to celebrate their marriage — Monday, 14 September 2026 at 11:30 in the morning, St. Casimir’s Church, Kadavoor, Kollam.',
  ogDescription:
    'Monday, 14 September 2026 · 11:30 in the morning · St. Casimir’s Church, Kadavoor, Kollam',
} as const;
