export enum UserRole {
  OWNER = "OWNER",
  CLINIC = "CLINIC",
  VOLUNTEER = "VOLUNTEER",
  ADMIN = "ADMIN",
}

export enum AnimalType {
  DOG = "DOG",
  CAT = "CAT",
}

export enum DogBloodType {
  DEA_1_1_POS = "DEA_1_1_POS",
  DEA_1_1_NEG = "DEA_1_1_NEG",
  DEA_1_2 = "DEA_1_2",
  DEA_3 = "DEA_3",
  DEA_4 = "DEA_4",
  DEA_5 = "DEA_5",
  DEA_7 = "DEA_7",
}

export enum CatBloodType {
  A = "A",
  B = "B",
  AB = "AB",
}

export enum Urgency {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum RequestStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  FULFILLED = "FULFILLED",
  CANCELLED = "CANCELLED",
}

export enum ResponseStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export enum PartnerRank {
  LEGENDARY_DONOR = "LEGENDARY_DONOR",
  RELIABLE_ASSISTANT = "RELIABLE_ASSISTANT",
}

export enum PartnerType {
  VETERINARY_CLINIC = "VETERINARY_CLINIC",
  SHELTER = "SHELTER",
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  city: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AnimalPublic {
  id: string;
  name: string;
  type: AnimalType;
  breed: string | null;
  weight: number | null;
  age: number | null;
  bloodType: string | null;
  isDonor: boolean;
  isVaccinated: boolean;
  photoUrl: string | null;
  owner: {
    id: string;
    name: string;
    city: string | null;
  };
}

export interface DonationRequestPublic {
  id: string;
  animalType: AnimalType;
  bloodType: string;
  urgency: Urgency;
  status: RequestStatus;
  description: string | null;
  city: string | null;
  requester: {
    id: string;
    name: string;
  };
  createdAt: string;
  responsesCount: number;
}

export interface Partner {
  id: number;
  rank: PartnerRank;
  title: string;
  imageUrl: string;
  type: PartnerType;
  bloodDonations: number;
  plasmaDonations: number;
}

export interface Donor {
  id: string;
  imageUrl: string;
  title: string;
  address: string;
  bloodDonations: number;
  plasmaDonations: number;
}

export type PartnerPublic = Partner;
export type DonorPublic = Donor;
