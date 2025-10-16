

export interface IService{
    name: string;
    image:string;
    description?: string;
    pricePerDay: number;
    isServiceFree:boolean;
    isActive:boolean;
}
