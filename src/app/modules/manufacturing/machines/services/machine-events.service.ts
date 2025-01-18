import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { MachineEventDTO } from '../models/machineEventDTO';
import { MachineEvent } from '../models/machineEvent';
import { SteelCoilInUseId } from '../models/steelCoilInUseId';
import { SteelCoilDetailsDTO } from '@shared/models/steelCoilDetailsDTO';

@Injectable({
  providedIn: 'root',
})
export class MachineEventsService {
  private baseUrl = environment.baseUrl + 'machine-events';

  private machinesLatestEvent = new BehaviorSubject<MachineEvent | null>(null);
  public machinesLatestEvent$ = this.machinesLatestEvent.asObservable();

  constructor(private httpClient: HttpClient) {}

  getAllMachinesEvents(machineId: number): Observable<MachineEventDTO[]> {
    return this.httpClient.get<MachineEventDTO[]>(
      this.baseUrl + '/machine/' + machineId + '/all-events',
    );
  }

  getMachinesLastEvent(machineId: number): Observable<MachineEvent> {
    return this.httpClient
      .get<MachineEvent>(`${this.baseUrl}/machines-last-event/${machineId}`)
      .pipe(
        tap((machineEvent) => {
          console.log('machineEvent', machineEvent);
          this.machinesLatestEvent.next(machineEvent);
        }),
      );
  }

  getCoilIdInUse(machineId: number): Observable<SteelCoilInUseId> {
    return this.httpClient.get<SteelCoilInUseId>(
      this.baseUrl + '/machine/' + machineId + '/coil-in-use',
    );
  }

  loadCoil(machineId: number, steelCoilId: number): Observable<MachineEvent> {
    return this.httpClient.post<MachineEvent>(
      this.baseUrl + '/load-coil/' + machineId + '/' + steelCoilId,
      {},
    );
  }

  convertSteelCoilToSteelCoilDetailsDTO(machineEvent: MachineEvent): SteelCoilDetailsDTO {
    console.log('convertSteelCoilToSteelCoilDetailsDTO and machineEvent :', machineEvent);

    if (machineEvent == null || machineEvent.steelCoil == null) return;

    return {
      steelCoilId: machineEvent.steelCoil.id,
      coilNumber: machineEvent.steelCoil.coilNumber,
      cssColor: machineEvent.steelCoil.steelSpecification.color.cssColor,
      estMtrsRemaining: machineEvent.steelCoil.estimatedMetersRemaining,
      weightInKgsArrival: machineEvent.steelCoil.weightInKgsOnArrival,
      cardNumber: machineEvent.steelCoil.cardNumber,
      isqGrade: machineEvent.steelCoil.steelSpecification.isqgrade,
      gauge: machineEvent.steelCoil.steelSpecification.gauge.gauge,
      width: machineEvent.steelCoil.steelSpecification.width.width,
      coating: machineEvent.steelCoil.steelSpecification.coating,
      color: machineEvent.steelCoil.steelSpecification.color.color,
      loadedTime: machineEvent.loadedTime,
      cutsMade: machineEvent.cutsMade,
      totalMetersCut: machineEvent.totalMetersCut,
      finish: '',
      landedCostPerMtr: -1,
      dateReceived: null,
    };
  }

  getTotalMetersCut(startDate?: string, endDate?: string): Observable<MachineTotalMetersCut[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.httpClient.get<MachineTotalMetersCut[]>(`${this.baseUrl}/total-meters-cut`, {
      params,
    });
  }
}

export interface MachineTotalMetersCut {
  machineName: string;
  totalMetersCut: number;
}
