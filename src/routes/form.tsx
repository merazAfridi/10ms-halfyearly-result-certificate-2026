import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Toaster, toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { isTenmsAuthConfigured, loginWithTenms, useTenmsUser } from "@/lib/tenms-auth";
import { compressImage } from "@/lib/image-compress";
import { getResultCardUploadUrl } from "@/lib/r2-upload.functions";
import { submitResultFn } from "@/lib/d1.functions";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/form")({
  head: () => ({
    meta: [
      { title: "Submit Your Result | 10 Minute School" },
      {
        name: "description",
        content:
          "Share your Half Yearly or Pre-test result with 10 Minute School and instantly download a personalised achievement certificate.",
      },
      { property: "og:title", content: "Submit Your Result | 10 Minute School" },
      {
        property: "og:description",
        content:
          "Share your exam result and download your personalised 10 Minute School achievement certificate.",
      },
    ],
  }),
  component: FormPage,
});

const PREP_OPTIONS = [
  "অনলাইন ব্যাচের মাধ্যমে",
  "ফ্রি গ্রুপ বা সাজেশন-এর মাধ্যমে",
  "নতুন যুক্ত হয়েছি",
];
const EXAM_OPTIONS = ["Half Yearly Examination", "Pre-Test Examination"];
const CLASS_OPTIONS = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];

const fieldClass =
  "w-full rounded-xl border border-border bg-card px-4 py-3.5 text-[0.9375rem] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";

