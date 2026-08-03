import { forwardRef } from "react";

import bgFirst from "@/assets/certificates/cert-first.jpg";
import bgSecond from "@/assets/certificates/cert-second.jpg";
import bgThird from "@/assets/certificates/cert-third.jpg";
import bgOther from "@/assets/certificates/cert-other.jpg";

export type CertificateData = {
  studentName: string;
  schoolName: string;
  examName: string;
  position: number;
  totalMarks: string;
  className?: string;
};

export function tierOf(position: number) {
  if (position === 1) return "first" as const;
  if (position === 2) return "second" as const;
  if (position === 3) return "third" as const;
  return "other" as const;
}

/**
 * Geometry is transcribed 1:1 from the official 10MS certificate deck.
 * Slide: 7562850 x 10688625 EMU (595.5pt x 841.6pt).
 * Percentages below are EMU offsets divided by the slide dimensions,
 * font sizes are pt converted to cqw (pt / 595.5 * 100).
 */
const TIERS = {
  first: {
    bg: bgFirst,
    medal: "",
    label: "1st Position",
    presentedY: 44.99,
    nameY: 49.95,
    bodyY: 55.14,
  },
  second: {
    bg: bgSecond,
    medal: "",
    label: "2nd Position",
    presentedY: 45.46,
    nameY: 50.79,
    bodyY: 56.36,
  },
  third: {
    bg: bgThird,
    medal: "",
    label: "3rd Position",
    presentedY: 44.99,
    nameY: 50.79,
    bodyY: 56.36,
  },
  other: { bg: bgOther, medal: "", label: "", presentedY: 45.46, nameY: 49.8, bodyY: 54.99 },
} as const;

const PT = (pt: number) => `${(pt / 595.5) * 100}cqw`;

export const Certificate = forwardRef<HTMLDivElement, { data: CertificateData }>(
  function Certificate({ data }, ref) {
    const tier = TIERS[tierOf(data.position)];
    const exam = <b>{data.examName}</b>;
    const cls = data.className ? (
      <>
        of <b>{data.className}</b>{" "}
      </>
    ) : null;
    const school = (
      <>
        at <b>{data.schoolName || "School Name"}.</b>
      </>
    );

    return (
      <div
        ref={ref}
        className="relative w-full overflow-hidden bg-white"
        style={{
          aspectRatio: "7562850 / 10688625",
          containerType: "inline-size",
          fontFamily: '"Poppins", Arial, sans-serif',
          color: "#000",
        }}
      >
        <img
          src={tier.bg}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div
          className="absolute text-center"
          style={{ left: "24.61%", top: `${tier.presentedY}%`, width: "50.78%", fontSize: PT(14) }}
        >
          This certificate is proudly presented to
        </div>

        <div
          className="absolute text-center font-bold"
          style={{ left: "9.58%", top: `${tier.nameY}%`, width: "80.84%", fontSize: PT(24) }}
        >
          {data.studentName || "Student Name"}
        </div>

        <div
          className="absolute text-center"
          style={{
            left: "21.54%",
            top: `${tier.bodyY}%`,
            width: "56.93%",
            fontSize: PT(14),
            lineHeight: 1.35,
          }}
        >
          {tier.label ? (
            <p>
              For achieving{tier.medal} <b>{tier.label} </b>in the {exam} {cls}
              {school}
            </p>
          ) : (
            <p>
              For achieving excellent results in the {exam} {cls}
              {school}
            </p>
          )}
          <p>&nbsp;</p>
          <p>Congratulations on this remarkable achievement!</p>
        </div>
      </div>
    );
  },
);
