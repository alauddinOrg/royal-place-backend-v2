import { Types } from "mongoose";

export enum UserRole {
  User = "guest",
  Admin = "admin",
  Receptionist = "receptionist",
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  image:string;
  email: string;
  password: string; 
  role: UserRole;
  isDeleted:boolean;
  createdAt: Date;
  updatedAt: Date;
  phone?: string;
  
}

export interface IUserQueryparams {
  searchTerm: string;
  limit: number;
  page: number;

}


// update interfce 
export interface IUpdateUserInput {
  name?: string;
  phone?: string;
  image?: string;
}
