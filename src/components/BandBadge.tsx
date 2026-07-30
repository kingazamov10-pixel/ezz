export function BandBadge({ band, size = "md" }: { band: number; size?: "sm" | "md" | "lg" }) {
  const color =
    band >= 8
      ? "bg-emerald-600"
      : band >= 7
        ? "bg-emerald-500"
        : band >= 6
          ? "bg-indigo-500"
          : band >= 5
            ? "bg-amber-500"
            : "bg-rose-500";
  const sz =
    size === "lg"
      ? "text-4xl h-20 w-20"
      : size === "sm"
        ? "text-sm h-8 w-8"
        : "text-lg h-12 w-12";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold text-white shadow-md ${color} ${sz}`}
    >
      {band.toFixed(1)}
    </span>
  );
}
