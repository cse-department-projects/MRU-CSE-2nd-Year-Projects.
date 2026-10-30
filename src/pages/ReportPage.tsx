import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { ReportForm } from '../components/reports/ReportForm';
import { ReportFeed } from '../components/reports/ReportFeed';

export const ReportPage = () => <>
  <section className="page-hero"><div className="mx-auto max-w-7xl px-4 py-9 sm:px-5 sm:py-14 md:px-8 md:py-16"><Link to="/" className="mb-6 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/25 sm:mb-7">← &nbsp;Back to Home</Link><div className="flex flex-col gap-4 sm:flex-row sm:items-start"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 sm:h-16 sm:w-16"><Camera size={25}/></span><div className="min-w-0"><h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Report an Issue</h1><p className="mt-3 max-w-3xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">Help make your neighborhood cleaner. Share what you’ve noticed and where the community can help.</p></div></div></div></section>
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:gap-8 sm:px-5 sm:py-12 md:px-8 xl:grid-cols-[.9fr_1.1fr]"><div><div className="mb-5 rounded-2xl border border-leaf-500/20 bg-leaf-50 p-4 text-sm leading-6 text-forest-700">ⓘ Your reports are saved on this device only. They are not shared between users or devices.</div><ReportForm /></div><ReportFeed /></div>
</>;
