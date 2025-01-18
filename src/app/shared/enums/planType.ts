export enum PlanType {
  batten = "batten",
  purlin = "purlin",
  truss = "truss",
  wallFrame = "wall frame",
  sheet = "sheet",
}

export const PLAN_TYPES = ["batten", "purlin", "truss", "wall frame", "sheet"];

export const PLAN_TYPE_MAPPING: Record<string, PlanType> = {
  Batten: PlanType.batten,
  Purlins: PlanType.purlin,
  Truss: PlanType.truss,
  wallFrame: PlanType.wallFrame,
  Sheet: PlanType.sheet,
};
