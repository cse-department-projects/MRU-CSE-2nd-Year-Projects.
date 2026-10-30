import { useState } from 'react';
import type { MouseEvent } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Leaf, Menu, X, Lightbulb, Recycle, ClipboardList, Camera } from 'lucide-react';

const links = [
  { to: '/', label: 'Home' },
  { to: '/#why', label: 'Why It Matters' },
  { to: '/#threats', label: 'Threats' },
  { to: '/#take-action', label: 'Take Action' },
  { to: '/report', label: 'Report Issue', icon: Camera },
  { to: '/issues', label: 'Issues Raised', icon: ClipboardList },
  { to: '/recycle', label: 'Recycling Guide', icon: Recycle },
  { to: '/ideas', label: 'Innovative Ideas', icon: Lightbulb },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const followLink = (to: string, event: MouseEvent<HTMLAnchorElement>) => {
    if (to.startsWith('/#')) { event.preventDefault(); navigate('/', { state: { scrollTarget: to.slice(2) } }); }
    setOpen(false);
  };
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-forest-100/70 bg-forest-50/95 shadow-sm shadow-forest-950/[0.03] backdrop-blur-xl">
      <nav className="mx-auto flex h-[76px] w-full max-w-screen-2xl items-center justify-between px-4 sm:px-5 lg:px-8 2xl:max-w-[1440px]" aria-label="Main navigation">
        <Link to="/" onClick={() => setOpen(false)} className="flex shrink-0 items-center gap-2.5 text-[22px] font-extrabold tracking-tight text-forest-950">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#79b83f] to-[#28603a] text-white shadow-lg shadow-leaf-600/20"><Leaf size={23} /></span>
          Eco<span className="-ml-2 text-leaf-600">Vision</span>
        </Link>
        <div className="hidden items-center gap-0.5 2xl:flex">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to.startsWith('/#') ? '/' : to} end={to === '/'} onClick={event=>followLink(to,event)} className={({ isActive }) => `flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-[13px] font-semibold transition ${isActive && !to.startsWith('/#') ? 'bg-forest-100 text-forest-950' : 'text-forest-600 hover:bg-white hover:text-forest-950'}`}>
              {Icon && <Icon size={15} />}{label}
            </NavLink>
          ))}
        </div>
        <Link to="/#take-action" className="action-button hidden px-5 py-2.5 text-sm 2xl:inline-flex">Get Involved</Link>
        <button type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen(!open)} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-forest-100 bg-white text-forest-950 2xl:hidden">{open ? <X /> : <Menu />}</button>
      </nav>
      {open && <div className="max-h-[calc(100dvh-76px)] overflow-y-auto overscroll-contain border-t border-forest-100 bg-forest-50 px-5 py-3 shadow-xl 2xl:hidden">{links.map(({ to, label, icon: Icon }) => <Link key={to} to={to.startsWith('/#') ? '/' : to} onClick={event=>followLink(to,event)} className="flex items-center gap-3 rounded-xl px-3 py-3 font-semibold text-forest-700 hover:bg-white">{Icon && <Icon size={18} className="text-leaf-600" />}{label}</Link>)}<Link to="/report" onClick={() => setOpen(false)} className="action-button mt-2 w-full">Get Involved</Link></div>}
    </header>
  );
};
