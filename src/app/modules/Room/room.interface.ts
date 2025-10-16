
export enum RoomType {
  Luxury = "luxury",
  Suite = "suite",
  Deluxe = "deluxe",
  Twin = "twin",
}

export enum RoomStatus {
  Active = "active",
  Maintenance = "maintenance",
  Inactive = "inactive",

}

enum BedType {
  King = "king",
  Queen = "queen",
  Twin = "twin",
  Double = "double",
  Single = "single",
}



export interface IRoom {

  roomNumber: string;
  floor: number;
  title?: string;
  images?: string[];
  features: string[];
  description?: string;
  type: RoomType;
  price?: number;
  adults: number;
  maxOccupancy?: number;
  children: number;
  bedType: BedType;
  bedCount: number;
  roomStatus: RoomStatus;
}
