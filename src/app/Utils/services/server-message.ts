import { TranslateService } from '@ngx-translate/core';

/*
 * Backend messages in the chosen language.
 *
 * The backend answers in a mix of English sentences, Swahili sentences and
 * codes (BRANCH_NOT_FOUND, NOT_ALLOWED...). Screens and popups showed them
 * raw, so a Swahili screen still said "Service Not Found". This maps each
 * exact string the backend can send to an SRV_MSG.* key in
 * public/assets/i18n/{sw,en}.json; strings built by concatenation are
 * matched by their fixed head/tail and the moving part passed as {{x}}.
 *
 * Unknown text is returned unchanged - a new backend message still shows,
 * only untranslated, until it is added here.
 */

/** Exact backend strings, lower-cased and trimmed -> SRV_MSG key. */
const EXACT: Record<string, string> = {
  "provide an image file": "PROVIDE_AN_IMAGE_FILE",
  "only jpeg, png or webp images are allowed": "ONLY_JPEG_PNG_OR_WEBP_IMAGES_ARE_ALLOWED",
  "failed to save the image": "FAILED_TO_SAVE_THE_IMAGE",
  "user not found": "USER_NOT_FOUND",
  "provide login details": "PROVIDE_LOGIN_DETAILS",
  "invalid username or password": "INVALID_USERNAME_OR_PASSWORD",
  "error in setting token": "ERROR_IN_SETTING_TOKEN",
  "provide user data": "PROVIDE_USER_DATA",
  "branch not found": "BRANCH_NOT_FOUND",
  "role not found": "ROLE_NOT_FOUND",
  "role not allowed": "ROLE_NOT_ALLOWED",
  "error in saving user": "ERROR_IN_SAVING_USER",
  "provide user ref uid": "PROVIDE_USER_REF_UID",
  "provide data for user": "PROVIDE_DATA_FOR_USER",
  "provide data to change password": "PROVIDE_DATA_TO_CHANGE_PASSWORD",
  "you cannot change password, account is blocked": "YOU_CANNOT_CHANGE_PASSWORD_ACCOUNT_IS_BLOCKED",
  "invalid password provided": "INVALID_PASSWORD_PROVIDED",
  "passwords do not match": "PASSWORDS_DO_NOT_MATCH",
  "password is too short": "PASSWORD_IS_TOO_SHORT",
  "choose the user": "CHOOSE_THE_USER",
  "a root user already reaches every branch": "A_ROOT_USER_ALREADY_REACHES_EVERY_BRANCH",
  "the main office is not a working branch": "THE_MAIN_OFFICE_IS_NOT_A_WORKING_BRANCH",
  "access denied. you do not have permission to access this resource.": "ACCESS_DENIED_YOU_DO_NOT_HAVE_PERMISSION_TO_ACCESS_THIS_RESO",
  "your session has expired. please log in again.": "YOUR_SESSION_HAS_EXPIRED_PLEASE_LOG_IN_AGAIN",
  "either user not authenticated or null": "EITHER_USER_NOT_AUTHENTICATED_OR_NULL",
  "invalid user authentication": "INVALID_USER_AUTHENTICATION",
  "user not authenticated": "USER_NOT_AUTHENTICATED",
  "role uid for logged user not found": "ROLE_UID_FOR_LOGGED_USER_NOT_FOUND",
  "password_change_required": "PASSWORD_CHANGE_REQUIRED",
  "account_blocked": "ACCOUNT_BLOCKED",
  "activation_code_expired": "ACTIVATION_CODE_EXPIRED",
  "no_role_assigned": "NO_ROLE_ASSIGNED",
  "choose_branch": "CHOOSE_BRANCH",
  "branch_not_allowed": "BRANCH_NOT_ALLOWED",
  "subscription_expired": "SUBSCRIPTION_EXPIRED",
  "invalid signature": "INVALID_SIGNATURE",
  "provide staff ref uid": "PROVIDE_STAFF_REF_UID",
  "not allowed to view another staff member": "NOT_ALLOWED_TO_VIEW_ANOTHER_STAFF_MEMBER",
  "not allowed to pay commission": "NOT_ALLOWED_TO_PAY_COMMISSION",
  "staff not found in this period": "STAFF_NOT_FOUND_IN_THIS_PERIOD",
  "this staff earned no commission in this period": "THIS_STAFF_EARNED_NO_COMMISSION_IN_THIS_PERIOD",
  "this commission has already been paid": "THIS_COMMISSION_HAS_ALREADY_BEEN_PAID",
  "provide an amount greater than zero": "PROVIDE_AN_AMOUNT_GREATER_THAN_ZERO",
  "that is more than is owed for this period": "THAT_IS_MORE_THAN_IS_OWED_FOR_THIS_PERIOD",
  "failed to record the payout": "FAILED_TO_RECORD_THE_PAYOUT",
  "unknown share": "UNKNOWN_SHARE",
  "no_recipient": "NO_RECIPIENT",
  "unknown_share": "UNKNOWN_SHARE",
  "not_allowed": "NOT_ALLOWED",
  "not_in_role": "NOT_IN_ROLE",
  "nothing_earned": "NOTHING_EARNED",
  "already_paid": "ALREADY_PAID",
  "invalid_amount": "INVALID_AMOUNT",
  "more_than_owed": "MORE_THAN_OWED",
  "pay_failed": "PAY_FAILED",
  "payment request failed": "PAYMENT_REQUEST_FAILED",
  "could not read payment": "COULD_NOT_READ_PAYMENT",
  "no payment reference held for this branch": "NO_PAYMENT_REFERENCE_HELD_FOR_THIS_BRANCH",
  "not found": "NOT_FOUND",
  "not_found": "NOT_FOUND",
  "something went wrong. the error has been recorded.": "SOMETHING_WENT_WRONG_THE_ERROR_HAS_BEEN_RECORDED",
  "andika jina la huduma": "ANDIKA_JINA_LA_HUDUMA",
  "muda si sahihi": "MUDA_SI_SAHIHI",
  "huduma haipo": "HUDUMA_HAIPO",
  "choose a branch first": "CHOOSE_A_BRANCH_FIRST",
  "chagua huduma moja au zaidi": "CHAGUA_HUDUMA_MOJA_AU_ZAIDI",
  "weka bei": "WEKA_BEI",
  "idadi ya ziara iwe kati ya 2 na 100": "IDADI_YA_ZIARA_IWE_KATI_YA_2_NA_100",
  "weka kiasi cha punguzo (angalau 100)": "WEKA_KIASI_CHA_PUNGUZO_ANGALAU_100",
  "namba ya simu si sahihi": "NAMBA_YA_SIMU_SI_SAHIHI",
  "mteja hapatikani": "MTEJA_HAPATIKANI",
  "weka mteja kwenye bili kwanza": "WEKA_MTEJA_KWENYE_BILI_KWANZA",
  "mteja hana zawadi kwa sasa": "MTEJA_HANA_ZAWADI_KWA_SASA",
  "ongeza huduma kwenye bili kwanza": "ONGEZA_HUDUMA_KWENYE_BILI_KWANZA",
  "bili haipatikani": "BILI_HAIPATIKANI",
  "bili hii imeshalipwa": "BILI_HII_IMESHALIPWA",
  "queue_not_found": "QUEUE_NOT_FOUND",
  "too_many": "TOO_MANY",
  "ticket_not_found": "TICKET_NOT_FOUND",
  "card_not_found": "CARD_NOT_FOUND",
  "queue_closed": "QUEUE_CLOSED",
  "name_required": "NAME_REQUIRED",
  "phone_invalid": "PHONE_INVALID",
  "already_in_queue": "ALREADY_IN_QUEUE",
  "queue_full": "QUEUE_FULL",
  "service_required": "SERVICE_REQUIRED",
  "staff_not_found": "STAFF_NOT_FOUND",
  "mteja huyu hayupo tena kwenye foleni": "MTEJA_HUYU_HAYUPO_TENA_KWENYE_FOLENI",
  "tiketi haipatikani": "TIKETI_HAIPATIKANI",
  "andika jina la mteja": "ANDIKA_JINA_LA_MTEJA",
  "funga zamu yako kwanza kabla ya makabidhiano (close your shift before the cash-up)": "FUNGA_ZAMU_YAKO_KWANZA_KABLA_YA_MAKABIDHIANO_CLOSE_YOUR_SHIF",
  "sign in again to close your shift": "SIGN_IN_AGAIN_TO_CLOSE_YOUR_SHIFT",
  "a count cannot be below zero": "A_COUNT_CANNOT_BE_BELOW_ZERO",
  "cash-up not found": "CASH_UP_NOT_FOUND",
  "sign in again to open your shift": "SIGN_IN_AGAIN_TO_OPEN_YOUR_SHIFT",
  "your shift is already open": "YOUR_SHIFT_IS_ALREADY_OPEN",
  "do the cash-up of your closed shift before opening a new one": "DO_THE_CASH_UP_OF_YOUR_CLOSED_SHIFT_BEFORE_OPENING_A_NEW_ONE",
  "you have no open shift to close": "YOU_HAVE_NO_OPEN_SHIFT_TO_CLOSE",
  "fungua zamu yako kwanza kabla ya kuuza (open your shift before selling)": "FUNGUA_ZAMU_YAKO_KWANZA_KABLA_YA_KUUZA_OPEN_YOUR_SHIFT_BEFOR",
  "zamu yako imefungwa - fanya makabidhiano kisha fungua zamu mpya (your shift is closed - do its cash-up and open a new one)": "ZAMU_YAKO_IMEFUNGWA_FANYA_MAKABIDHIANO_KISHA_FUNGUA_ZAMU_MPY",
  "no branch found for the current user": "NO_BRANCH_FOUND_FOR_THE_CURRENT_USER",
  "every item needs a name": "EVERY_ITEM_NEEDS_A_NAME",
  "count at least one item": "COUNT_AT_LEAST_ONE_ITEM",
  "each item may be counted once": "EACH_ITEM_MAY_BE_COUNTED_ONCE",
  "enter a count of zero or more for every item": "ENTER_A_COUNT_OF_ZERO_OR_MORE_FOR_EVERY_ITEM",
  "hesabu ya store inafanyika ndani ya zamu yako - fungua au funga zamu kwanza (count the store at your shift)": "HESABU_YA_STORE_INAFANYIKA_NDANI_YA_ZAMU_YAKO_FUNGUA_AU_FUNG",
  "stock take not found": "STOCK_TAKE_NOT_FOUND",
  "provide data for saloon service": "PROVIDE_DATA_FOR_SALOON_SERVICE",
  "service not found": "SERVICE_NOT_FOUND",
  "error in saving new service": "ERROR_IN_SAVING_NEW_SERVICE",
  "provide saloon service ref": "PROVIDE_SALOON_SERVICE_REF",
  "error in deleting service": "ERROR_IN_DELETING_SERVICE",
  "error in accessing services": "ERROR_IN_ACCESSING_SERVICES",
  "provide commissions data": "PROVIDE_COMMISSIONS_DATA",
  "commission not found": "COMMISSION_NOT_FOUND",
  "error in saving new commission": "ERROR_IN_SAVING_NEW_COMMISSION",
  "provide commission ref uid": "PROVIDE_COMMISSION_REF_UID",
  "error in deleting commission": "ERROR_IN_DELETING_COMMISSION",
  "provide commission ref": "PROVIDE_COMMISSION_REF",
  "provide staff data": "PROVIDE_STAFF_DATA",
  "error in saving staff": "ERROR_IN_SAVING_STAFF",
  "staff not found": "STAFF_NOT_FOUND",
  "error in deleting staff": "ERROR_IN_DELETING_STAFF",
  "weka taarifa za mauzo": "WEKA_TAARIFA_ZA_MAUZO",
  "weka staff ref": "WEKA_STAFF_REF",
  "weka ref ya hududma": "WEKA_REF_YA_HUDUDMA",
  "provide open sale ref": "PROVIDE_OPEN_SALE_REF",
  "staff hapatikani": "STAFF_HAPATIKANI",
  "open sale not found": "OPEN_SALE_NOT_FOUND",
  "services not found": "SERVICES_NOT_FOUND",
  "no commission found": "NO_COMMISSION_FOUND",
  "hakuna mauzo yoyote ya kusave": "HAKUNA_MAUZO_YOYOTE_YA_KUSAVE",
  "sales were not saved": "SALES_WERE_NOT_SAVED",
  "failed to create saloon reports": "FAILED_TO_CREATE_SALOON_REPORTS",
  "error in serving service and report": "ERROR_IN_SERVING_SERVICE_AND_REPORT",
  "error in saving income and expenses": "ERROR_IN_SAVING_INCOME_AND_EXPENSES",
  "error in saving stock and purchase": "ERROR_IN_SAVING_STOCK_AND_PURCHASE",
  "provide sales ref": "PROVIDE_SALES_REF",
  "sales not found": "SALES_NOT_FOUND",
  "error in deleting sales": "ERROR_IN_DELETING_SALES",
  "that bill is not open any more": "THAT_BILL_IS_NOT_OPEN_ANY_MORE",
  "provide data for opening new sale": "PROVIDE_DATA_FOR_OPENING_NEW_SALE",
  "empty commissions": "EMPTY_COMMISSIONS",
  "provide spend data": "PROVIDE_SPEND_DATA",
  "provide spend ref": "PROVIDE_SPEND_REF",
  "provide valid spend amount": "PROVIDE_VALID_SPEND_AMOUNT",
  "provide spend description": "PROVIDE_SPEND_DESCRIPTION",
  "choose how it was paid": "CHOOSE_HOW_IT_WAS_PAID",
  "income expenses not found": "INCOME_EXPENSES_NOT_FOUND",
  "spend amount cannot exceed available amount": "SPEND_AMOUNT_CANNOT_EXCEED_AVAILABLE_AMOUNT",
  "provide income ref": "PROVIDE_INCOME_REF",
  "no sales found to create reports": "NO_SALES_FOUND_TO_CREATE_REPORTS",
  "no saloon reports to save": "NO_SALOON_REPORTS_TO_SAVE",
  "provide saloon reports": "PROVIDE_SALOON_REPORTS",
  "no service and store report to save": "NO_SERVICE_AND_STORE_REPORT_TO_SAVE",
  "error in saving service and store report": "ERROR_IN_SAVING_SERVICE_AND_STORE_REPORT",
  "report not found": "REPORT_NOT_FOUND",
  "no report found": "NO_REPORT_FOUND",
  "weka details za malipo": "WEKA_DETAILS_ZA_MALIPO",
  "weka commission ref": "WEKA_COMMISSION_REF",
  "commission ya staff haipo": "COMMISSION_YA_STAFF_HAIPO",
  "weka kiasi kinacholipwa": "WEKA_KIASI_KINACHOLIPWA",
  "error wakati wa kulipa": "ERROR_WAKATI_WA_KULIPA",
  "provide store details": "PROVIDE_STORE_DETAILS",
  "store not found": "STORE_NOT_FOUND",
  "provide store item name": "PROVIDE_STORE_ITEM_NAME",
  "provide descriptions for store item": "PROVIDE_DESCRIPTIONS_FOR_STORE_ITEM",
  "provide quantity for store": "PROVIDE_QUANTITY_FOR_STORE",
  "provide service": "PROVIDE_SERVICE",
  "provide buying price for store": "PROVIDE_BUYING_PRICE_FOR_STORE",
  "quantity must be more than zero": "QUANTITY_MUST_BE_MORE_THAN_ZERO",
  "error in saving store": "ERROR_IN_SAVING_STORE",
  "provide store item ref": "PROVIDE_STORE_ITEM_REF",
  "provide data for adding quantity": "PROVIDE_DATA_FOR_ADDING_QUANTITY",
  "provide quantity to add": "PROVIDE_QUANTITY_TO_ADD",
  "error in adding quantity": "ERROR_IN_ADDING_QUANTITY",
  "provide store ref": "PROVIDE_STORE_REF",
  "error in opening store": "ERROR_IN_OPENING_STORE",
  "weka taarifa za kufunga store": "WEKA_TAARIFA_ZA_KUFUNGA_STORE",
  "provide open store ref": "PROVIDE_OPEN_STORE_REF",
  "open store not found": "OPEN_STORE_NOT_FOUND",
  "error in closing open store": "ERROR_IN_CLOSING_OPEN_STORE",
  "provide status": "PROVIDE_STATUS",
  "filter must be day, yesterday, week, last_week, month, last_month, this_year or date in format yyyy-mm-dd": "FILTER_MUST_BE_DAY_YESTERDAY_WEEK_LAST_WEEK_MONTH_LAST_MONTH",
  "saloon service is empty": "SALOON_SERVICE_IS_EMPTY",
  "provide data for pay stock": "PROVIDE_DATA_FOR_PAY_STOCK",
  "provide stock and pay ref": "PROVIDE_STOCK_AND_PAY_REF",
  "provide valid payment amount": "PROVIDE_VALID_PAYMENT_AMOUNT",
  "pay and stock not found": "PAY_AND_STOCK_NOT_FOUND",
  "no income recorded this week": "NO_INCOME_RECORDED_THIS_WEEK",
  "payment amount is greater than remaining amount": "PAYMENT_AMOUNT_IS_GREATER_THAN_REMAINING_AMOUNT",
  "provide stock and purchase ref": "PROVIDE_STOCK_AND_PURCHASE_REF",
  "chagua picha": "CHAGUA_PICHA",
  "picha ni kubwa mno (zaidi ya mb 8)": "PICHA_NI_KUBWA_MNO_ZAIDI_YA_MB_8",
  "picha iwe jpg, png au webp": "PICHA_IWE_JPG_PNG_AU_WEBP",
  "picha haikuhifadhika, jaribu tena": "PICHA_HAIKUHIFADHIKA_JARIBU_TENA",
  "mhudumu hapatikani": "MHUDUMU_HAPATIKANI",
  "picha haipatikani": "PICHA_HAIPATIKANI",
  "not_served": "NOT_SERVED",
  "stars_required": "STARS_REQUIRED",
  "already_rated": "ALREADY_RATED",
  "no_staff": "NO_STAFF",
  "no_title": "NO_TITLE",
  "no_file": "NO_FILE",
  "bad_type": "BAD_TYPE",
  "store_failed": "STORE_FAILED",
  "empty": "EMPTY",
  "too_long": "TOO_LONG",
  "no_branch": "NO_BRANCH",
  "provide a logo image": "PROVIDE_A_LOGO_IMAGE",
  "only jpeg, png, webp or svg images are allowed": "ONLY_JPEG_PNG_WEBP_OR_SVG_IMAGES_ARE_ALLOWED",
  "failed to save the logo": "FAILED_TO_SAVE_THE_LOGO",
  "provide data for branch subscription": "PROVIDE_DATA_FOR_BRANCH_SUBSCRIPTION",
  "provide amount for subscription": "PROVIDE_AMOUNT_FOR_SUBSCRIPTION",
  "provide branch ref": "PROVIDE_BRANCH_REF",
  "error when saving branch subscription": "ERROR_WHEN_SAVING_BRANCH_SUBSCRIPTION",
  "provide subscription payment details": "PROVIDE_SUBSCRIPTION_PAYMENT_DETAILS",
  "provide a valid number of months": "PROVIDE_A_VALID_NUMBER_OF_MONTHS",
  "user logged in yet have no branch": "USER_LOGGED_IN_YET_HAVE_NO_BRANCH",
  "no subscription price set in configuration yet, contact admin": "NO_SUBSCRIPTION_PRICE_SET_IN_CONFIGURATION_YET_CONTACT_ADMIN",
  "account blocked": "ACCOUNT_BLOCKED_2",
  "user has no branch": "USER_HAS_NO_BRANCH",
  "this branch is active, please log in": "THIS_BRANCH_IS_ACTIVE_PLEASE_LOG_IN",
  "failed to initiate payment": "FAILED_TO_INITIATE_PAYMENT",
  "payment was initiated but failed to update branch, contact admin": "PAYMENT_WAS_INITIATED_BUT_FAILED_TO_UPDATE_BRANCH_CONTACT_AD",
  "only root can wipe a branch's data": "ONLY_ROOT_CAN_WIPE_A_BRANCH_S_DATA",
  "the main branch's data cannot be wiped": "THE_MAIN_BRANCH_S_DATA_CANNOT_BE_WIPED",
  "type the branch code exactly to confirm": "TYPE_THE_BRANCH_CODE_EXACTLY_TO_CONFIRM",
  "provide branch details": "PROVIDE_BRANCH_DETAILS",
  "provide branch name": "PROVIDE_BRANCH_NAME",
  "provide region": "PROVIDE_REGION",
  "invalid branch code format": "INVALID_BRANCH_CODE_FORMAT",
  "error in saving branch": "ERROR_IN_SAVING_BRANCH",
  "branch uid is required": "BRANCH_UID_IS_REQUIRED",
  "provide data for role": "PROVIDE_DATA_FOR_ROLE",
  "error occurred in saving role": "ERROR_OCCURRED_IN_SAVING_ROLE",
  "role ref uid is required": "ROLE_REF_UID_IS_REQUIRED",
  "provide role module": "PROVIDE_ROLE_MODULE",
  "provide role ref uid": "PROVIDE_ROLE_REF_UID",
  "provide data": "PROVIDE_DATA",
  "provide module name": "PROVIDE_MODULE_NAME",
  "root_only": "ROOT_ONLY",
  "branch_not_found": "BRANCH_NOT_FOUND",
  "bad_period": "BAD_PERIOD",
  "confirm_code": "CONFIRM_CODE",
  "blocked": "BLOCKED",
  "provide the region name": "PROVIDE_THE_REGION_NAME",
  "provide the region code": "PROVIDE_THE_REGION_CODE",
  "the code is too long": "THE_CODE_IS_TOO_LONG",
  "region not found": "REGION_NOT_FOUND",
  "a region with that name already exists": "A_REGION_WITH_THAT_NAME_ALREADY_EXISTS",
  "a region with that code already exists": "A_REGION_WITH_THAT_CODE_ALREADY_EXISTS",
  "error in saving the region": "ERROR_IN_SAVING_THE_REGION",
  "provide platform settings": "PROVIDE_PLATFORM_SETTINGS",
  "error not found": "ERROR_NOT_FOUND",
  "an unexpected error occurred.": "AN_UNEXPECTED_ERROR_OCCURRED",
  "bad request. please check the information you provided.": "BAD_REQUEST_PLEASE_CHECK_THE_INFORMATION_YOU_PROVIDED",
  "unauthorized: please login to continue.": "UNAUTHORIZED_PLEASE_LOGIN_TO_CONTINUE",
  "access denied. you do not have permission to perform this action.": "ACCESS_DENIED_YOU_DO_NOT_HAVE_PERMISSION_TO_PERFORM_THIS_ACT",
  "resource not found. please check the url or try again later.": "RESOURCE_NOT_FOUND_PLEASE_CHECK_THE_URL_OR_TRY_AGAIN_LATER",
  "internal server error. please contact support if this persists.": "INTERNAL_SERVER_ERROR_PLEASE_CONTACT_SUPPORT_IF_THIS_PERSIST",
  "bad method, check url.": "BAD_METHOD_CHECK_URL",
  "backend unreachable": "BACKEND_UNREACHABLE",
};

