/**
 * Device & Telemetry Security Utility for Cool Technologies Admin Portal
 * Captures browser, OS, client IP, geolocation, and timestamps for security alerts.
 */

export interface DeviceSecurityInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  isp: string;
  browser: string;
  os: string;
  deviceType: "Desktop" | "Mobile" | "Tablet";
  userAgent: string;
  timeUae: string;
  timeUtc: string;
}

export function parseUserAgent(): { browser: string; os: string; deviceType: "Desktop" | "Mobile" | "Tablet" } {
  if (typeof window === "undefined" || !navigator?.userAgent) {
    return { browser: "Unknown Browser", os: "Unknown OS", deviceType: "Desktop" };
  }

  const ua = navigator.userAgent;
  let browser = "Unknown Browser";
  let os = "Unknown OS";
  let deviceType: "Desktop" | "Mobile" | "Tablet" = "Desktop";

  // Detect Device Type
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceType = "Tablet";
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    deviceType = "Mobile";
  }

  // Detect Operating System
  if (/Windows NT 10.0/i.test(ua)) os = "Windows 10/11";
  else if (/Windows NT 6.3/i.test(ua)) os = "Windows 8.1";
  else if (/Windows NT 6.2/i.test(ua)) os = "Windows 8";
  else if (/Windows NT 6.1/i.test(ua)) os = "Windows 7";
  else if (/Mac OS X/i.test(ua)) {
    const match = ua.match(/Mac OS X ([0-9_]+)/);
    os = match ? `macOS ${match[1].replace(/_/g, ".")}` : "macOS";
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    const match = ua.match(/OS ([0-9_]+)/);
    os = match ? `iOS ${match[1].replace(/_/g, ".")}` : "iOS";
  } else if (/Android/i.test(ua)) {
    const match = ua.match(/Android ([0-9.]+)/);
    os = match ? `Android ${match[1]}` : "Android";
  } else if (/Linux/i.test(ua)) {
    os = "Linux";
  }

  // Detect Browser
  if (/Edg\//i.test(ua)) {
    browser = "Microsoft Edge";
  } else if (/Chrome\//i.test(ua) && !/Chromium|Edg/i.test(ua)) {
    browser = "Google Chrome";
  } else if (/Safari\//i.test(ua) && !/Chrome|Chromium|Edg/i.test(ua)) {
    browser = "Apple Safari";
  } else if (/Firefox\//i.test(ua)) {
    browser = "Mozilla Firefox";
  } else if (/Opera|OPR\//i.test(ua)) {
    browser = "Opera";
  }

  return { browser, os, deviceType };
}

export async function getDeviceSecurityInfo(): Promise<DeviceSecurityInfo> {
  const uaDetails = parseUserAgent();
  const now = new Date();

  const timeUae = now.toLocaleString("en-GB", {
    timeZone: "Asia/Dubai",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }) + " (GST / UTC+4)";

  const timeUtc = now.toUTCString();

  let ip = "127.0.0.1";
  let city = "Local / Dubai";
  let region = "Dubai";
  let country = "United Arab Emirates";
  let isp = "Etisalat / du";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.ip) ip = data.ip;
      if (data.city) city = data.city;
      if (data.region) region = data.region;
      if (data.country_name) country = data.country_name;
      if (data.org) isp = data.org;
    }
  } catch {
    // Fallback: fast IP fetch without blocking
    try {
      const resFallback = await fetch("https://api.ipify.org?format=json");
      if (resFallback.ok) {
        const data = await resFallback.json();
        if (data.ip) ip = data.ip;
      }
    } catch {
      // Keep defaults if offline/restricted
    }
  }

  return {
    ip,
    city,
    region,
    country,
    isp,
    browser: uaDetails.browser,
    os: uaDetails.os,
    deviceType: uaDetails.deviceType,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    timeUae,
    timeUtc,
  };
}
