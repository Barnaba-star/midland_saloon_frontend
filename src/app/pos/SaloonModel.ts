
export interface SaloonStaffDTO{
  uid?: string;
  firstName?: string;
  middleName?:string;
  lastName?:string;
  dateOfBirth?:Date;
  phoneNumber?: string;
  saloonServiceUID?:string[];
  saloonCategory?:string;
  description?:string;
  gender?:string;
}
export interface SaloonStaffEntity{
  uid?: string;
  firstName?: string;
  middleName?:string;
  lastName?:string;
  dateOfBirth?:Date;
  phoneNumber?: string;
  saloonCategory?:string;
  description?:string;
  gender?:string;
}
export interface SaloonServiceDTO{
  uid? : string;
  serviceName?:string;
  serviceCode?: string;
  status?: string;
  description?:string;
  commissionType?:string;
  commissionValue?:number;
  duration?:number;
  price?:number;
  usageType?:string;
}

export interface SaloonServiceData{
  uid? : string;
  serviceName?:string;
  serviceCode?: string;
  status?: string;
  description?:string;
  commissionType?:string;
  commissionValue?:number;
  duration?:number;
  price?:number;
  usageType?:string;
}
export interface CommissionDTO{
    uid?: number;
    saloonServiceUID?: string;
    staffPercent?:number;
    ownerPercent?:number;
    traPercent?:number;
    emergencyPercent?:number;
    totalPercent?:number;
    maintenancePercent?:number;
    otherPercent?:number;
    rentPercent?:number;
    loanPercent?:number;
    waterPercent?:number;
    lukuPercent?:number;
    stockPurchasePercent?:number;
}
export interface SaloonBookingDTO{
   uid?:string;
   customerName?:string;
   bookingDate?:Date;
   totalAmount?:number;
   amountPaid?:number;
   status?:string;
   servicesUID?:string[];
}

export interface SaloonSalesDTO{
  uid?:string;
  saloonStaffUID?:string;
  saloonServiceUID?:string[];
  paymentMethod?:string;
  salesOpenedUID?:string;
}

export interface SaloonServiceEntity{
  uid?: string;
  serviceName?: string;
  serviceCode?: string;
  status?: string;
  description?: string;
  commissionType?: string;
  commissionValue?: number;
  duration?: number;
  price?: number;
}
export interface SaleOpenedDTO {
     uid?: string;
    salesCode?: string;
    paymentMethod?: string;
    paidAmount?:number;
    paymentStatus?:string;
    bill?:number;
}
export interface SalesOpened{
    uid?: string;
    salesCode?: string;
    paymentMethod?: string;
    paidAmount?:number;
    paymentStatus?:string;
    bill?:number;
}

export interface StaffCommissionDTO {
   /** How it was paid out: cash, mpesa, tigopesa, airtelmoney, halopesa or bank. */
   method?: string;
     uid?:string;
     amount?: number;
     filterDate?:string;
     remainingAmount?:number;
     firstName?:string;
     middleName?:string;
     lastName?:string;
     filter?:string;
     weekDate?:string;
     descriptions?:string;
}

export interface StoreDTO {
    uid?: string;
    nameOfStore?:string;
    codeOfStore?:string;
    quantity?:number;
    saloonServiceEntityUID?:string;
    description?:string;
    openedDate?:string;
    closedDate?:string;
    status?:string;
    buyingPrice?:number;
    /** What the whole lot cost - give this or buyingPrice. */
    totalPrice?:number;
    totalQuantityPrice?:number;
    usedQuantity?:number;
    notUsedQuantity?:number;
    openStoreUID?:string;
}
export interface Store {
    uid?: string;
    nameOfStore?:string;
    codeOfStore?:string;
    quantity?:number;
    description?:string;
    nameOfService?:string;
    codeOfService?:string;
    openedDate?:string;
    closedDate?:string;
    status?:string;
    buyingPrice?:number;
    totalQuantityPrice?:number;
    usedQuantity?:number;
    notUsedQuantity?:number;
    openedQuantity?:number;
    openStoreUID?:string;
}
export interface UserTableData {
  uid: string;
  username: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  roleName: string;
  branchName: string;
  /** True when their access has been revoked - they stay listed, they just
   *  cannot sign in. */
  isBlocked: boolean;
}

export interface SpendDTO {
   /** How it was paid out: cash, mpesa, tigopesa, airtelmoney, halopesa or bank. */
   method?: string;
   uid?: string;
   incomeExpensesUID?:string;
   amount?:number;
   description?:string;
}
export interface PayStockAndPurchaseDTO {
   /** How it was paid out: cash, mpesa, tigopesa, airtelmoney, halopesa or bank. */
   method?: string;
   uid?: string;
   amount?:number;
   description?:string;
   weekDate:Date;
}
