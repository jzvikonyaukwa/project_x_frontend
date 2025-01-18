import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { Project } from "../models/project";
import { Observable } from "rxjs";
import { ProjectDetails } from "../models/projectDetails";
import { ProjectPOSTDTO } from "../models/projectPOSTDTO";
import { ProjectSummary } from "../models/projectSummary";
import { ProjectOverview } from "../models/projectOverview";

@Injectable({
  providedIn: "root",
})
export class ProjectService {
  private baseUrl = environment.baseUrl + "projects";
  constructor(private http: HttpClient) {}

  public getALlProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.baseUrl + "/all-projects");
  }

  public getAllProjectsSummary(): Observable<ProjectSummary[]> {
    return this.http.get<ProjectSummary[]>(this.baseUrl + "/summary");
  }

  public getProject(projectId: number): Observable<ProjectDetails> {
    return this.http.get<ProjectDetails>(this.baseUrl + "/" + projectId);
  }

  public getProjectOverview(projectId: number): Observable<ProjectOverview> {
    return this.http.get<ProjectOverview>(
      this.baseUrl + "/" + projectId + "/overview"
    );
  }

  public getClientsProjects(clientId: number): Observable<ProjectDetails[]> {
    return this.http.get<ProjectDetails[]>(
      this.baseUrl + "/client-projects/" + clientId
    );
  }

  public addProject(project: ProjectPOSTDTO): Observable<Project> {
    return this.http.post<Project>(this.baseUrl, project);
  }
}