function FormPage() {
  const navigate = useNavigate();
  const { user, ready } = useTenmsUser();
  const [existing, setExisting] = useState<{
    certificate_name: string;
    school_name: string;
    exam_name: string;
    class_name: string | null;
    class_position: number;
    total_marks: number;
  } | null>(null);
  const [checking, setChecking] = useState(false);
  const [name, setName] = useState("");
  const [studentClass, setStudentClass] = useState(CLASS_OPTIONS[0]);
  const [school, setSchool] = useState("");
  const [prep, setPrep] = useState(PREP_OPTIONS[0]);
  const [exam, setExam] = useState(EXAM_OPTIONS[0]);
  const [marks, setMarks] = useState("");
  const [totalExamMarks, setTotalExamMarks] = useState("");
  const [position, setPosition] = useState("");
  const [photo, setPhoto] = useState<{
    blob: Blob;
    preview: string;
    bytes: number;
  } | null>(null);

  const [compressing, setCompressing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const signUpload = useServerFn(getResultCardUploadUrl);

  useEffect(() => {
    return () => {
      if (photo?.preview) URL.revokeObjectURL(photo.preview);
    };
  }, [photo?.preview]);

  async function handlePickedFile(picked: File | null | undefined) {
    if (!picked) return;
    if (!picked.type.startsWith("image/")) {
      toast.error("শুধু ছবি আপলোড করা যাবে।");
      return;
    }
    setCompressing(true);
    try {
      const result = await compressImage(picked);
      setPhoto((prev) => {
        if (prev?.preview) URL.revokeObjectURL(prev.preview);
        return {
          blob: result.blob,
          preview: URL.createObjectURL(result.blob),
          bytes: result.bytes,
        };
      });
    } catch (err) {
      console.error(err);
      toast.error("ছবিটি প্রসেস করা যায়নি, আবার চেষ্টা করো।");
    } finally {
      setCompressing(false);
    }
  }

  const onlyEnglish = (value: string) => /^[A-Za-z0-9 .,'&()-]*$/.test(value);

  useEffect(() => {
    if (!user?.id) {
      setExisting(null);
      return;
    }
    setChecking(true);
    supabase
      .from("result_submissions")
      .select("certificate_name,school_name,exam_name,class_name,class_position,total_marks")
      .eq("external_user_id", user.id)
      .limit(1)
      .then(({ data }) => {
        setExisting(data?.[0] ?? null);
        setChecking(false);
      });
  }, [user?.id]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !school.trim() || !marks || !position || !totalExamMarks) {
      toast.error("সবগুলো তথ্য পূরণ করো।");
      return;
    }
    if (!photo) {
      toast.error("রেজাল্ট কার্ডের ছবি তোলো বা সিলেক্ট করো।");
      return;
    }
    setSubmitting(true);
    setUploading(true);
    let path: string;
    const fileBaseName = `${name.trim()}-${school.trim()}-${studentClass}`;
    try {
      try {
        // Preferred path: browser uploads straight to R2 with a presigned URL.
        const { uploadUrl, objectKey, publicUrl, contentType } = await signUpload({
          data: {
            extension: "jpg",
            certificateName: name.trim(),
            schoolName: school.trim(),
            className: studentClass,
          },
        });
        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          body: photo.blob,
          headers: { "Content-Type": contentType },
        });
        if (!putRes.ok) {
          throw new Error(`R2 upload failed [${putRes.status}]: ${await putRes.text()}`);
        }
        path = publicUrl ?? objectKey;
      } catch (directErr) {
        // Fallback (e.g. bucket CORS blocks this origin): stream via our server.
        console.warn("Direct R2 upload failed, using server fallback", directErr);
        const res = await fetch("/api/upload-result-card", {
          method: "POST",
          headers: {
            "Content-Type": "image/jpeg",
            "X-Result-Card-Filename": fileBaseName,
          },
          body: photo.blob,
        });
        if (!res.ok) {
          throw new Error(`Fallback upload failed [${res.status}]: ${await res.text()}`);
        }
        const json = (await res.json()) as { objectKey: string; publicUrl: string | null };
        path = json.publicUrl ?? json.objectKey;
      }
    } catch (err) {
      console.warn("R2 Upload warning (using local fallback):", err);
      path = photo?.preview ?? "local-preview";
    }

    setUploading(false);
    try {
      await submitResultFn({
        data: {
          certificate_name: name.trim(),
          class_name: studentClass,
          school_name: school.trim(),
          preparation_type: prep,
          exam_name: exam,
          total_marks: Number(marks),
          exam_total_marks: Number(totalExamMarks),
          class_position: Number(position),
          result_card_url: path,
          student_phone: user?.phone ?? null,
          student_email: user?.email ?? null,
          external_user_id: user?.id ?? null,
        },
      });
    } catch (err) {
      console.warn("Cloudflare D1 insert warning:", err);
    }

    toast.success("অভিনন্দন! তোমার সার্টিফিকেট তৈরি হয়েছে।");
    navigate({
      to: "/certificate",
      search: {
        name: name.trim(),
        school: school.trim(),
        exam,
        position: Number(position),
        marks,
        cls: studentClass,
      },
    });
    setSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />

      <SiteHeader />

      {ready && isTenmsAuthConfigured() && !user ? (
        <LoginGate />
      ) : checking ? (
        <section className="mx-auto max-w-md px-6 py-20 text-center">
          <p className="bn text-[0.9375rem] text-text-2">লোড হচ্ছে...</p>
        </section>
      ) : existing ? (
        <AlreadyGenerated data={existing} />
      ) : (
        <>
          <section className="border-b border-border bg-surface-tinted">
            <div className="mx-auto max-w-5xl px-6 py-12 text-center">
              <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
                Result Certificate
              </h1>
              <p className="bn mx-auto mt-3 max-w-2xl text-[0.9375rem] text-text-2">
                রেজাল্ট শেয়ার এবং রেজাল্ট সার্টিফিকেট পাওয়ার জন্য নিচের তথ্যগুলো পূরণ করো।
              </p>
            </div>
          </section>

          <section className="mx-auto max-w-3xl px-6 py-10">
            <form
              onSubmit={handleSubmit}
              className="space-y-6 rounded-2xl border border-border bg-card p-4 sm:p-6"
            >
              <Field label="১. সার্টিফিকেট নাম (ইংরেজি)">
                <div className="relative">
                  <input
                    className={fieldClass}
                    value={name}
                    maxLength={40}
                    placeholder="Your name in English (Max 40 characters)"
                    onChange={(e) => onlyEnglish(e.target.value) && setName(e.target.value)}
                    required
                  />
                  <span className="absolute right-3 top-3.5 text-xs text-text-3 font-medium">
                    {name.length}/40
                  </span>
                </div>
              </Field>

              <Field label="২. তোমার শ্রেণি">
                <select
                  className={fieldClass}
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                >
                  {CLASS_OPTIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </Field>

              <Field label="৩. তোমার স্কুলের ইংরেজি নাম লিখো">
                <div className="relative">
                  <input
                    className={fieldClass}
                    value={school}
                    maxLength={60}
                    placeholder="Your school name in English (Max 60 characters)"
                    onChange={(e) => onlyEnglish(e.target.value) && setSchool(e.target.value)}
                    required
                  />
                  <span className="absolute right-3 top-3.5 text-xs text-text-3 font-medium">
                    {school.length}/60
                  </span>
                </div>
              </Field>

              <Field label="৪. 10 Minute School-এর সাথে তুমি কীভাবে প্রস্তুতি নিয়েছো?">
                <select
                  className={`${fieldClass} bn`}
                  value={prep}
                  onChange={(e) => setPrep(e.target.value)}
                >
                  {PREP_OPTIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </Field>

              <Field label="৫. তুমি কোন পরীক্ষার রেজাল্ট আমাদের সাথে শেয়ার করতে চাও?">
                <select
                  className={fieldClass}
                  value={exam}
                  onChange={(e) => setExam(e.target.value)}
                >
                  {EXAM_OPTIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </Field>

              <Field label="৬. মোট কত নাম্বারে পরীক্ষা হয়েছিলো?">
                <input
                  type="number"
                  min={0}
                  max={5000}
                  className={fieldClass}
                  value={totalExamMarks}
                  placeholder="e.g. 1000"
                  onChange={(e) => setTotalExamMarks(e.target.value)}
                  required
                />
              </Field>

              <Field label="৭. পরীক্ষায় তুমি মোট কত নম্বর পেয়েছো?">
                <input
                  type="number"
                  min={0}
                  max={2000}
                  className={fieldClass}
                  value={marks}
                  placeholder="e.g. 940"
                  onChange={(e) => setMarks(e.target.value)}
                  required
                />
              </Field>

              <Field label="৮. তোমার ক্লাসে এই পরীক্ষায় তুমি কততম হয়েছো?">
                <input
                  type="number"
                  min={1}
                  max={500}
                  className={fieldClass}
                  value={position}
                  placeholder="e.g. 1"
                  onChange={(e) => setPosition(e.target.value)}
                  required
                />
              </Field>

              <Field label="৯. তোমার রেজাল্ট কার্ডের ছবি তোলো">
                <div className="rounded-xl border border-dashed border-outline-variant bg-surface-subtle px-4 py-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {photo ? (
                      <img
                        src={photo.preview}
                        alt="তোলা রেজাল্ট কার্ডের প্রিভিউ"
                        className="h-24 w-24 shrink-0 rounded-lg border border-border object-cover"
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className="bn text-sm text-text-3">
                        {compressing
                          ? "ছবি কম্প্রেস হচ্ছে..."
                          : photo
                            ? `ছবি রেডি (${(photo.bytes / 1024).toFixed(1)} KB)`
                            : "ক্যামেরা দিয়ে সরাসরি ছবি তোলো, অথবা গ্যালারি থেকে বেছে নাও।"}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={compressing || submitting}
                          onClick={() => cameraInputRef.current?.click()}
                          className="bn rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container disabled:opacity-60"
                        >
                          {compressing
                            ? "প্রসেস হচ্ছে..."
                            : photo
                              ? "আবার ছবি তোলো"
                              : "ক্যামেরা দিয়ে ছবি তোলো"}
                        </button>
                        <button
                          type="button"
                          disabled={compressing || submitting}
                          onClick={() => galleryInputRef.current?.click()}
                          className="bn rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-2 disabled:opacity-60"
                        >
                          গ্যালারি থেকে নাও
                        </button>
                      </div>
                    </div>
                  </div>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={(e) => {
                      void handlePickedFile(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      void handlePickedFile(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </div>
              </Field>

              <button
                type="submit"
                disabled={submitting || compressing}
                className="bn w-full rounded-full bg-green-cta px-7 py-4 text-base font-semibold text-primary-foreground transition hover:bg-primary-deep disabled:bg-border disabled:text-muted-foreground"
              >
                {uploading
                  ? "ছবি আপলোড হচ্ছে..."
                  : submitting
                    ? "প্রসেস হচ্ছে..."
                    : compressing
                      ? "ছবি কম্প্রেস হচ্ছে..."
                      : "সার্টিফিকেট জেনারেট করো"}
              </button>
            </form>
          </section>
        </>
      )}
    </main>
  );
}

function AlreadyGenerated({
  data,
}: {
  data: {
    certificate_name: string;
    school_name: string;
    exam_name: string;
    class_name: string | null;
    class_position: number;
    total_marks: number;
  };
}) {
  return (
    <section className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="bn text-2xl font-bold">তুমি ইতিমধ্যে সার্টিফিকেট তৈরি করেছো</h1>
      <p className="bn mt-3 text-[0.9375rem] text-text-2">
        প্রতিটি অ্যাকাউন্ট থেকে একটি সার্টিফিকেট তৈরি করা যায়। নিচে তোমার সার্টিফিকেটটি দেখো।
      </p>
      <Link
        to="/certificate"
        search={{
          name: data.certificate_name,
          school: data.school_name,
          exam: data.exam_name,
          position: data.class_position,
          marks: String(data.total_marks),
          cls: data.class_name ?? undefined,
        }}
        className="bn mt-7 inline-flex items-center rounded-full bg-green-cta px-7 py-4 text-base font-semibold text-primary-foreground transition hover:bg-primary-deep"
      >
        আমার সার্টিফিকেট দেখো
      </Link>
    </section>
  );
}

function LoginGate() {
  async function handleLogin() {
    try {
      await loginWithTenms();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "লগইন সম্পন্ন হয়নি।");
    }
  }

  return (
    <section className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="bn text-2xl font-bold">ফর্ম পূরণ করতে লগইন করো</h1>
      <p className="bn mt-3 text-[0.9375rem] text-text-2">
        তোমার তথ্য সংরক্ষণ করতে 10 Minute School অ্যাকাউন্ট দিয়ে লগইন করো।
      </p>
      <button
        type="button"
        onClick={handleLogin}
        className="bn mt-7 inline-flex items-center gap-3 rounded-full bg-brand-red px-7 py-4 text-base font-semibold text-primary-foreground transition hover:bg-brand-red-deep"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-background">
          <Logo variant="icon-color" height={18} />
        </span>
        Login with 10 Minute School
      </button>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="bn mb-2 block text-[0.9375rem] font-medium text-text-2">{label}</label>
      {children}
    </div>
  );
}
