import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Images, Award } from "lucide-react";
import { toPng } from "html-to-image";
import { fetchSubmissionsFn } from "@/lib/d1.functions";
import { Certificate } from "@/components/Certificate";
import { SiteHeader } from "@/components/SiteHeader";

type CertSearch = {
  name?: string;
  school?: string;
  exam?: string;
  position?: number;
  marks?: string;
  cls?: string;
  view?: number;
  fcls?: string;
  fq?: string;
};

type GalleryRow = {
  id: string;
  certificate_name: string;
  school_name: string;
  exam_name: string;
  class_name: string | null;
  class_position: number;
  total_marks: number;
  created_at: string;
};

export const Route = createFileRoute("/certificate")({
  validateSearch: (search: Record<string, unknown>): CertSearch => {
    const rawPos = Number(search?.position);
    const validPos = Number.isFinite(rawPos) && rawPos > 0 ? rawPos : 1;
    const rawView = Number(search?.view);
    const validView = Number.isFinite(rawView) && rawView > 0 ? rawView : undefined;

    return {
      name: search?.name ? String(search.name).trim() : "",
      school: search?.school ? String(search.school).trim() : "",
      exam: search?.exam ? String(search.exam).trim() : "",
      position: validPos,
      marks: search?.marks ? String(search.marks).trim() : "",
      cls: search?.cls ? String(search.cls).trim() : undefined,
      view: validView,
      fcls: search?.fcls ? String(search.fcls).trim() : undefined,
      fq: search?.fq ? String(search.fq).trim() : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "তোমার সার্টিফিকেট | 10 Minute School" },
      {
        name: "description",
        content:
          "তোমার 10 Minute School কৃতি শিক্ষার্থী সার্টিফিকেট দেখো এবং ডাউনলোড করো।",
      },
      /* ── Open Graph ── */
      { property: "og:site_name", content: "10 Minute School" },
      { property: "og:locale", content: "bn_BD" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://ks.10minuteschool.com/certificate" },
      { property: "og:title", content: "তোমার সার্টিফিকেট | 10 Minute School" },
      {
        property: "og:description",
        content:
          "তোমার 10 Minute School কৃতি শিক্ষার্থী সার্টিফিকেট দেখো এবং ডাউনলোড করো।",
      },
      { property: "og:image", content: "https://ks.10minuteschool.com/og-image.jpg" },
      { property: "og:image:alt", content: "10 Minute School কৃতি শিক্ষার্থী সার্টিফিকেট" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      /* ── Twitter / X Card ── */
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@10minuteschool" },
      { name: "twitter:title", content: "তোমার সার্টিফিকেট | 10 Minute School" },
      {
        name: "twitter:description",
        content:
          "তোমার 10 Minute School কৃতি শিক্ষার্থী সার্টিফিকেট দেখো এবং ডাউনলোড করো।",
      },
      { name: "twitter:image", content: "https://ks.10minuteschool.com/og-image.jpg" },
      { name: "twitter:image:alt", content: "10 Minute School কৃতি শিক্ষার্থী সার্টিফিকেট" },
    ],
  }),
  component: CertificatePage,
});

