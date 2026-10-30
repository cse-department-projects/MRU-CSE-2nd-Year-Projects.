import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckSquare, 
  Square, 
  PhoneCall, 
  AlertCircle, 
  Waves, 
  Wind, 
  Mountain, 
  Sun, 
  Activity, 
  Share2, 
  Download, 
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  category: 'essentials' | 'medical' | 'documents' | 'tools';
}

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 'water', label: 'Drinking water (3-4 litres per person per day for at least 3 days)', category: 'essentials' },
  { id: 'food', label: 'Non-perishable ready-to-eat dry food items (biscuits, energy bars, dry fruits)', category: 'essentials' },
  { id: 'first_aid', label: 'First aid box with antiseptic, bandages, gauze, and pain relievers', category: 'medical' },
  { id: 'prescriptions', label: '7-day supply of daily prescription medicines and medical history cards', category: 'medical' },
  { id: 'torch', label: 'High-power LED flashlight or torch with extra batteries', category: 'tools' },
  { id: 'powerbank', label: 'Fully charged mobile power bank & charging cables in waterproof wrap', category: 'tools' },
  { id: 'radio', label: 'Battery-powered or hand-crank AM/FM radio for emergency updates', category: 'tools' },
  { id: 'whistle', label: 'Emergency whistle to signal for help if trapped', category: 'tools' },
  { id: 'docs', label: 'Identity proof (Aadhaar/Voter ID), property papers & insurance in sealed plastic bag', category: 'documents' },
  { id: 'cash', label: 'Emergency cash in small denominations (ATMs and UPI may lose connectivity)', category: 'documents' },
  { id: 'clothing', label: 'Waterproof jacket, sturdy boots, and a change of dry clothes', category: 'essentials' },
  { id: 'sanitizer', label: 'Personal hygiene kit (soap, sanitizer, sanitary items, moist wipes)', category: 'medical' },
];

