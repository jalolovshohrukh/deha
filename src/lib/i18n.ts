// Tajik (тоҷикӣ) interface strings. Single language for now; structured so a
// second language (Russian) can be added later.
export const t = {
  appName: "Роҳи Деҳа",
  appTagline: "Системаи хазинаи деҳа",

  // nav
  dashboard: "Асосӣ",
  donations: "Хайрияҳо",
  accounts: "Ҳисобҳо",
  expenses: "Хароҷотҳо",
  targets: "Ҳадафҳо",
  audit: "Таърих",
  logout: "Баромад",
  login: "Воридшавӣ",

  // common
  add: "Илова кардан",
  save: "Нигоҳ доштан",
  cancel: "Бекор кардан",
  delete: "Нест кардан",
  amount: "Маблағ",
  date: "Сана",
  note: "Эзоҳ",
  total: "Ҷамъ",
  required: "ҳатмӣ",
  optional: "ихтиёрӣ",
  actions: "Амалҳо",
  all: "Ҳама",
  list: "Рӯйхат",
  report: "Ҳисобот",
  records: "сабт",
  close: "Пӯшидан",
  confirmDelete: "Дар ҳақиқат нест кунам?",
  genericError: "Хатогӣ рух дод — аз нав кӯшиш кунед",

  // auth
  username: "Ном",
  password: "Рамз",
  signIn: "Ворид шудан",
  wrongCreds: "Ном ё рамз нодуруст аст",
  adminOnly: "Танҳо барои админ",
  viewerNote: "Шумо ҳамчун меҳмон ворид шудаед (танҳо тамошо).",
  roleAdmin: "Админ",
  roleViewer: "Меҳмон",

  // accounts
  account: "Ҳисоб",
  accountName: "Номи ҳисоб",
  accountType: "Намуди ҳисоб",
  bank: "Бонк",
  cash: "Нақд",
  wallet: "Ҳамён",
  openingBalance: "Бақияи аввалия",
  balance: "Бақия",
  newAccount: "Ҳисоби нав",
  transfer: "Гузаронидан",
  transferMoney: "Гузаронидани маблағ",
  movements: "Ҳаракатҳо",
  noMovements: "Ҳаракат нест.",
  back: "Бозгашт",
  from: "Аз",
  to: "Ба",
  description: "Тавсиф",
  openingLabel: "Бақияи аввалия",
  fromAccount: "Аз ҳисоб",
  toAccount: "Ба ҳисоб",
  noAccounts: "Ҳисоб нест. Аввал ҳисоб созед.",

  // donations
  donation: "Хайрия",
  newDonation: "Хайрияи нав",
  firstName: "Ном",
  familyName: "Насаб",
  age: "Синну сол",
  anonymous: "Беном",
  other: "Дигар",
  unknown: "Номаълум",
  accountIsMethodHint: "Ҳисоб тарзи пардохтро низ нишон медиҳад (Alif, DC, нақд).",
  donor: "Саховатманд",
  scanImage: "Расмро сканер кардан",
  addImage: "Расм илова кардан",
  takePhoto: "Расм гирифтан",
  scanning: "Хонда истодааст...",
  ocrHint: "Расми пардохтро интихоб кунед — маблағ ва сана худкор пур мешаванд.",
  noDonations: "Хайрия нест.",

  // expenses
  expense: "Хароҷот",
  newExpense: "Хароҷоти нав",
  category: "Гурӯҳ",
  payee: "Гиранда",
  spentFrom: "Аз кадом ҳисоб",
  noExpenses: "Хароҷот нест.",

  // targets
  target: "Ҳадаф",
  newTarget: "Ҳадафи нав",
  targetTitle: "Номи ҳадаф",
  targetAmount: "Маблағи ҳадаф (ҷамъи умумӣ)",
  reached: "Иҷро шуд",
  active: "Фаъол",
  reachedOn: "Иҷро шуд дар",
  progress: "Пешрафт",
  noTargets: "Ҳадаф нест.",
  shareImage: "Ҳамчун расм мубодила",
  download: "Боргирӣ",

  // dashboard
  totalRaised: "Ҷамъи хайрияҳо",
  totalSpent: "Ҷамъи хароҷот",
  currentBalance: "Бақияи умумӣ",
  donorsCount: "Шумораи саховатмандон",
  byAge: "Аз рӯи синну сол",
  byAccount: "Аз рӯи ҳисоб",
  byFamily: "Аз рӯи насаб (беҳтаринҳо)",
  topDonors: "Беҳтарин саховатмандон",
  dailyChart: "Хайрияҳо аз рӯи рӯз",
  monthlyChart: "Хайрияҳо аз рӯи моҳ",
  recentActivity: "Амалҳои охирин",
  currentTarget: "Ҳадафи ҷорӣ",
  avgDonation: "Хайрияи миёна",
} as const;

export const ageGroups = ["0–17", "18–29", "30–44", "45–59", "60+"];
export function ageGroup(age: number | null | undefined): string {
  if (age == null) return "Номаълум";
  if (age < 18) return "0–17";
  if (age < 30) return "18–29";
  if (age < 45) return "30–44";
  if (age < 60) return "45–59";
  return "60+";
}
