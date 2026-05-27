export enum UserRole {
  OWNER = "OWNER",
  CLINIC = "CLINIC",
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

export enum PartnerRank {
  LEGENDARY_DONOR = "LEGENDARY_DONOR",
  RELIABLE_ASSISTANT = "RELIABLE_ASSISTANT",
}

export enum PartnerType {
  VETERINARY_CLINIC = "VETERINARY_CLINIC",
  SHELTER = "SHELTER",
}

export enum SubscriptionPlan {
  WEEK = "WEEK",
  MONTH = "MONTH",
}

export enum BloodInventoryStatus {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  USED = "USED",
  EXPIRED = "EXPIRED",
}

export enum ClinicVerificationStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export enum PartnershipRequestStatus {
  NEW = "NEW",
  IN_REVIEW = "IN_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  ARCHIVED = "ARCHIVED",
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
  rank: PartnerRank;
  bloodDonations: number;
  plasmaDonations: number;
}

export type PartnerPublic = Partner;
export type DonorPublic = Donor;

export interface SubscriptionState {
  plan: SubscriptionPlan | null;
  expiresAt: string | null;
  isActive: boolean;
}

export interface ClinicPublic {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  websiteUrl: string | null;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  workingHours: string | null;
  licenseNo: string | null;
  avatarUrl: string | null;
  verificationStatus: ClinicVerificationStatus;
}

export interface BloodInventoryPublic {
  id: string;
  clinicId: string;
  animalType: AnimalType;
  bloodType: string;
  volumeMl: number | null;
  unitsCount: number;
  donationDate: string | null;
  expiresAt: string | null;
  status: BloodInventoryStatus;
  notes: string | null;
}

export interface BloodSearchClinicResult {
  clinic: ClinicPublic;
  matchedUnits: number;
  totalVolumeMl: number;
  distanceKm: number | null;
}
