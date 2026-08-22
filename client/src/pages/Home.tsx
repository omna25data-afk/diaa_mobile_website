import { Link } from "wouter";
import { ArrowLeft, ArrowUpLeft, Check, Download, Gamepad2, ReceiptText, ShieldCheck, Smartphone, Sparkles, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicShell from "@/components/PublicShell";
import { categoryLabels, findLink, normalizeMediaUrl, usePublicSite } from "@/lib/site";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = { Smartphone, Wifi, ReceiptText, Gamepad2 };

export default function Home() {
  const { data } = usePublicSite();
  const settings = data?.settings;
  const services = data?.services || [];
  const appUrl = findLink(data, "google_play", "https://play.google.com/store/apps/details?id=diaamobile.likhadmatsadad");
  const heroImage = normalizeMediaUrl(settings?.heroImageUrl, "/media/diaa-app-promo-dark-hd.webp");

  return <PublicShell data={data}>
    <section className="relative isolate overflow-hidden bg-[#f5f9f7] pb-14 pt-12 lg:pb-24 lg:pt-20">
      <div className="hero-glow -right-20 top-[-130px]" /><div className="hero-glow left-[-220px] top-[300px] opacity-40" />
      <div className="container relative grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
        <div className="order-2 lg:order-1">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#bcd7cc] bg-white/80 px-3.5 py-2 text-xs font-extrabold text-[#0b4d4a] shadow-sm"><Sparkles className="h-3.5 w-3.5 text-[#c19249]" /> منصة واحدة لخدماتك الرقمية</div>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.22] tracking-[-.04em] text-[#103d3b] sm:text-5xl xl:text-6xl">{settings?.heroTitle || "معاملاتك الرقمية، أسرع وأسهل في تطبيق واحد."}</h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#526763] sm:text-lg">{settings?.heroDescription || "ضياء موبايل منصة رقمية لخدمات السداد والاتصالات والألعاب."}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={appUrl} target="_blank" rel="noreferrer"><Button size="lg" className="h-14 w-full gap-2 rounded-2xl bg-[#0b4d4a] px-6 text-base font-extrabold text-white shadow-[0_15px_32px_rgba(11,77,74,.22)] hover:bg-[#083d3a] sm:w-auto"><Download className="h-5 w-5" />تحميل التطبيق</Button></a>
            <Link href="/services"><Button size="lg" variant="outline" className="h-14 w-full gap-2 rounded-2xl border-[#b9d0c5] bg-white px-6 text-base font-extrabold text-[#164945] hover:bg-[#eaf3ef] sm:w-auto">استكشف الخدمات <ArrowLeft className="h-5 w-5" /></Button></Link>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#58706b]"><span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-[#0b8c72]" />خدمات اتصالات وسداد</span><span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-[#0b8c72]" />خدمات ألعاب رقمية</span><span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-[#0b8c72]" />دعم شركات يمنية</span></div>
        </div>
        <div className="order-1 mx-auto w-full max-w-[520px] lg:order-2">
          <div className="relative rounded-[2.2rem] border border-white/80 bg-white p-3 shadow-[0_28px_80px_rgba(17,65,60,.16)]">
            <div className="absolute -right-4 -top-4 rounded-2xl bg-[#e3bf80] px-4 py-3 text-xs font-black text-[#563a13] shadow-lg">خدمات رقمية<br />في تطبيق واحد</div>
            <img src={heroImage} alt="تطبيق ضياء موبايل لخدمات السداد" className="aspect-[1.5/1] w-full rounded-[1.75rem] object-cover" />
            <div className="absolute -bottom-5 -left-5 rounded-2xl border border-[#cee2d9] bg-[#f8fcfa] px-4 py-3 shadow-xl"><p className="text-[10px] font-bold text-[#69807b]">تجربة موحدة</p><p className="mt-1 text-sm font-black text-[#0b4d4a]">اشحن، سدّد، واستفد</p></div>
          </div>
        </div>
      </div>
    </section>

    <section className="container py-16 lg:py-24">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="section-kicker">خدمات المنصة</p><h2 className="section-title mt-3">اختر ما تحتاجه،<br className="hidden sm:block" /> واترك الباقي للتطبيق.</h2></div><Link href="/services" className="inline-flex items-center gap-1.5 font-extrabold text-[#0b4d4a] hover:text-[#c19249]">عرض جميع الخدمات <ArrowUpLeft className="h-4 w-4" /></Link></div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">{services.slice(0, 6).map((service: any, index: number) => { const Icon = iconMap[service.icon] || Smartphone; return <article key={service.id} className={`group rounded-[1.65rem] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${index === 1 ? "bg-[#0b4d4a] text-white shadow-[0_18px_36px_rgba(11,77,74,.2)]" : "border border-[#e1ebe6] bg-white"}`}><div className={`mb-7 flex h-12 w-12 items-center justify-center rounded-2xl ${index === 1 ? "bg-white/15 text-[#e7c78b]" : "bg-[#e7f1ed] text-[#0b4d4a]"}`}><Icon className="h-5 w-5" /></div><p className={`text-xs font-bold ${index === 1 ? "text-[#bed7cc]" : "text-[#82948f]"}`}>{categoryLabels[service.category as keyof typeof categoryLabels]}</p><h3 className="mt-2 text-xl font-extrabold">{service.title}</h3><p className={`mt-3 text-sm leading-7 ${index === 1 ? "text-[#d4e5df]" : "text-[#697c77]"}`}>{service.description}</p></article>})}</div>
    </section>

    <section className="overflow-hidden bg-[#083d3a] py-16 text-white lg:py-20"><div className="container grid items-center gap-10 lg:grid-cols-[.85fr_1.15fr]"><div className="relative mx-auto max-w-sm"><div className="absolute inset-8 rounded-full bg-[#d7af69]/20 blur-3xl" /><img src={normalizeMediaUrl(data?.sections?.find((section: any) => section.sectionKey === "home_value")?.imageUrl, "/media/diaa-app-promo-light-hd.webp")} alt="لقطة من تطبيق ضياء موبايل" className="relative w-full rounded-[2rem] border border-white/15 shadow-2xl" /></div><div><p className="section-kicker text-[#e0bd7b]">{data?.sections?.find((section: any) => section.sectionKey === "home_value")?.label || "لماذا ضياء موبايل؟"}</p><h2 className="mt-3 max-w-xl text-3xl font-black leading-tight sm:text-4xl">{data?.sections?.find((section: any) => section.sectionKey === "home_value")?.title || "كل ما تحتاجه لمعاملاتك الرقمية في مكان واحد"}</h2><p className="mt-5 max-w-xl leading-8 text-[#c4d8d0]">{data?.sections?.find((section: any) => section.sectionKey === "home_value")?.body || "خدمات السداد والاتصالات والألعاب في تجربة واحدة."}</p><div className="mt-7 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><ShieldCheck className="h-5 w-5 text-[#e4c17f]" /><p className="mt-3 text-sm font-bold">قنوات رسمية</p><p className="mt-1 text-xs leading-5 text-[#b2ccc1]">روابط تحميل وتواصل مباشرة.</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><Sparkles className="h-5 w-5 text-[#e4c17f]" /><p className="mt-3 text-sm font-bold">تجربة واضحة</p><p className="mt-1 text-xs leading-5 text-[#b2ccc1]">معلومات منظمة وخطوات سهلة.</p></div></div></div></div></section>

    <section className="container py-16 lg:py-24"><div className="rounded-[2rem] bg-[#e9f3ee] px-6 py-10 sm:px-12 lg:flex lg:items-center lg:justify-between lg:px-16"><div><p className="section-kicker">ابدأ الآن</p><h2 className="mt-3 text-3xl font-black tracking-tight text-[#103d3b] sm:text-4xl">حمّل ضياء موبايل، وأنجز خدمتك التالية.</h2><p className="mt-3 max-w-2xl leading-7 text-[#60736e]">انتقل إلى صفحة التطبيق الرسمية على Google Play واستكشف الخيارات المتاحة لك.</p></div><a href={appUrl} target="_blank" rel="noreferrer" className="mt-7 inline-block lg:mt-0"><Button size="lg" className="h-14 gap-2 rounded-2xl bg-[#0b4d4a] px-7 font-extrabold text-white hover:bg-[#083d3a]"><Download className="h-5 w-5" />تحميل من Google Play</Button></a></div></section>
  </PublicShell>;
}