/** Concatenated messages: fixed head + moving part + fixed tail (lower-cased). */
const PATTERNS: { prefix: string; suffix: string; key: string }[] = [
  { prefix: "huduma ", suffix: " tayari ipo kwenye orodha", key: "SERVICE_ALREADY_LISTED" },
  { prefix: "enter what you counted for ", suffix: "", key: "ENTER_COUNTED_FOR" },
  { prefix: "at most ", suffix: " items", key: "AT_MOST_ITEMS" },
  { prefix: "\"", suffix: "\" is too long - 60 letters at most", key: "ITEM_NAME_TOO_LONG" },
  { prefix: "\"", suffix: "\" is on the list twice", key: "ITEM_LISTED_TWICE" },
  { prefix: "give \"", suffix: "\" a share between 1% and 100%", key: "GIVE_SHARE_BETWEEN" },
  { prefix: "the shares add up to ", suffix: "% - they must come to exactly 100%", key: "SHARES_ADD_UP_TO" },
  { prefix: "price not found for: ", suffix: "", key: "PRICE_NOT_FOUND_FOR" },
  { prefix: "only an empty bill can be deleted - bill ", suffix: " has services on it", key: "ONLY_EMPTY_BILL_DELETE" },
  { prefix: "error in opening new sale: ", suffix: "", key: "ERROR_OPENING_SALE" },
  { prefix: "no open store found for service: ", suffix: "", key: "NO_OPEN_STORE_FOR_SERVICE" },
  { prefix: "commission not found for: ", suffix: "", key: "COMMISSION_NOT_FOUND_FOR" },
  { prefix: "error in saving stock and purchase: ", suffix: "", key: "ERROR_SAVING_STOCK_PURCHASE" },
  { prefix: "invalid income and expenses filter: ", suffix: "", key: "INVALID_INCOME_FILTER" },
  { prefix: "invalid filter: ", suffix: "", key: "INVALID_FILTER" },
  { prefix: "the total is below the minimum of ", suffix: " tzs, choose more months", key: "TOTAL_BELOW_MINIMUM" },
  { prefix: "", suffix: " branch(es) are registered in this region, so its name and code cannot change", key: "REGION_HAS_BRANCHES_RENAME" },
  { prefix: "", suffix: " branch(es) are registered in this region, so it cannot be removed", key: "REGION_HAS_BRANCHES_REMOVE" },
  { prefix: "entries newer than ", suffix: " days cannot be removed", key: "ENTRIES_NEWER_THAN_DAYS" },
];