function CertificatePage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/certificate" });
  const certRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [viewRows, setViewRows] = useState<GalleryRow[]>([]);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    if (!search.view) return;
    setViewLoading(true);
    fetchSubmissionsFn({ data: { limit: 300 } })
      .then((data) => {
        setViewRows((data as GalleryRow[]) ?? []);
        setViewLoading(false);
      })
      .catch(() => {
        setViewLoading(false);
      });
  }, [search.view]);

  const currentIndex = useMemo(() => {
    if (!search.view) return -1;
    return viewRows.findIndex(
      (r) =>
        r.certificate_name === search.name &&
        r.school_name === search.school &&
        r.exam_name === search.exam &&
        r.class_position === search.position &&
        String(r.total_marks) === search.marks &&
        (r.class_name ?? undefined) === search.cls,
    );
  }, [viewRows, search]);

  const prevRow = viewRows[currentIndex - 1];
  const nextRow = viewRows[currentIndex + 1];

  function navigateTo(row: GalleryRow) {
    navigate({
      to: "/certificate",
      search: {
        name: row.certificate_name,
        school: row.school_name,
        exam: row.exam_name,
        position: row.class_position,
        marks: String(row.total_marks),
        cls: row.class_name ?? undefined,
        view: 1,
        fcls: search.fcls,
        fq: search.fq,
      },
    });
  }

  async function downloadPdf() {
    if (!certRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(certRef.current, { pixelRatio: 3, cacheBust: true });
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      pdf.addImage(dataUrl, "PNG", 0, 0, w, h);
      pdf.save(
        `10ms-certificate-${(search.name || "student").trim().replace(/\s+/g, "-").toLowerCase()}.pdf`,
      );
    } finally {
      setBusy(false);
    }
  }

  const hasData = Boolean(search.name || search.school || search.exam || search.marks);

  if (!hasData && !search.view) {
    return (
      <main className="min-h-screen bg-background">
        <SiteHeader />
        <section className="mx-auto max-w-md px-6 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-soft text-amber mb-4">
            <Award className="h-8 w-8" />
          </div>
          <h1 className="bn text-2xl font-bold">কোনো তথ্য পাওয়া যায়নি</h1>
          <p className="bn mt-3 text-[0.9375rem] text-text-2">
            সার্টিফিকেট তৈরি করতে প্রথমে তোমার পরীক্ষার ফলাফল জমা দাও, অথবা শিক্ষার্থীদের সার্টিফিকেট গ্যালারি দেখো।
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/form"
              className="bn w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-brand-red px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-red-deep"
            >
              ফলাফল জমা দাও
            </Link>
            <Link
              to="/gallery"
              className="bn w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold text-text-1 transition hover:border-primary hover:bg-primary-container"
            >
              গ্যালারি দেখো
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />

      <section className="mx-auto max-w-xl px-6 py-10 relative">
        <div className="mb-6">
          {search.view ? (
            <Link
              to="/gallery"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary transition hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Gallery
            </Link>
          ) : (
            <Link
              to="/form"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary transition hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Form
            </Link>
          )}
        </div>
        <h1 className="bn mb-6 text-center text-2xl font-semibold">
          {search.view ? "তোমার বন্ধুদের সার্টিফিকেট" : "তোমার সার্টিফিকেট"}
        </h1>
        <div className="overflow-hidden rounded-2xl border border-border">
          <Certificate
            ref={certRef}
            data={{
              studentName: search.name || "",
              schoolName: search.school || "",
              examName: search.exam || "",
              position: search.position || 1,
              totalMarks: search.marks || "",
              className: search.cls,
            }}
          />
        </div>
        {!search.view ? (
          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <button
              onClick={downloadPdf}
              disabled={busy}
              className="rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground transition hover:bg-primary-deep disabled:bg-border disabled:text-muted-foreground"
            >
              {busy ? "তৈরি হচ্ছে..." : "Download PDF"}
            </button>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-4 text-sm font-semibold text-text-1 transition hover:border-primary hover:bg-primary-container hover:text-on-primary-container"
            >
              <Images className="h-4 w-4" aria-hidden />
              Certificate Gallery
            </Link>
          </div>
        ) : (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => prevRow && navigateTo(prevRow)}
              disabled={!prevRow || viewLoading}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-text-1 transition hover:border-primary hover:bg-primary-container hover:text-on-primary-container disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              আগের
            </button>
            <button
              onClick={() => nextRow && navigateTo(nextRow)}
              disabled={!nextRow || viewLoading}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-text-1 transition hover:border-primary hover:bg-primary-container hover:text-on-primary-container disabled:opacity-50"
            >
              পরের
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
