import fullColor from "@/assets/branding/10ms-full-logo-color.svg?raw";
import iconColor from "@/assets/branding/10ms-icon-logo-color.svg?raw";
import iconWhiteRed from "@/assets/branding/10ms-icon-logo-white-red..svg?raw";
import { cn } from "@/lib/utils";

/**
 * 10MS logo — always inlined SVG (never <img>, never recolored).
 * Desktop / light surfaces: full lockup. Mobile top bar: icon mark.
 */
export function Logo({
  variant = "full-color",
  height = 30,
  className = "",
}: {
  variant?: "full-color" | "icon-color" | "icon-white-red";
  height?: number;
  className?: string;
}) {
  const raw =
    variant === "full-color" ? fullColor : variant === "icon-color" ? iconColor : iconWhiteRed;
  return (
    <span
      role="img"
      aria-label="10 Minute School"
      className={cn("inline-flex items-center [&>svg]:h-full [&>svg]:w-auto", className)}
      style={{ height }}
      dangerouslySetInnerHTML={{ __html: raw }}
    />
  );
}

