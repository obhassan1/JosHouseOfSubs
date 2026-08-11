export interface RawMaterial {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
  minimumQuantity: number;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RawMaterialPayload {
  name: string;
  quantity: number;
  unit: string;
  minimumQuantity: number;
  notes: string;
}