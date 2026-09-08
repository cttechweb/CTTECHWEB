/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Blog & Technical Articles Service
   Database: Cloudflare D1 (via Cloudflare Worker API)
───────────────────────────────────────────────────────────────── */

import { BlogPost } from "../types";
import { INITIAL_BLOG_POSTS } from "../data/initialBlogs";
import { apiClient } from "../services/apiClient";

const LOCAL_STORAGE_KEY = "cooltech_blogs_v1";

function getLocalBlogsCache(): BlogPost[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_BLOG_POSTS;
  } catch {
    return INITIAL_BLOG_POSTS;
  }
}

function saveLocalBlogsCache(blogs: BlogPost[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(blogs));
    window.dispatchEvent(new CustomEvent("cooltech_blogs_updated", { detail: blogs }));
  } catch {}
}

/**
 * Fetch all published/active blog posts from Cloudflare D1
 */
export async function getBlogs(): Promise<BlogPost[]> {
  try {
    const res = await apiClient.getBlogs();
    if (res?.blogs && Array.isArray(res.blogs) && res.blogs.length > 0) {
      saveLocalBlogsCache(res.blogs);
      return res.blogs as BlogPost[];
    }
  } catch (err) {
    console.warn("[Blog Service] Error fetching blogs from D1:", err);
  }

  return getLocalBlogsCache();
}

/**
 * Fetch a single blog post by Slug or ID from Cloudflare D1
 */
export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const res = await apiClient.getBlogBySlug(slug);
    if (res?.blog) {
      return res.blog as BlogPost;
    }
  } catch (err) {
    console.warn("[Blog Service] Error fetching blog by slug from D1:", err);
  }

  const cached = getLocalBlogsCache().find((b) => b.slug === slug || b.id === slug);
  return cached || null;
}

/**
 * Real-time / dynamic listener for blog posts
 */
export function subscribeToBlogs(
  onUpdate: (blogs: BlogPost[]) => void
): () => void {
  const initial = getLocalBlogsCache();
  onUpdate(initial);

  getBlogs().then((fresh) => {
    if (Array.isArray(fresh) && fresh.length > 0) {
      onUpdate(fresh);
    }
  });

  const handleUpdate = (e: any) => {
    if (e?.detail && Array.isArray(e.detail)) {
      onUpdate(e.detail);
    }
  };

  window.addEventListener("cooltech_blogs_updated", handleUpdate);
  return () => {
    window.removeEventListener("cooltech_blogs_updated", handleUpdate);
  };
}

/**
 * Save or Update a Blog Post in Cloudflare D1 (Admin)
 */
export async function saveBlogToDatabase(blog: BlogPost): Promise<void> {
  const cached = getLocalBlogsCache();
  const existingIndex = cached.findIndex((b) => b.id === blog.id);
  let updated: BlogPost[];
  if (existingIndex >= 0) {
    updated = [...cached];
    updated[existingIndex] = blog;
  } else {
    updated = [blog, ...cached];
  }
  saveLocalBlogsCache(updated);

  try {
    if (existingIndex >= 0) {
      await apiClient.updateBlog(blog.id, blog);
    } else {
      await apiClient.createBlog(blog);
    }
  } catch (err) {
    console.warn("[Blog Service] Error saving blog to Cloudflare D1:", err);
  }
}

/**
 * Delete a Blog Post from Cloudflare D1 (Admin)
 */
export async function deleteBlogFromDatabase(blogId: string): Promise<void> {
  const cached = getLocalBlogsCache();
  const filtered = cached.filter((b) => b.id !== blogId);
  saveLocalBlogsCache(filtered);

  try {
    await apiClient.deleteBlog(blogId);
  } catch (err) {
    console.warn("[Blog Service] Error deleting blog from Cloudflare D1:", err);
  }
}

/**
 * Bulk Delete Blog Posts from Cloudflare D1 (Admin)
 */
export async function bulkDeleteBlogsFromDatabase(blogIds: string[]): Promise<void> {
  for (const id of blogIds) {
    await deleteBlogFromDatabase(id);
  }
}
