import { createFileRoute, Link } from "@tanstack/react-router";
import {
  LogIn,
  ClipboardList,
  BadgeCheck,
  Award,
  Medal,
  Trophy,
  MoveRight,
  Share2,
  TrendingUp,
  ShieldCheck,
  Lock,
  FileText,
  Pencil,
  Facebook,
  Youtube,
  Instagram,
  Linkedin,
  Images,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Certificate } from "@/components/Certificate";
import { Logo } from "@/components/Logo";
import { isTenmsAuthConfigured, loginWithTenms, useTenmsUser } from "@/lib/tenms-auth";
import { useNavigate } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import trophy from "@/assets/trophy-books.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Result Certificate | 10 Minute School" },
      {
        name: "description",
        content:
          "Share your Half Yearly or Pre-test result with 10 Minute School and instantly download a personalised achievement certificate.",
      },
      { property: "og:title", content: "Result Certificate | 10 Minute School" },
      {
        property: "og:description",
        content:
          "Share your exam result and download your personalised 10 Minute School achievement certificate.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const STEPS = [
  {
    n: "১",
    icon: LogIn,
    t: "লগইন করো",
    d: "“Login with 10 Minute School” বাটনে ক্লিক করে লগইন করো।",
  },
  {
    n: "২",
    icon: ClipboardList,
    t: "তোমার ফলাফল জমা দাও",
    d: "তোমার পরীক্ষা, বিষয় ও প্রাপ্ত নম্বর সঠিকভাবে জমা দাও।",
  },
  {
    n: "৩",
    icon: BadgeCheck,
    t: "ফলাফল যাচাই",
    d: "আমরা তোমার তথ্য যাচাই করে সার্টিফিকেট প্রস্তুত করবো।",
  },
  {
    n: "৪",
    icon: Award,
    t: "সার্টিফিকেট সংগ্রহ করো",
    d: "তোমার অর্জনের ডিজিটাল সার্টিফিকেট ডাউনলোড করো এবং শেয়ার করো!",
  },
];

const BENEFITS = [
  {
    icon: Medal,
    t: "তোমার অর্জনের স্বীকৃতি",
    d: "তোমার পরিশ্রম ও সাফল্যকে দেওয়া হবে একটি বিশেষ স্বীকৃতি।",
    tone: "text-brand-red",
  },
  {
    icon: Share2,
    t: "সহজে শেয়ার করো",
    d: "সার্টিফিকেট সোশ্যাল মিডিয়া বা বন্ধুদের সাথে শেয়ার করতে পারবে।",
    tone: "text-green-link",
  },
  {
    icon: TrendingUp,
    t: "নিজের অগ্রগতি দেখো",
    d: "তোমার ফলাফল দেখে বোঝো, তুমি কতটা এগিয়ে যাচ্ছো।",
    tone: "text-green-link",
  },
  {
    icon: ShieldCheck,
    t: "নিরাপদ ও বিশ্বস্ত",
    d: "তোমার তথ্য সম্পূর্ণ নিরাপদ এবং গোপনীয় রাখা হবে।",
    tone: "text-on-primary-container",
  },
];

