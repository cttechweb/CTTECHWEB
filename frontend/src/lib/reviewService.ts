/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Customer Reviews Service
   Database: Cloudflare D1 (via Cloudflare Worker API)
───────────────────────────────────────────────────────────────── */

import { ReviewItem, ReviewStatus } from "../types/review";
import { INITIAL_REVIEWS } from "../data/initialReviews";
import { apiClient } from "../services/apiClient";
import { sendEmailNotification } from "../services/emailService";

const STORAGE_KEY = "cooltech_reviews_v1";

export function getLocalReviews(): ReviewItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to load local reviews cache:", err);
  }
  return [];
}

export function saveLocalReviews(reviews: ReviewItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    window.dispatchEvent(new CustomEvent("cooltech_reviews_updated", { detail: reviews }));
  } catch (err) {
    console.warn("Failed to save local reviews cache:", err);
  }
}

/**
 * Fetch all reviews from Cloudflare D1
 */
export async function getReviews(): Promise<ReviewItem[]> {
  try {
    const res = await apiClient.getReviews();
    if (res?.reviews && Array.isArray(res.reviews)) {
      saveLocalReviews(res.reviews);
      return res.reviews as ReviewItem[];
    }
  } catch (err) {
    console.warn("[Review Service] Error fetching reviews from D1:", err);
  }

  return getLocalReviews();
}

/**
 * Real-time / dynamic listener for reviews
 */
export function subscribeToReviews(onUpdate: (reviews: ReviewItem[]) => void): () => void {
  const initial = getLocalReviews();
  onUpdate(initial);

  getReviews().then((fresh) => {
    if (Array.isArray(fresh)) {
      onUpdate(fresh);
    }
  });

  const handleUpdate = (e: any) => {
    if (e?.detail && Array.isArray(e.detail)) {
      onUpdate(e.detail);
    }
  };

  window.addEventListener("cooltech_reviews_updated", handleUpdate);
  return () => {
    window.removeEventListener("cooltech_reviews_updated", handleUpdate);
  };
}

/**
 * Save or Add a review to Cloudflare D1
 */
export async function saveReviewToDatabase(review: ReviewItem): Promise<boolean> {
  const current = getLocalReviews();
  const existingIdx = current.findIndex((r) => r.id === review.id);
  let updated: ReviewItem[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = review;
  } else {
    updated = [review, ...current];
  }
  saveLocalReviews(updated);

  try {
    if (existingIdx >= 0) {
      await apiClient.updateReview(review.id, review);
    } else {
      await apiClient.submitReview(review);

      // Trigger real-time EmailJS notification for customer review
      const author = review.authorName || "Anonymous";
      const role = review.authorRole || "Client";
      const senderMail = review.userEmail || "reviews@cooltechuae.com";
      sendEmailNotification({
        type: "review",
        title: `New Review (${review.rating}★) from ${author}`,
        senderName: author,
        senderEmail: senderMail,
        subject: `[Cool Technologies] Customer Review - ${author} (${review.rating}/5 Stars)`,
        message: review.comment,
        detailsText: `Reviewer: ${author}\nRole / Company: ${role}\nLocation: ${review.location || "UAE"}\nRating: ${review.rating} / 5 Stars\nTarget: ${review.target || "General"}\nStatus: Pending Admin Moderation\n\nReview Comment:\n${review.comment}`,
        customParams: {
          rating: review.rating,
          reviewer_role: role
        }
      }).catch((emailErr) => {
        console.warn("[ReviewService] Email dispatch error:", emailErr);
      });
    }
    return true;
  } catch (error) {
    console.error("[Review Service] Error saving review to Cloudflare D1:", error);
    return false;
  }
}

/**
 * Update review status in Cloudflare D1 (Admin Moderation)
 */
export async function updateReviewStatusInDatabase(reviewId: string, status: ReviewStatus): Promise<boolean> {
  const current = getLocalReviews();
  const updated = current.map((r) => (r.id === reviewId ? { ...r, status } : r));
  saveLocalReviews(updated);

  try {
    await apiClient.updateReview(reviewId, { status });
    return true;
  } catch (error) {
    console.error("[Review Service] Error updating review status in D1:", error);
    return false;
  }
}

/**
 * Delete review from Cloudflare D1 (Admin)
 */
export async function deleteReviewFromDatabase(reviewId: string): Promise<boolean> {
  const current = getLocalReviews();
  const updated = current.filter((r) => r.id !== reviewId);
  saveLocalReviews(updated);

  try {
    await apiClient.deleteReview(reviewId);
    return true;
  } catch (error) {
    console.error("[Review Service] Error deleting review from D1:", error);
    return false;
  }
}
