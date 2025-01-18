import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";
import { ConsumableCategory } from "../models/consumableCategory";
import { CategoryDTO } from "../models/categoryDTO";

@Injectable({
  providedIn: "root",
})
export class ConsumableCategoriesService {
  private baseUrl = environment.baseUrl + "consumable-categories";

  constructor(private http: HttpClient) {}

  getAllConsumableCategories(): Observable<ConsumableCategory[]> {
    return this.http.get<ConsumableCategory[]>(this.baseUrl);
  }

  addConsumableCategory(
    consumableCategory: CategoryDTO
  ): Observable<ConsumableCategory> {
    return this.http.post<ConsumableCategory>(this.baseUrl, consumableCategory);
  }

  updateConsumableCategory(
    consumableCategory: ConsumableCategory
  ): Observable<ConsumableCategory> {
    return this.http.patch<ConsumableCategory>(
      `${this.baseUrl}/${consumableCategory.id}`,
      consumableCategory
    );
  }
}
