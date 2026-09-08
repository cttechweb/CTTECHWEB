import React, { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  type?: "website" | "product" | "article";
  structuredData?: object;
}

export default function SEOHead({
  title = "Cool Technologies | Direct Wholesale HVAC & Commercial Cooling UAE",
  description = "Cool Technologies is the leading B2B HVAC & cooling equipment supplier in UAE. Air conditioning systems, chillers, AHUs, water coolers & commercial refrigeration with direct wholesale rates.",
  canonicalUrl = "https://cooltechnologies.ae/",
  ogImage = "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80",
  type = "website",
  structuredData,
}: SEOHeadProps) {
  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // 2. Helper to set or create meta tag
    const setMeta = (nameOrProperty: string, value: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${nameOrProperty}"]` : `meta[name="${nameOrProperty}"]`;
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        if (isProperty) el.setAttribute("property", nameOrProperty);
        else el.setAttribute("name", nameOrProperty);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    // Standard Meta Tags
    setMeta("description", description);
    setMeta("viewport", "width=device-width, initial-scale=1.0, maximum-scale=5.0");
    setMeta("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    setMeta("author", "Cool Technologies UAE");

    // OpenGraph Meta Tags
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", type, true);
    setMeta("og:url", canonicalUrl, true);
    setMeta("og:image", ogImage, true);
    setMeta("og:site_name", "Cool Technologies", true);
    setMeta("og:locale", "en_AE", true);

    // Twitter Cards
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", ogImage);

    // 3. Canonical Tag
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    // 4. Hreflang Tags
    let hreflangAe = document.querySelector("link[hreflang='en-ae']") as HTMLLinkElement | null;
    if (!hreflangAe) {
      hreflangAe = document.createElement("link");
      hreflangAe.setAttribute("rel", "alternate");
      hreflangAe.setAttribute("hreflang", "en-ae");
      document.head.appendChild(hreflangAe);
    }
    hreflangAe.setAttribute("href", canonicalUrl);

    // 5. JSON-LD Schema.org Structured Data
    const defaultOrganizationSchema = {
      "@context": "https://schema.org",
      "@type": "HVACBusiness",
      "name": "Cool Technologies",
      "legalName": "Cool Technologies Engineering Solutions LLC",
      "url": "https://cooltechnologies.ae",
      "logo": "https://cooltechnologies.ae/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+971-2-5650123",
        "contactType": "customer service",
        "email": "info@cooltechuae.com",
        "areaServed": "AE",
        "availableLanguage": ["English", "Arabic"]
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Mussafah Industrial Area",
        "addressLocality": "Abu Dhabi",
        "addressRegion": "Abu Dhabi",
        "postalCode": "00000",
        "addressCountry": "AE"
      },
      "priceRange": "$$"
    };

    const finalSchema = structuredData || defaultOrganizationSchema;

    let scriptEl = document.querySelector("#schema-json-ld") as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = "schema-json-ld";
      scriptEl.setAttribute("type", "application/ld+json");
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(finalSchema);
  }, [title, description, canonicalUrl, ogImage, type, structuredData]);

  return null;
}