function LoginButton({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const { user } = useTenmsUser();

  async function handleLogin() {
    if (user || !isTenmsAuthConfigured()) {
      navigate({ to: "/form" });
      return;
    }
    try {
      await loginWithTenms();
      navigate({ to: "/form" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "লগইন সম্পন্ন হয়নি।");
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogin}
      className={`bn inline-flex items-center gap-3 rounded-full bg-brand-red px-7 py-4 text-base font-semibold text-primary-foreground transition hover:bg-brand-red-deep ${className}`}
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-background">
        <Logo variant="icon-color" height={18} />
      </span>
      Login with 10 Minute School
    </button>
  );
}

function SecureNote() {
  return (
    <p className="bn mt-3 flex items-center gap-2 text-sm text-text-3">
      <Lock className="h-4 w-4" aria-hidden />
      নিরাপদ ও সুরক্ষিত লগইন
    </p>
  );
}

function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-0 hidden h-[130%] w-1/2 -skew-x-12 bg-gold/90 lg:block"
        />
        <div className="relative mx-auto max-w-6xl px-6 pt-6 pb-16">
          <div className="flex justify-end">
            <span className="bn inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-text-2">
              <Medal className="h-4 w-4 text-gold" aria-hidden />
              তোমার চেষ্টা, তোমার সাফল্য
              <Trophy className="h-4 w-4 text-gold" aria-hidden />
            </span>
          </div>

          <div className="mt-6 grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h1 className="bn text-4xl leading-[1.25] font-bold tracking-tight sm:text-5xl">
                তোমার ফলাফল জমা দাও,
                <br />
                <span className="text-brand-red">সার্টিফিকেট সংগ্রহ করো!</span>
              </h1>
              <p className="bn mt-5 max-w-md text-base text-text-2">
                হাফ ইয়ারলি বা প্রি-টেস্ট পরীক্ষার ফলাফল জমা দিয়ে একটি সনদ অর্জন করো এবং শেয়ার করো
                তোমার সাফল্য।
              </p>

              <div className="mt-7 flex flex-wrap gap-4">
                <span className="bn inline-flex items-center gap-3 rounded-xl border border-border bg-amber-soft px-5 py-4 text-[0.9375rem] font-medium">
                  <FileText className="h-5 w-5 text-amber" aria-hidden />
                  Half Yearly
                </span>
                <span className="bn inline-flex items-center gap-3 rounded-xl border border-border bg-pink-soft px-5 py-4 text-[0.9375rem] font-medium">
                  <Pencil className="h-5 w-5 text-brand-red" aria-hidden />
                  Pre-Test
                </span>
              </div>

              <div className="mt-8">
                <div className="flex flex-wrap items-center gap-4">
                  <LoginButton />
                  <Link
                    to="/gallery"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-4 text-base font-semibold text-primary-foreground shadow-sm transition hover:bg-emerald-deep"
                  >
                    <Images className="h-5 w-5" aria-hidden />
                    Certificate Gallery
                  </Link>
                </div>
                <SecureNote />
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-sm">
              <div className="rounded-xl border-[10px] border-gold bg-card p-2 shadow-sm">
                <Certificate
                  data={{
                    studentName: "Jabir Misbah",
                    schoolName: "10 Minute School",
                    examName: "Half Yearly Examination",
                    className: "Class 9",
                    position: 1,
                    totalMarks: "100",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="bn text-center text-2xl font-bold sm:text-3xl">কীভাবে কাজ করে?</h2>
          <div aria-hidden className="mx-auto mt-3 h-1 w-16 rounded-full bg-gold" />

          <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.n} className="relative text-center">
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute top-12 -right-5 hidden items-center text-outline-variant lg:flex"
                  >
                    <MoveRight className="h-5 w-5" />
                  </span>
                )}
                <div className="relative mx-auto h-24 w-24">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-soft">
                    <s.icon className="h-10 w-10 text-amber" aria-hidden />
                  </div>
                  <span className="bn absolute -top-1 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-sm font-bold text-gold-foreground">
                    {s.n}
                  </span>
                </div>
                <p className="bn mt-5 font-semibold">{s.t}</p>
                <p className="bn mx-auto mt-2 max-w-[15rem] text-sm text-text-3">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Why submit */}
      <section className="border-t border-border bg-cream">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="bn text-center text-2xl font-bold sm:text-3xl">কেন জমা দেবে?</h2>
          <div aria-hidden className="mx-auto mt-3 h-1 w-16 rounded-full bg-gold" />

          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <div key={b.t} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-card">
                  <b.icon className={`h-7 w-7 ${b.tone}`} aria-hidden />
                </div>
                <p className="bn mt-4 font-semibold">{b.t}</p>
                <p className="bn mx-auto mt-2 max-w-[15rem] text-sm text-text-3">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid items-center gap-8 rounded-2xl border border-border bg-pink-soft px-8 py-10 md:grid-cols-[auto_1fr_auto]">
          <img
            src={trophy}
            alt="Trophy on a stack of books"
            loading="lazy"
            width={768}
            height={768}
            className="mx-auto h-32 w-32 object-contain"
          />
          <div className="text-center md:text-left">
            <h2 className="bn text-2xl font-bold text-brand-red sm:text-3xl">
              নিয়ে নাও তোমার সার্টিফিকেট
            </h2>
            <p className="bn mt-2 max-w-md text-[0.9375rem] text-text-2">
              তোমার ফলাফল জমা দাও এবং গর্বের সাথে তোমার সার্টিফিকেট সংগ্রহ করো।
            </p>
          </div>
          <div className="text-center">
            <LoginButton />
            <SecureNote />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-6 py-6">
          <div className="flex items-center gap-3">
            <Logo height={26} />
            <span className="bn text-sm text-text-3">শেখা হোক আনন্দে!</span>
          </div>
          <div className="flex items-center gap-3 text-text-3 md:ml-auto">
            <Facebook className="h-5 w-5" aria-label="Facebook" />
            <Youtube className="h-5 w-5" aria-label="YouTube" />
            <Instagram className="h-5 w-5" aria-label="Instagram" />
            <Linkedin className="h-5 w-5" aria-label="LinkedIn" />
          </div>
        </div>
      </footer>
    </main>
  );
}
