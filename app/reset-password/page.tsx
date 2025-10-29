// app/reset-password/page.tsx
import { redirect } from "next/navigation";

export default function ResetAlias({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams || {})) {
    if (Array.isArray(v)) v.forEach((x) => x != null && qs.append(k, String(x)));
    else if (v != null) qs.set(k, String(v));
  }
  redirect(`/auth/reset-password${qs.toString() ? `?${qs.toString()}` : ""}`);
}
