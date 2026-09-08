import React, { useState, useEffect } from "react";
import { 
  Facebook, 
  Linkedin, 
  Instagram, 
  Twitter, 
  Youtube, 
  MessageSquare, 
  Globe, 
  Mail 
} from "lucide-react";
import { getGeneralSettings, DEFAULT_WHATSAPP_SETTINGS, DEFAULT_SOCIAL_LINKS } from "../../services/generalSettingsService";
import { DynamicSocialLink, WhatsAppRoutingSettings } from "../../types";

export default function FloatingWidgets() {
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppRoutingSettings>(() => {
    const s = getGeneralSettings();
    return s.whatsappSettings || DEFAULT_WHATSAPP_SETTINGS;
  });

  const [socialLinks, setSocialLinks] = useState<DynamicSocialLink[]>(() => {
    const s = getGeneralSettings();
    return s.socialLinks && s.socialLinks.length > 0 ? s.socialLinks : DEFAULT_SOCIAL_LINKS;
  });

  const refreshSettings = () => {
    const s = getGeneralSettings();
    if (s.whatsappSettings) setWhatsappSettings(s.whatsappSettings);
    if (s.socialLinks && s.socialLinks.length > 0) setSocialLinks(s.socialLinks);
  };

  useEffect(() => {
    refreshSettings();
    window.addEventListener("cooltech_contact_settings_updated", refreshSettings);
    window.addEventListener("cooltech_settings_updated", refreshSettings);
    window.addEventListener("storage", refreshSettings);

    return () => {
      window.removeEventListener("cooltech_contact_settings_updated", refreshSettings);
      window.removeEventListener("cooltech_settings_updated", refreshSettings);
      window.removeEventListener("storage", refreshSettings);
    };
  }, []);

  const activeSocials = socialLinks.filter((l) => l.isActive);

  // Render individual icon for preset or custom upload
  const renderSocialIcon = (link: DynamicSocialLink) => {
    if (link.iconType === "custom_upload" && link.customIconUrl) {
      return (
        <img
          src={link.customIconUrl}
          alt={link.platform}
          className="w-[18px] h-[18px] object-cover rounded-xs group-hover:scale-110 transition-transform"
        />
      );
    }

    const name = (link.iconPresetName || link.platform || "").toLowerCase();
    if (name.includes("face")) return <Facebook size={18} className="group-hover:scale-110 transition-transform" />;
    if (name.includes("insta")) return <Instagram size={18} className="group-hover:scale-110 transition-transform" />;
    if (name.includes("link")) return <Linkedin size={18} className="group-hover:scale-110 transition-transform" />;
    if (name.includes("twit") || name.includes("x")) return <Twitter size={18} className="group-hover:scale-110 transition-transform" />;
    if (name.includes("you") || name.includes("tube")) return <Youtube size={18} className="group-hover:scale-110 transition-transform" />;
    if (name.includes("what")) return <MessageSquare size={18} className="group-hover:scale-110 transition-transform" />;
    if (name.includes("mail")) return <Mail size={18} className="group-hover:scale-110 transition-transform" />;
    return <Globe size={18} className="group-hover:scale-110 transition-transform" />;
  };

  // Clean WhatsApp Number & Prefilled Link
  const cleanPhone = (whatsappSettings.floatingPhoneNumber || "971501234567").replace(/[^0-9]/g, "");
  const prefilledPrompt = whatsappSettings.floatingPrefilledMessage || "Hello Cool Technologies, I would like to inquire about commercial cooling equipment.";
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(prefilledPrompt)}`;

  const isBottomLeft = whatsappSettings.floatingButtonPosition === "bottom-left";

  return (
    <>
      {/* 1. Fixed Right Edge Vertical Social Media Bar */}
      {activeSocials.length > 0 && (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col shadow-2xl rounded-l-2xl overflow-hidden bg-[#2596be] border-l border-t border-b border-white/20">
          {activeSocials.map((link, idx) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Connect on ${link.platform}`}
              title={link.platform}
              className={`p-3.5 text-white hover:bg-[#1c7e9f] transition-colors flex items-center justify-center group ${
                idx !== activeSocials.length - 1 ? "border-b border-white/20" : ""
              }`}
            >
              {renderSocialIcon(link)}
            </a>
          ))}
        </div>
      )}

      {/* 2. Official WhatsApp Floating Button */}
      {whatsappSettings.floatingWidgetEnabled !== false && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Cool Technologies on WhatsApp"
          title={`WhatsApp Quick Inquiry (${whatsappSettings.floatingPhoneNumber})`}
          className={`fixed ${
            isBottomLeft ? "left-6 bottom-6" : "right-6 bottom-6"
          } z-50 transition-all duration-300 hover:scale-110 flex items-center justify-center filter drop-shadow-2xl group cursor-pointer`}
        >
          <img
            src="/whatsapp-official.png"
            alt="WhatsApp Chat"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain group-hover:rotate-6 transition-transform"
          />
        </a>
      )}
    </>
  );
}