const PREFIX = 'SRV_MSG.';

/** The SRV_MSG key for a backend string, or null when it is not one we know. */
export function serverMessageKey(msg: string): { key: string; x?: string } | null {
  const text = (msg ?? '').trim();
  if (!text) {
    return null;
  }
  const lower = text.toLowerCase();
  const exact = EXACT[lower];
  if (exact) {
    return { key: PREFIX + exact };
  }
  for (const p of PATTERNS) {
    if (
      lower.length > p.prefix.length + p.suffix.length &&
      lower.startsWith(p.prefix) &&
      lower.endsWith(p.suffix)
    ) {
      // Keep the moving part as the backend wrote it (names, codes, amounts).
      const x = text.substring(p.prefix.length, text.length - p.suffix.length).trim();
      if (x) {
        return { key: PREFIX + p.key, x };
      }
    }
  }
  return null;
}

/** A string the translation files hold under that key, or null. */
function instantString(translate: TranslateService, key: string, params?: object): string | null {
  try {
    const out = translate.instant(key, params);
    return typeof out === 'string' && out !== key ? out : null;
  } catch {
    return null;
  }
}

/**
 * The message in the current language.
 *
 *  - an i18n key that exists (e.g. 'COMMON.SAVED' or 'SRV_MSG.NOT_FOUND') -> its text
 *  - a known backend string -> its SRV_MSG text
 *  - anything else -> unchanged
 */
export function translateServerMessage(msg: string, translate: TranslateService): string {
  if (typeof msg !== 'string') {
    return msg;
  }
  const text = msg.trim();
  if (!text || !translate) {
    return msg;
  }

  // Only something shaped like a key is tried as one; a sentence never is.
  if (/^[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)*$/.test(text)) {
    const own = instantString(translate, text);
    if (own) {
      return own;
    }
  }

  const found = serverMessageKey(text);
  if (!found) {
    return msg;
  }
  // The moving part may itself be a backend message ("...: Service Not Found").
  const params = found.x !== undefined
    ? { x: found.x === text ? found.x : translateServerMessage(found.x, translate) }
    : undefined;
  return instantString(translate, found.key, params) ?? msg;
}
