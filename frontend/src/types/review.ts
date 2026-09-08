export type ReviewTarget = "homepage" | "service";
export type ReviewStatus = "pending" | "approved" | "rejected";

export interface ReviewItem {
  id: string;
  authorName: string;
  authorRole: string; // e.g. "Facility Director", "Villa Resident", "MEP Project Manager"
  location: string; // e.g. "Dubai Marina, UAE", "Saadiyat Island, Abu Dhabi"
  rating: number; // 1 to 5 stars
  comment: string;
  target: ReviewTarget; // "homepage" or "service"
  serviceTitle?: string; // e.g. "AC Deep Chemical Cleaning & Sanitization"
  authorAvatar?: string; // Base64 URL or image link
  status: ReviewStatus; // "pending" | "approved" | "rejected"
  createdAt: string; // ISO date string or formatted date
  verifiedBooking?: boolean;
  userId?: string;
  userEmail?: string;
}
