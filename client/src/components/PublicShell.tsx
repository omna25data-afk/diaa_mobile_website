import { Link, useLocation } from "wouter";
import { ArrowUpLeft, Download, Menu, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { findLink, normalizeMediaUrl } from "@/lib/site";

const navItems = [
  { href: "/", label: "الرئيسية" },
  { href: "/services", label: "الخدمات" },
  { href: "/about", label: "من نحن" },
  { href: "/download", label: "تثبيت التطبيق" },
  { href: "/contact", label: "تواصل معنا" },
];

export default function PublicShell({ children, data }: { children: React.ReactNode; data: any }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const appUrl = findLink(data, "google_play", "https://play.google.com/store/apps/details?id=diaamobile.likhadmatsadad");
  const settings = data?.settings;
  const platformName = settings?.platformName || "ضياء موبايل";
  const phone = settings?.phone || "+967 780 777 735";
  const email = settings?.email || "diaamobile01@gmail.com";

  return (
    <div className="min-h-screen bg-[#fbfcfa] text-[#173432]" dir="rtl">
      <header className="sticky top-0 z-50 border-b border-[#d8e4df]/80 bg-[#fbfcfa]/90 backdrop-blur-xl">
        <div className="container flex h-[76px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3" aria-label="العودة إلى الرئيسية">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-[#0b4d4a] shadow-[0_12px_30px_rgba(11,77,74,.17)]">
              {settings?.logoUrl ? <img src={normalizeMediaUrl(settings.logoUrl)} alt="شعار ضياء موبايل" className="h-full w-full object-cover" /> : <span className="text-lg font-black text-white">ض</span>}
            </div>
            <div className="leading-tight">
              <p className="font-bold tracking-tight text-[#103d3b]">{platformName}</p>
              <p className="mt-0.5 text-[11px] font-medium text-[#71827e]">خدمات السداد الرقمية</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="التنقل الرئيسي">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${location === item.href ? "bg-[#e2eee9] text-[#0b4d4a]" : "text-[#50635f] hover:bg-[#f0f5f2] hover:text-[#103d3b]"}`}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link href="/contact"><Button variant="ghost" className="gap-2 rounded-xl font-bold text-[#174946]"><MessageCircle className="h-4 w-4" />تواصل معنا</Button></Link>
            <a href={appUrl} target="_blank" rel="noreferrer"><Button className="gap-2 rounded-xl bg-[#0b4d4a] px-4 font-bold text-white shadow-[0_10px_22px_rgba(11,77,74,.2)] hover:bg-[#083d3a]"><Download className="h-4 w-4" />حمّل التطبيق</Button></a>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden"><Button variant="outline" size="icon" className="rounded-xl border-[#d8e4df]"><Menu className="h-5 w-5" /></Button></SheetTrigger>
            <SheetContent side="right" className="w-[310px] border-none bg-[#fbfcfa] px-6 pt-8" dir="rtl">
              <div className="mb-9 flex items-center justify-between">
                <span className="font-extrabold text-[#0b4d4a]">قائمة ضياء موبايل</span>
                <Button onClick={() => setOpen(false)} variant="ghost" size="icon" className="rounded-full"><X className="h-5 w-5" /></Button>
              </div>
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => <Link onClick={() => setOpen(false)} key={item.href} href={item.href} className={`rounded-2xl px-4 py-3.5 font-bold ${location === item.href ? "bg-[#dfeee8] text-[#0b4d4a]" : "text-[#425955]"}`}>{item.label}</Link>)}
              </nav>
              <a href={appUrl} target="_blank" rel="noreferrer" className="mt-8 block"><Button className="w-full gap-2 rounded-xl bg-[#0b4d4a] py-6 font-bold text-white"><Download className="h-4 w-4" />تحميل من Google Play</Button></a>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-16 overflow-hidden bg-[#082f2e] text-white">
        <div className="container grid gap-10 py-14 md:grid-cols-[1.25fr_.75fr_.75fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-xl bg-white/10">{settings?.logoUrl ? <img src={normalizeMediaUrl(settings.logoUrl)} alt="شعار ضياء موبايل" className="h-full w-full object-cover" /> : null}</div>
              <span className="text-lg font-extrabold">{platformName}</span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[#c5d8d1]">منصة رقمية تجمع خدمات السداد والاتصالات والألعاب في تجربة واحدة، واضحة وسهلة الوصول.</p>
          </div>
          <div>
            <p className="mb-4 text-sm font-extrabold text-[#d8b87b]">روابط سريعة</p>
            <div className="flex flex-col gap-2.5 text-sm text-[#c5d8d1]">{navItems.slice(1, 5).map((item) => <Link key={item.href} href={item.href} className="transition hover:text-white">{item.label}</Link>)}</div>
          </div>
          <div>
            <p className="mb-4 text-sm font-extrabold text-[#d8b87b]">تواصل مباشر</p>
            <div className="space-y-2.5 text-sm text-[#c5d8d1]"><a href={`tel:${phone.replace(/\s/g, "")}`} className="block transition hover:text-white" dir="ltr">{phone}</a><a href={`mailto:${email}`} className="block transition hover:text-white">{email}</a><Link href="/contact" className="inline-flex items-center gap-1.5 font-bold text-white">كل قنوات التواصل <ArrowUpLeft className="h-4 w-4" /></Link></div>
          </div>
        </div>
        <div className="border-t border-white/10"><div className="container flex flex-col gap-2 py-5 text-xs text-[#97b2a8] sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} ضياء موبايل. جميع الحقوق محفوظة.</span><Link href="/admin" className="transition hover:text-white">دخول الإدارة</Link></div></div>
      </footer>
    </div>
  );
}
