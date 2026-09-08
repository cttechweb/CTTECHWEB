import React, { useState } from "react";
import { PhoneCall, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate support ticket submit
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    }, 1000);
  };

  return (
    <section className="w-full bg-white py-12 md:py-16 border-b border-gray-100" id="contact-section">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-slate-50 rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          
          {/* Left Column: Corporate Office Coordinates */}
          <div className="lg:col-span-5 bg-[#2596be] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            
            {/* Background design accents */}
            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-500 rounded-full blur-3xl opacity-20"></div>
            
            <div className="relative z-10">
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-black rounded-full tracking-wider uppercase border border-cyan-400/20">
                Logistics & Support
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight uppercase mt-4 mb-3">
                B2B Support Desk
              </h2>
              <p className="text-sm text-blue-100/90 leading-relaxed mb-8">
                Our mechanical engineering advisors and logistics coordinators are standing by to expedite high-volume commercial climate orders.
              </p>

              {/* Coordinates details */}
              <div className="flex flex-col gap-6 text-sm">
                
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                    <PhoneCall size={18} className="text-cyan-300" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-blue-200 uppercase tracking-widest leading-none mb-1">Commercial Hotline</p>
                    <p className="font-semibold text-white">+1 (800) 555-COOL</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                    <Mail size={18} className="text-cyan-300" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-blue-200 uppercase tracking-widest leading-none mb-1">Contractor Support</p>
                    <p className="font-semibold text-white">contractors@cooltechnologies.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                    <MapPin size={18} className="text-cyan-300" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-blue-200 uppercase tracking-widest leading-none mb-1">Headquarters</p>
                    <p className="text-sm text-blue-500/100 leading-snug font-semibold">
                      500 Cool Tech Way, Suite 100,<br />
                      Chicago, IL 60611
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Operational hours info */}
            <div className="relative z-10 pt-8 border-t border-white/10 mt-8 flex items-center gap-2.5 text-xs text-blue-200 font-semibold">
              <Clock size={16} className="text-cyan-300" />
              <span>Estimating & Engineering Desk Open Mon-Fri 7AM - 7PM CST</span>
            </div>

          </div>

          {/* Right Column: Routing Form */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white">
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm text-gray-700">
                <div className="flex flex-col gap-1">
                  <h3 className="font-display font-extrabold text-lg text-slate-900 leading-none">
                    Submit Inquiry Ticket
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Complete fields below and an engineer will reply within 1 hour.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border border-gray-200 bg-gray-50/50 rounded px-3 py-2 focus:outline-none focus:border-[#0f4c81] focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Corporate Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jsmith@acme.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border border-gray-200 bg-gray-50/50 rounded px-3 py-2 focus:outline-none focus:border-[#0f4c81] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="(555) 012-3456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="border border-gray-200 bg-gray-50/50 rounded px-3 py-2 focus:outline-none focus:border-[#0f4c81] focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Routing Subject
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="border border-gray-200 bg-gray-50/50 rounded px-3 py-2 h-10 focus:outline-none focus:border-[#0f4c81] focus:bg-white transition-colors"
                    >
                      <option value="general">General Support Inquiry</option>
                      <option value="freight">Freight / LTL Carrier Logistics</option>
                      <option value="credit">Net-30 Commercial Credit Lines</option>
                      <option value="engineering">Custom HVAC Engineering Submittals</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Message Detail *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write your support inquiry, bulk parts list, or shipping question here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="border border-gray-200 bg-gray-50/50 rounded px-3 py-2 focus:outline-none focus:border-[#2596be] focus:bg-white resize-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 w-full py-2.5 bg-[#2596be] hover:bg-[#1c7e9f] text-white rounded font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  id="submit-contact-ticket"
                >
                  <Send size={14} />
                  {isSubmitting ? "Routing ticket..." : "Submit Inquiry Details"}
                </button>
              </form>
            ) : (
              /* Success Panel */
              <div className="text-center py-8 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100 shadow-sm">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="font-display font-bold text-slate-800 text-lg">Inquiry Received</h3>
                <p className="text-xs text-gray-500 mt-2 max-w-sm leading-relaxed">
                  Your corporate support ticket has been logged and assigned to our Chicago technical dispatch. An agent will contact you shortly.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="mt-6 px-4 py-2 border border-gray-200 text-gray-600 hover:bg-slate-50 text-xs font-bold rounded transition-colors"
                >
                  Submit Another Message
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
