import { Award, DollarSign, Truck, Headphones, FileText, Shield } from "lucide-react";

export default function Features() {
  const items = [
    {
      icon: <Award size={24} className="text-[#0f4c81]" />,
      title: "Quality Assured",
      desc: "Tested & certified products"
    },
    {
      icon: <DollarSign size={24} className="text-[#0f4c81]" />,
      title: "Competitive Pricing",
      desc: "Best value for your business"
    },
    {
      icon: <Truck size={24} className="text-[#0f4c81]" />,
      title: "Global Delivery",
      desc: "Reliable shipping worldwide"
    },
    {
      icon: <Headphones size={24} className="text-[#0f4c81]" />,
      title: "Expert Support",
      desc: "Technical support you can trust"
    },
    {
      icon: <FileText size={24} className="text-[#0f4c81]" />,
      title: "Bulk Orders",
      desc: "Flexible solutions for projects"
    },
    {
      icon: <Shield size={24} className="text-[#0f4c81]" />,
      title: "Warranty Protection",
      desc: "Peace of mind with every order"
    }
  ];

  return (
    <div className="w-full relative z-30 -mt-2 sm:-mt-10 md:-mt-14 px-0 sm:px-4 pb-2 sm:pb-4">
      
      {/* MOBILE ONLY: Frameless Automatic Continuous Horizontal Ticker */}
      <div className="md:hidden overflow-hidden w-full py-3.5 border-y border-slate-200/60 bg-white/90 backdrop-blur-sm relative">
        <style>{`
          @keyframes mobileAutoTicker {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-mobile-ticker {
            animation: mobileAutoTicker 22s linear infinite;
          }
        `}</style>

        <div className="flex items-center gap-7 w-max animate-mobile-ticker">
          {[...items, ...items].map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2.5 shrink-0 bg-transparent border-0 p-0 shadow-none select-none"
            >
              <div className="text-[#2596be] shrink-0">
                {item.icon}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-display font-extrabold text-xs text-slate-900 leading-tight">
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold leading-none mt-0.5">
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP & TABLET: Standard Executive Framed Container */}
      <div className="hidden md:block max-w-7xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-100 p-6 md:p-8">
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 md:divide-x divide-gray-100">
          {items.map((item, index) => (
            <div 
              key={index} 
              className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 px-2 lg:first:pl-0 lg:last:pr-0"
              id={`feature-item-${index}`}
            >
              <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 shrink-0">
                {item.icon}
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-sm text-slate-900 leading-tight">
                  {item.title}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
