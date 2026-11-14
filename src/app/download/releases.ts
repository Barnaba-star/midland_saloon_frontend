/** Every app version and what it brought (newest first). Add the new one at the top with each release. */
export interface Release { v: string; date: string; sw: string[]; en: string[]; }

export const RELEASES: Release[] = [
  {
    "v": "1.0.28",
    "date": "2026-11-14",
    "sw": [
      "Lugha: ukichagua Kiswahili, mfumo wote unaonyesha Kiswahili - fomu, vitufe, arifa, kurasa, tarehe na ujumbe wa mfumo.",
      "Store: Hariri bidhaa (jina, idadi, bei, huduma) na Futa bidhaa; zilizofunguliwa zinabaki kwenye historia.",
      "Store kwenye simu (website): taarifa zote zinaonekana, hazikatwi tena."
    ],
    "en": [
      "Language: with Swahili chosen, the whole system shows Swahili - forms, buttons, alerts, pages, dates and system messages.",
      "Store: edit an item (name, quantity, price, service) and delete an item; opened ones stay in the history.",
      "Store on a phone (website): everything shows, nothing is cut off."
    ]
  },
  {
    "v": "1.0.27",
    "date": "2026-11-14",
    "sw": [
      "Huduma za mfumo (Mipangilio ya ofisi kuu): huduma zinasajiliwa mara moja - jina, kundi, muda na maelezo.",
      "Mipangilio > Huduma: huduma za mfumo ambazo branch haina zinaonekana juu - tiki, Endelea, weka bei tu.",
      "Huduma iliyopo tayari kwa jina lilelile inaunganishwa, haiongezwi mara mbili."
    ],
    "en": [
      "System services (main office Settings): each service is registered once - name, group, time and description.",
      "Settings > Services: system services the branch lacks show on top - tick, Continue, just set the price.",
      "A service already there under the same name is linked, not added twice."
    ]
  },
  {
    "v": "1.0.26",
    "date": "2026-11-14",
    "sw": [
      "Kamisheni (Mipangilio > Kamisheni): huduma zote zinaonekana - zenye kamisheni na zisizo nazo, kitufe \"Weka kamisheni\" kwa zisizo nazo."
    ],
    "en": [
      "Commission (Settings > Commission): every service shows - with and without a split, with a \"Set commission\" button for those without."
    ]
  },
  {
    "v": "1.0.25",
    "date": "2026-11-14",
    "sw": [
      "Kuongeza huduma: hakuna tena kuandika code - mfumo unatoa code wenyewe (H001, H002...).",
      "Chaguo la \"Shared\" limeondolewa kwenye fomu ya huduma."
    ],
    "en": [
      "Adding a service: no code to type any more - the system gives one (H001, H002...).",
      "The \"Shared\" choice is removed from the service form."
    ]
  },
  {
    "v": "1.0.24",
    "date": "2026-11-14",
    "sw": [
      "Historia ya matoleo: kila toleo na kilichoongezwa, ndani ya app (Matoleo) na kwenye ukurasa wa kupakua."
    ],
    "en": [
      "Release history: every version and what it added, in the app (Releases) and on the download page."
    ]
  },
  {
    "v": "1.0.23",
    "date": "2026-11-14",
    "sw": [
      "QR ya Huduma (Mipangilio > QR ya Huduma): chapisha QR ubandike ndani ya saluni.",
      "Mteja akiscan anaona huduma, maelezo, bei, muda na wasusi - bila app wala kuingia.",
      "Kitufe cha \"QR mpya\" QR ikipotea au ikinakiliwa.",
      "Foleni ya mlangoni imeondolewa; QR ya TV ya saluni sasa inaonyesha huduma."
    ],
    "en": [
      "Services QR (Settings > Services QR): print a QR to put up inside the salon.",
      "A guest who scans it sees services, descriptions, prices, time and stylists - no app, no login.",
      "A \"New QR\" button if the QR is lost or copied.",
      "The door queue is removed; the salon TV QR now shows the services."
    ]
  },
  {
    "v": "1.0.22",
    "date": "2026-11-11",
    "sw": [
      "Mashindano: wahudumu bora wa wiki (wateja, wa kudumu, nyota).",
      "Kazi za mhudumu: picha za kazi, nyota na maoni ya wateja.",
      "Picha za mtindo za mteja (Kabla / Baada) kwenye bili."
    ],
    "en": [
      "Contest: the week's best stylists (guests, regulars, stars).",
      "Stylist's work: work photos, stars and guests' comments.",
      "A customer's style photos (Before / After) on the bill."
    ]
  },
  {
    "v": "1.0.21",
    "date": "2026-11-11",
    "sw": [
      "Kadi ya mteja kwenye bili: kila ziara N mteja anapata punguzo.",
      "Foleni ya mlango (iliondolewa 1.0.23)."
    ],
    "en": [
      "Customer card on the bill: every N visits the customer earns a discount.",
      "Door queue (removed in 1.0.23)."
    ]
  },
  {
    "v": "1.0.20",
    "date": "2026-11-11",
    "sw": [
      "App inatumia anwani mpya ya mfumo: api.salonixtz.com."
    ],
    "en": [
      "The app uses the new system address: api.salonixtz.com."
    ]
  },
  {
    "v": "1.0.18 - 1.0.19",
    "date": "2026-11-09",
    "sw": [
      "Jina jipya SalonixTz, nembo mpya, ikoni ya S na rangi mpya."
    ],
    "en": [
      "New name SalonixTz, new logo, S icon and new colours."
    ]
  },
  {
    "v": "1.0.17",
    "date": "2026-10-10",
    "sw": [
      "Akaunti mpya inabadilisha neno la siri inapoingia mara ya kwanza."
    ],
    "en": [
      "A new account changes its password at first sign-in."
    ]
  },
  {
    "v": "1.0.16",
    "date": "2026-10-10",
    "sw": [
      "Mfumo umehamia server yenye kasi zaidi (Railway)."
    ],
    "en": [
      "The system moved to a faster server (Railway)."
    ]
  },
  {
    "v": "1.0.15",
    "date": "2026-10-09",
    "sw": [
      "Kufunga zamu: kila njia ya malipo na historia ya makabidhiano kwa vitufe."
    ],
    "en": [
      "Cash-up: each payment method and the handover history as tap-to-open buttons."
    ]
  },
  {
    "v": "1.0.8 - 1.0.14",
    "date": "2026-10-08",
    "sw": [
      "Zamu: fungua, funga na kabidhi pesa na store.",
      "Arifa, Kiswahili/Kiingereza, wasifu, kubadili neno la siri na kulipia usajili.",
      "Hifadhi: kufuta rekodi za branch kwa kipindi."
    ],
    "en": [
      "Shifts: open, close and hand over money and store.",
      "Notifications, Swahili/English, profile, change password and subscription payment.",
      "Storage: clear a branch's records for a period."
    ]
  },
  {
    "v": "1.0.0 - 1.0.7",
    "date": "2026-10-08",
    "sw": [
      "App ya kwanza: Mauzo (bili, huduma, LIPA, risiti), Watumishi, Huduma, Store, Kamisheni na Ripoti.",
      "Store: bei, utafutaji na bidhaa zilizofunguliwa; Matumizi Mengineyo; kuonekana online."
    ],
    "en": [
      "First app: Sales (bills, services, pay, receipts), Staff, Services, Store, Commission and Reports.",
      "Store: prices, search and opened items; Other expenses; online status."
    ]
  }
];
