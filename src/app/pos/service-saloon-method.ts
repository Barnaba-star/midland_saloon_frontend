import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../Utils/enviroments/environment';
import { CommissionDTO, PayStockAndPurchaseDTO, SaleOpenedDTO, SaloonBookingDTO, SaloonSalesDTO, SaloonServiceDTO, SaloonStaffDTO, SpendDTO, StaffCommissionDTO, StoreDTO } from './SaloonModel';
import { PageableParam, Response, ResponseList, ResponsePage } from '../Utils/models/responces';

@Injectable({
  providedIn: 'root',
})
export class ServiceSaloonMethod {
    constructor(private http:HttpClient){}
      private api = environment.baseApiUrl
      private saloonURL: string = `${this.api}/saloon`;
      private roleURL: string = `${this.api}/role`;

  refreshPage(): void {
    window.location.reload();
  }

/***
 * SALOON-SERVICES-METHODS
 */

saveSaloonEntity(saloonServiceDTO:SaloonServiceDTO):Observable<Response<any>>{
  return this.http.post<Response<any>>(`${this.saloonURL}/saveSaloonEntity`, saloonServiceDTO);
}
findSaloonServiceByUID(saloonServiceUID:string):Observable<Response<any>>{
  return this.http.get<Response<any>>(`${this.saloonURL}/findSaloonServiceByUID/${saloonServiceUID}`);
}
findSaloonServiceList():Observable<ResponseList<any>>{
  return this.http.get<ResponseList<any>>(`${this.saloonURL}/findSaloonServiceList`)
}
findSaloonServicePage(params: PageableParam): Observable<ResponsePage<any>> {
    return this.http.post<ResponsePage<any>>(`${this.saloonURL}/findSaloonServicePage`, params);
}
deleteServiceSaloonByUID(saloonServiceUID:string):Observable<Response<any>>{
  return this.http.post<Response<any>>(`${this.saloonURL}/deleteServiceSaloonByUID/${saloonServiceUID}`, null)
}

/***
 * SALOON-COMMISSIONS-METHODS
 */
saveCommissions(commissionsDTO:CommissionDTO):Observable<Response<any>>{
  return this.http.post<Response<any>>(`${this.saloonURL}/saveCommissions`, commissionsDTO);
}
findCommissionByUID(commissionUID:string):Observable<Response<any>>{
  return this.http.get<Response<any>>(`${this.saloonURL}/findCommissionByUID/${commissionUID}`);
}
findCommissionList():Observable<ResponseList<any>>{
  return this.http.get<ResponseList<any>>(`${this.saloonURL}/findCommissionList`)
}
findCommissionPage(params: PageableParam): Observable<ResponsePage<any>> {
    return this.http.post<ResponsePage<any>>(`${this.saloonURL}/findCommissionPage`, params);
}
deleteCommission(commissionUID:string):Observable<Response<any>>{
  return this.http.post<Response<any>>(`${this.saloonURL}/deleteCommission/${commissionUID}`, null)
}

/***
 * SALOON-STAFF-METHODS
 */
saveSaloonStaff(saloonStaffDTO:SaloonStaffDTO):Observable<Response<any>>{
  return this.http.post<Response<any>>(`${this.saloonURL}/saveSaloonStaff`, saloonStaffDTO);
}
findSaloonStaffByUID(saloonStaffUID:string):Observable<Response<any>>{
  return this.http.get<Response<any>>(`${this.saloonURL}/findSaloonStaffByUID/${saloonStaffUID}`);
}
findSaloonStaffList():Observable<ResponseList<any>>{
  return this.http.get<ResponseList<any>>(`${this.saloonURL}/findSaloonStaffList`);
}
findSaloonStaffPage(params: PageableParam): Observable<ResponsePage<any>> {
    return this.http.post<ResponsePage<any>>(`${this.saloonURL}/findSaloonStaffPage`, params);
}
deleteSaloonStaff(saloonStaffUID:string):Observable<Response<any>>{
  return this.http.post<Response<any>>(`${this.saloonURL}/deleteSaloonStaff/${saloonStaffUID}`, null);
}

/***
 * SALOON-BOOKING-METHODS
 */
saveServiceBooking(saloonBookingDTO:SaloonBookingDTO):Observable<Response<any>>{
  return this.http.post<Response<any>>(`${this.saloonURL}/saveServiceBooking`, saloonBookingDTO);
}
findSaloonBookingByUID(saloonBookingUID:string):Observable<Response<any>>{
  return this.http.get<Response<any>>(`${this.saloonURL}/findSaloonBookingByUID/${saloonBookingUID}`);
}
findSaloonBooking():Observable<ResponseList<any>>{
  return this.http.get<ResponseList<any>>(`${this.saloonURL}/findSaloonBooking`);
}
findSaloonBookingPage(params: PageableParam): Observable<ResponsePage<any>> {
    return this.http.post<ResponsePage<any>>(`${this.saloonURL}/findSaloonBookingPage`, params);
}
deleteSaloonBooking(saloonBookingUID:string):Observable<Response<any>>{
  return this.http.post<Response<any>>(`${this.saloonURL}/deleteSaloonBooking/${saloonBookingUID}`, null);
}

/***
 * SALOON-SALES-METHODS
 */
saveSaloonSales(saloonSalesDTO:SaloonSalesDTO):Observable<Response<any>>{
  return this.http.post<Response<any>>(`${this.saloonURL}/saveSaloonSales`, saloonSalesDTO);
}
findSaloonSalesByUID(saloonSalesUID:string):Observable<Response<any>>{
  return this.http.get<Response<any>>(`${this.saloonURL}/findSaloonSalesByUID/${saloonSalesUID}`);
}
findSaloonSalesList(saloonOpenUID: string): Observable<ResponseList<any>> {
  return this.http.get<ResponseList<any>>( `${this.saloonURL}/findSaloonSalesList/${saloonOpenUID}`);
}

findSaloonSalesListActiveTrue(): Observable<ResponseList<any>> {
  return this.http.get<ResponseList<any>>( `${this.saloonURL}/findSaloonSalesListActiveTrue`);
}

salesOpenedList(): Observable<ResponseList<any>> {
  return this.http.get<ResponseList<any>>( `${this.saloonURL}/salesOpenedList`);
}

findSaloonSalesPage(params: PageableParam): Observable<ResponsePage<any>> {
    return this.http.post<ResponsePage<any>>(`${this.saloonURL}/findSaloonSalesPage`, params);
}
deleteSaloonSales(saloonSalesUID:string):Observable<Response<any>>{
  return this.http.post<Response<any>>(`${this.saloonURL}/deleteSaloonSales/${saloonSalesUID}`, null);
}

saveOpenSale(saleOpenedDTO: SaleOpenedDTO ):Observable<Response<any>>{
  return this.http.post<Response<any>>(`${this.saloonURL}/saveOpenSale`, saleOpenedDTO);
}

salesOpenedListByStatus(filter: string): Observable<Response<any>> {
  return this.http.get<Response<any>>(`${this.saloonURL}/salesOpenedListByStatus/${filter}`);
}

findStaffCommissionPage(params: PageableParam): Observable<ResponsePage<any>> {
  return this.http.post<ResponsePage<any>>(`${this.saloonURL}/findStaffCommissionPage`, params);
}

/***
 * SALOON-REPORTS-METHODS
 */

findSaloonReportByUID(saloonReportsUID:string):Observable<Response<any>>{
  return this.http.get<Response<any>>(`${this.saloonURL}/findSaloonReportByUID/${saloonReportsUID}`);
}
findSaloonReportsPage(params: PageableParam): Observable<ResponsePage<any>> {
    return this.http.post<ResponsePage<any>>(`${this.saloonURL}/findSaloonReportsPage`, params);
}



findSaloonRevenueReport(date: string): Observable<Response<any>> {
  return this.http.get<Response<any>>(`${this.saloonURL}/findSaloonRevenueReport/${date}`);
}

findSaloonRevenueByService(date: string): Observable<Response<any>> {
  return this.http.get<Response<any>>(`${this.saloonURL}/findSaloonRevenueByService/${date}`);
}

payStaffCommission(staffCommissionDTO:StaffCommissionDTO):Observable<Response<any>>{
  return this.http.post<Response<any>>(`${this.saloonURL}/payStaffCommission`, staffCommissionDTO);
}

findCurrentSaloonRevenueByService(filter: string): Observable<Response<any>> {
  return this.http.get<Response<any>>(`${this.saloonURL}/findCurrentSaloonRevenueByService/${filter}`);
}

findCurrentSaloonReportsPage(params: PageableParam): Observable<ResponsePage<any>> {
    return this.http.post<ResponsePage<any>>(`${this.saloonURL}/findCurrentSaloonReportsPage`, params);
}

findCurrentSaloonRevenueReport(filter: string): Observable<Response<any>> {
  return this.http.get<Response<any>>(`${this.saloonURL}/findCurrentSaloonRevenueReport/${filter}`);
}



/***
 * SALOON-STORE-METHODS
 */
saveStore(storeDTO:StoreDTO):Observable<Response<any>>{
  return this.http.post<Response<any>>(`${this.saloonURL}/saveStore`, storeDTO);
}

addQuantityToStore(storeDTO:StoreDTO):Observable<Response<any>>{
  return this.http.post<Response<any>>(`${this.saloonURL}/addQuantityToStore`, storeDTO);
}

findSaloonStoreList():Observable<ResponseList<any>>{
  return this.http.get<ResponseList<any>>(`${this.saloonURL}/findSaloonStoreList`);
}
findSaloonStorePage(params: PageableParam): Observable<ResponsePage<any>> {
    return this.http.post<ResponsePage<any>>(`${this.saloonURL}/findSaloonStorePage`, params);
}
findOpenStorePage(params: PageableParam): Observable<ResponsePage<any>> {
    return this.http.post<ResponsePage<any>>(`${this.saloonURL}/findOpenStorePage`, params);
}
deleteStore(storeUID:string):Observable<Response<any>>{
  return this.http.post<Response<any>>(`${this.saloonURL}/deleteStore/${storeUID}`, null);
}
openStore(storeDTO:StoreDTO):Observable<Response<any>>{
  return this.http.post<Response<any>>(`${this.saloonURL}/openStore`, storeDTO);
}
closeOpenStore(storeDTO:StoreDTO):Observable<Response<any>>{
  return this.http.post<Response<any>>(`${this.saloonURL}/closeOpenStore`, storeDTO);
}

findServiceEntityUIDList(status:string):Observable<Response<any>> {
  return this.http.get<Response<any>>(`${this.saloonURL}/findServiceEntityUIDList/${status}`);
}

findServiceAndStoreReportPage(params: PageableParam): Observable<ResponsePage<any>> {
    return this.http.post<ResponsePage<any>>(`${this.saloonURL}/findServiceAndStoreReportPage`, params);
}

/***
 * SALOON-USERS-METHODS
 */
findUserPageByBranch(params: PageableParam): Observable<ResponsePage<any>> {
    return this.http.post<ResponsePage<any>>(`${this.saloonURL}/findUserPageByBranch`, params);
}

/***
 * SALOON-INCOME-EXPENSES
 */
findIncomeExpenses(filter:string):Observable<Response<any>> {
  return this.http.get<Response<any>>(`${this.saloonURL}/findIncomeExpenses/${filter}`);
}
addSpend(spendDTO:SpendDTO):Observable<Response<any>>{
  return this.http.post<Response<any>>(`${this.saloonURL}/addSpend`, spendDTO);
}
findIncomeExpensesAndDescription(incomeUID:string):Observable<Response<any>> {
  return this.http.get<Response<any>>(`${this.saloonURL}/findIncomeExpensesAndDescription/${incomeUID}`);
}

/***
 * SALOON-STOCK-AND-PURCHASE
 */
getStockAndPurchaseByFilter(weekFilter:string):Observable<Response<any>> {
  return this.http.get<Response<any>>(`${this.saloonURL}/getStockAndPurchaseByFilter/${weekFilter}`);
}
payStockAndPurchase(payStockAndPurchaseDTO:PayStockAndPurchaseDTO):Observable<Response<any>>{
  return this.http.post<Response<any>>(`${this.saloonURL}/payStockAndPurchase`, payStockAndPurchaseDTO);
}

findStockPurchaseByUid(stockUID:string):Observable<ResponseList<any>> {
  return this.http.get<ResponseList<any>>(`${this.saloonURL}/findStockPurchaseByUid/${stockUID}`);
}

findRoleByBranch():Observable<ResponseList<any>> {
  return this.http.get<ResponseList<any>>(`${this.roleURL}/findRoleByBranch`);
}

/***
 * POS-HOME-DASHBOARD
 */

findBranchDashboard(): Observable<Response<any>> {
  return this.http.get<Response<any>>(`${this.saloonURL}/findBranchDashboard`);
}

findRevenueTrend(days: number): Observable<ResponseList<any>> {
  return this.http.get<ResponseList<any>>(`${this.saloonURL}/findRevenueTrend/${days}`);
}

findStaffEarnings(): Observable<ResponseList<any>> {
  return this.http.get<ResponseList<any>>(`${this.saloonURL}/findStaffEarnings`);
}
}