export const SafetyGuidePage: React.FC = () => {
  const [selectedHazard, setSelectedHazard] = useState<'flood' | 'cyclone' | 'landslide' | 'heatwave' | 'earthquake'>('flood');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    water: true,
    torch: true,
    first_aid: true,
    powerbank: true,
  });
  const [copiedHelpline, setCopiedHelpline] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = INITIAL_CHECKLIST.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedHelpline(num);
    setTimeout(() => setCopiedHelpline(null), 2000);
  };

  const helplines = [
    { title: 'National Emergency Helpline', number: '112', desc: 'All-in-one emergency response (Police, Fire, Medical)', badge: '24x7 Priority' },
    { title: 'NDRF Disaster Helpline', number: '1078', desc: 'National Disaster Response Force Command Room', badge: 'Rescue & Relief' },
    { title: 'State Disaster Management (SDMA)', number: '1070', desc: 'State emergency operation coordination desk', badge: 'State EOC' },
    { title: 'District Disaster Control Room', number: '1077', desc: 'Local district collectorate emergency cell', badge: 'Local Aid' },
    { title: 'Medical Ambulance Support', number: '108', desc: 'Emergency medical services and paramedic dispatch', badge: 'Ambulance' },
    { title: 'Coast Guard Emergency', number: '1554', desc: 'Maritime & coastal cyclone search and rescue', badge: 'Coastal' }
  ];

  return (
    <div id="safety-guide-page" className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-xl border border-[#E8EAED] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#1A73E8] flex items-center justify-center font-bold">
              <ShieldCheck size={20} />
            </span>
            <h1 className="text-xl font-bold text-[#202124] tracking-tight">
              Citizen Safety & Emergency Preparedness Guide
            </h1>
          </div>
          <p className="text-xs md:text-sm text-[#5F6368] mt-1">
            Actionable disaster response protocols, interactive Go-Bag checklist, and official 24x7 emergency helplines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="tel:112"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#D93025] hover:bg-[#B31412] rounded-lg shadow-xs transition-colors"
          >
            <PhoneCall size={14} />
            <span>Call 112 Emergency</span>
          </a>
        </div>
      </div>

      {/* EMERGENCY HELPLINES QUICK BAR */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-[#5F6368] uppercase tracking-wider px-1">
          Official 24x7 Emergency Helplines (Toll-Free)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {helplines.map((item) => (
            <div
              key={item.number}
              className="bg-white p-3.5 rounded-xl border border-[#E8EAED] hover:border-[#1A73E8] transition-all shadow-xs flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-[#202124] truncate">{item.title}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-blue-50 text-[#1A73E8] rounded-md border border-blue-100 shrink-0">
                    {item.badge}
                  </span>
                </div>
                <p className="text-[11px] text-[#5F6368] truncate">{item.desc}</p>
                <div className="mt-2 flex items-center gap-2">
                  <a
                    href={`tel:${item.number}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1A73E8] text-white text-xs font-bold rounded-md hover:bg-[#1557B0] transition-colors"
                  >
                    <PhoneCall size={12} />
                    <span>Dial {item.number}</span>
                  </a>
                  <button
                    onClick={() => handleCopy(item.number)}
                    className="text-[11px] text-[#5F6368] hover:text-[#1A73E8] px-2 py-1 rounded bg-gray-50 border border-gray-200"
                  >
                    {copiedHelpline === item.number ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xl font-black text-[#1A73E8] font-mono tracking-tight">
                  {item.number}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-COLUMN MAIN CONTENT: Hazard Protocol Guide & Emergency Kit Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: Step-by-Step Hazard Action Guides */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-[#E8EAED] shadow-xs">
            <h3 className="text-sm font-bold text-[#202124] uppercase tracking-wide mb-3 flex items-center justify-between">
              <span>Disaster Action Protocols (NDMA Guidelines)</span>
              <span className="text-xs font-normal text-[#5F6368]">Select Hazard</span>
            </h3>

            {/* Hazard Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-[#F8F9FA] rounded-lg border border-[#E8EAED] mb-4">
              <button
                onClick={() => setSelectedHazard('flood')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-bold transition-all ${
                  selectedHazard === 'flood'
                    ? 'bg-white text-[#1A73E8] shadow-xs border border-[#E8EAED]'
                    : 'text-[#5F6368] hover:text-[#202124]'
                }`}
              >
                <Waves size={14} />
                <span>Floods</span>
              </button>

              <button
                onClick={() => setSelectedHazard('cyclone')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-bold transition-all ${
                  selectedHazard === 'cyclone'
                    ? 'bg-white text-[#1A73E8] shadow-xs border border-[#E8EAED]'
                    : 'text-[#5F6368] hover:text-[#202124]'
                }`}
              >
                <Wind size={14} />
                <span>Cyclone</span>
              </button>

              <button
                onClick={() => setSelectedHazard('landslide')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-bold transition-all ${
                  selectedHazard === 'landslide'
                    ? 'bg-white text-[#1A73E8] shadow-xs border border-[#E8EAED]'
                    : 'text-[#5F6368] hover:text-[#202124]'
                }`}
              >
                <Mountain size={14} />
                <span>Landslide</span>
              </button>

              <button
                onClick={() => setSelectedHazard('heatwave')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-bold transition-all ${
                  selectedHazard === 'heatwave'
                    ? 'bg-white text-[#1A73E8] shadow-xs border border-[#E8EAED]'
                    : 'text-[#5F6368] hover:text-[#202124]'
                }`}
              >
                <Sun size={14} />
                <span>Heatwave</span>
              </button>

              <button
                onClick={() => setSelectedHazard('earthquake')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-bold transition-all ${
                  selectedHazard === 'earthquake'
                    ? 'bg-white text-[#1A73E8] shadow-xs border border-[#E8EAED]'
                    : 'text-[#5F6368] hover:text-[#202124]'
                }`}
              >
                <Activity size={14} />
                <span>Quake</span>
              </button>
            </div>

            {/* Protocol Steps: Before, During, After */}
            {selectedHazard === 'flood' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200">
                  <h4 className="font-bold text-[#1A73E8] mb-1.5 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#1A73E8] text-white flex items-center justify-center text-[10px]">1</span>
                    Before a Flood (Preparation & Warning Stage)
                  </h4>
                  <ul className="space-y-1.5 text-[#3C4043] list-disc list-inside leading-relaxed">
                    <li>Know the elevation of your property and nearest high ground evacuation shelters.</li>
                    <li>Keep your Emergency Go-Bag and first-aid kit ready near the front door.</li>
                    <li>Move valuable belongings, electrical appliances, and essential documents to upper floors.</li>
                    <li>Keep drains and gutters around your home clear of debris.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg bg-red-50/60 border border-red-200">
                  <h4 className="font-bold text-[#D93025] mb-1.5 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#D93025] text-white flex items-center justify-center text-[10px]">2</span>
                    During a Flood (Immediate Survival Actions)
                  </h4>
                  <ul className="space-y-1.5 text-[#3C4043] list-disc list-inside leading-relaxed">
                    <li><strong>Turn off the main electrical supply switch and LPG gas cylinder valve</strong> before water enters.</li>
                    <li><strong>Never walk, swim, or drive through moving floodwaters.</strong> Just 15 cm of moving water can knock an adult down, and 30 cm can float a car.</li>
                    <li>Stay on the highest level of the building. Avoid enclosed attics unless you have roof access.</li>
                    <li>Drink only bottled, boiled, or chlorine-treated water to avoid waterborne cholera and gastroenteritis.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
                  <h4 className="font-bold text-[#1E8E3E] mb-1.5 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#1E8E3E] text-white flex items-center justify-center text-[10px]">3</span>
                    After a Flood (Safe Return & Recovery)
                  </h4>
                  <ul className="space-y-1.5 text-[#3C4043] list-disc list-inside leading-relaxed">
                    <li>Do not enter buildings until municipal structural inspectors confirm they are safe.</li>
                    <li>Watch out for broken electrical cables, gas leaks, and displaced snakes or reptiles in wet debris.</li>
                    <li>Disinfect your home and discard any food item that touched floodwater.</li>
                    <li>Take photos of damages before cleanup for government compensation and insurance claims.</li>
                  </ul>
                </div>
              </div>
            )}

            {selectedHazard === 'cyclone' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200">
                  <h4 className="font-bold text-[#E37400] mb-1.5 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#E37400] text-white flex items-center justify-center text-[10px]">1</span>
                    When Cyclone Warning is Issued (24-48 Hours)
                  </h4>
                  <ul className="space-y-1.5 text-[#3C4043] list-disc list-inside leading-relaxed">
                    <li>Secure or board glass windows; trim tree branches near roof lines and power cables.</li>
                    <li>Park vehicles under sturdy cover away from large trees or tin sheds.</li>
                    <li>Fishermen must strictly not venture into the sea and moor boats securely.</li>
                    <li>Charge all mobile phones, power banks, and battery lights fully.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg bg-red-50/60 border border-red-200">
                  <h4 className="font-bold text-[#D93025] mb-1.5 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#D93025] text-white flex items-center justify-center text-[10px]">2</span>
                    During Cyclone Landfall
                  </h4>
                  <ul className="space-y-1.5 text-[#3C4043] list-disc list-inside leading-relaxed">
                    <li>Stay indoors in the strongest central room away from windows and glass panes.</li>
                    <li>Beware of the "Eye of the Cyclone": When winds suddenly stop, do not go outside — extreme winds will resume from the opposite direction.</li>
                    <li>Disconnect all power mains and stay tuned to battery-powered radio or SMS alerts.</li>
                  </ul>
                </div>
              </div>
            )}

            {selectedHazard === 'landslide' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200">
                  <h4 className="font-bold text-[#E37400] mb-1.5 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#E37400] text-white flex items-center justify-center text-[10px]">1</span>
                    Warning Signs to Watch For in Hilly Terrains
                  </h4>
                  <ul className="space-y-1.5 text-[#3C4043] list-disc list-inside leading-relaxed">
                    <li>Sudden springs, seeps, or water saturated ground in areas that are usually dry.</li>
                    <li>New cracks in plaster, tile, brick foundations, or hillside retaining walls.</li>
                    <li>Tilting trees, telephone poles, or fences on slopes.</li>
                    <li>Sudden increase or muddy discoloration in stream water volume.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg bg-red-50/60 border border-red-200">
                  <h4 className="font-bold text-[#D93025] mb-1.5 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#D93025] text-white flex items-center justify-center text-[10px]">2</span>
                    Immediate Action if a Landslide Occurs
                  </h4>
                  <ul className="space-y-1.5 text-[#3C4043] list-disc list-inside leading-relaxed">
                    <li>Quickly move out of the path of debris flow to higher, stable ground.</li>
                    <li>If escape is not possible, curl into a tight ball and protect your head.</li>
                    <li>Avoid river valleys and low areas during and immediately after heavy rainfall.</li>
                  </ul>
                </div>
              </div>
            )}

            {selectedHazard === 'heatwave' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200">
                  <h4 className="font-bold text-[#E37400] mb-1.5 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#E37400] text-white flex items-center justify-center text-[10px]">1</span>
                    Heatwave Safety & Hydration Rules
                  </h4>
                  <ul className="space-y-1.5 text-[#3C4043] list-disc list-inside leading-relaxed">
                    <li>Avoid going outdoors between 12:00 PM and 4:00 PM during peak solar radiation.</li>
                    <li>Drink oral rehydration solutions (ORS), buttermilk, lemon water, and coconut water frequently even if not feeling thirsty.</li>
                    <li>Wear lightweight, light-coloured, loose, and porous cotton clothes.</li>
                    <li>Never leave children or pets inside a parked vehicle in the sun.</li>
                  </ul>
                </div>
              </div>
            )}

            {selectedHazard === 'earthquake' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200">
                  <h4 className="font-bold text-[#1A73E8] mb-1.5 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#1A73E8] text-white flex items-center justify-center text-[10px]">1</span>
                    Drop, Cover, and Hold On
                  </h4>
                  <ul className="space-y-1.5 text-[#3C4043] list-disc list-inside leading-relaxed">
                    <li><strong>DROP</strong> onto your hands and knees to prevent being knocked over.</li>
                    <li><strong>COVER</strong> your head and neck under a sturdy table or desk.</li>
                    <li><strong>HOLD ON</strong> to your shelter until shaking stops. If no shelter, cover head with arms next to an interior wall.</li>
                    <li>Stay away from glass windows, heavy bookcases, chandeliers, and outer walls.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Columns: Interactive Emergency Go-Bag Kit Builder */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-[#E8EAED] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-[#202124] uppercase tracking-wide">
                  Emergency Go-Bag Checklist
                </h3>
                <p className="text-xs text-[#5F6368]">
                  Keep packed for 72-hour family evacuation.
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded bg-blue-50 text-[#1A73E8] border border-blue-200">
                {completedCount}/{totalCount} Packed
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#F1F3F4] h-2.5 rounded-full overflow-hidden mb-4">
              <div
                className={`h-full transition-all duration-300 ${
                  progressPercent >= 80 ? 'bg-[#1E8E3E]' : progressPercent >= 40 ? 'bg-[#1A73E8]' : 'bg-[#E37400]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Interactive Items List */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {INITIAL_CHECKLIST.map((item) => {
                const isChecked = !!checkedItems[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-start gap-2.5 transition-all ${
                      isChecked
                        ? 'bg-emerald-50/50 border-emerald-200 text-[#202124]'
                        : 'bg-[#F8F9FA] border-[#E8EAED] text-[#5F6368] hover:bg-white'
                    }`}
                  >
                    <button className="mt-0.5 shrink-0 text-[#1A73E8]">
                      {isChecked ? (
                        <CheckSquare size={16} className="text-[#1E8E3E]" />
                      ) : (
                        <Square size={16} className="text-[#80868B]" />
                      )}
                    </button>
                    <span className={`leading-relaxed ${isChecked ? 'line-through opacity-80' : ''}`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-[#E8EAED] flex items-center justify-between text-xs text-[#5F6368]">
              <span className="flex items-center gap-1 text-[11px]">
                <Info size={13} className="text-[#1A73E8]" />
                Store in a waterproof backpack
              </span>
              <button
                onClick={() => {
                  const allDone: Record<string, boolean> = {};
                  INITIAL_CHECKLIST.forEach(i => (allDone[i.id] = true));
                  setCheckedItems(allDone);
                }}
                className="text-xs font-semibold text-[#1A73E8] hover:underline"
              >
                Check All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
