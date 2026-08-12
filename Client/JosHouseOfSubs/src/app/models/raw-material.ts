export interface RawMaterial {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
  category: InventoryCategory | null;
  minimumQuantity: number;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RawMaterialPayload {
  name: string;
  quantity: number;
  unit: string;
  categoryId: string;
  minimumQuantity: number;
  notes: string;
}

export interface InventoryCategory {
  _id: string;
  name: string;
  sortOrder: number;
}

export interface InventoryAdjustmentPayload {
  type: 'add' | 'remove';
  quantity: number;
  employeeName: string;
  notes: string;
}

export interface InventoryMovement {
  _id: string;
  material: string;
  materialName: string;
  type: 'add' | 'remove';
  quantity: number;
  unit: string;
  previousQuantity: number;
  newQuantity: number;
  employeeName: string;
  accountUsername: string;
  notes: string;
  createdAt: string;
}