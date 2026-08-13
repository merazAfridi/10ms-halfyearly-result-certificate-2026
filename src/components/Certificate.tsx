import { forwardRef } from "react";

import bgFirst from "@/assets/certificates/bg-first.svg";
import bgSecond from "@/assets/certificates/bg-second.svg";
import bgThird from "@/assets/certificates/bg-third.svg";
import bgOther from "@/assets/certificates/bg-other.svg";

export type CertificateData = {
  studentName: string;
  schoolName: string;
  examName: string;
  position: number;
  totalMarks: string;
  className?: string;
};

function ordinalSuffix(i: number) {
  const j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) return i + "st";
  if (j == 2 && k != 12) return i + "nd";
  if (j == 3 && k != 13) return i + "rd";
  return i + "th";
}

export function tierOf(position: number) {
  if (position === 1) return "first" as const;
  if (position === 2) return "second" as const;
  if (position === 3) return "third" as const;
  return "other" as const;
}

const TIERS = {
  first: { bg: bgFirst },
  second: { bg: bgSecond },
  third: { bg: bgThird },
  other: { bg: bgOther },
} as const;

export const Certificate = forwardRef<HTMLDivElement, { data: CertificateData }>(
  function Certificate({ data }, ref) {
    const tierKey = tierOf(data.position);
    const tier = TIERS[tierKey];

    return (
      <div
        ref={ref}
        className="relative w-full overflow-hidden bg-white select-none shadow-sm"
        style={{
          aspectRatio: "1121 / 793",
          containerType: "inline-size",
          fontFamily: '"Inter", "Anek Bangla", sans-serif',
          color: "#0F172A",
        }}
      >
        {/* The Exact SVG Background (without placeholder text) */}
        <img
          src={tier.bg}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />


        {/* Content Area — dynamic student data only */}
        <div
          className="absolute z-10 flex flex-col items-center justify-start text-center"
          style={{ left: "28%", right: "3%", top: "37.5%", bottom: "16%" }}
        >
          {/* Presented To */}
          <p
            className="font-normal"
            style={{ fontSize: "1.9cqw", color: "#000000", marginBottom: "0.5cqw" }}
          >
            This certificate is proudly presented to
          </p>

          {/* Name */}
          <h2
            className="font-black"
            style={{ fontSize: "4.2cqw", color: "#000000", marginBottom: "1cqw" }}
          >
            {data.studentName || "Student Name"}
          </h2>

          {/* Body */}
          <p
            className="font-normal leading-relaxed"
            style={{ fontSize: "1.8cqw", color: "#000000", maxWidth: "68%" }}
          >
            For achieving <b>{ordinalSuffix(data.position)} Position</b> in the{" "}
            <b>{data.examName.replace(/Examination/gi, "Exam")}</b> of{" "}
            <b>{data.className}</b> at <b>{data.schoolName}</b>.
          </p>

          <p
            className="font-normal"
            style={{ fontSize: "1.8cqw", color: "#000000", marginTop: "3cqw" }}
          >
            Congratulations on this remarkable<br />
            achievement!
          </p>
        </div>
      </div>
    );
  }
);
