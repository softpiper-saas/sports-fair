import Image from "next/image";

type ArticleImageProps = {
  src: string | null;
  alt?: string | null;
  priority?: boolean;
  className?: string;
};

export function ArticleImage({ src, alt, priority = false, className = "" }: ArticleImageProps) {
  if (!src) {
    return (
      <div
        className={`flex h-full min-h-48 w-full items-end justify-start overflow-hidden bg-[linear-gradient(135deg,#10231b_0%,#245b45_48%,#d8efe6_100%)] p-5 text-white ${className}`}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">Sportsfair</p>
          <p className="mt-2 max-w-48 text-xl font-bold leading-tight">খেলার খবর, দ্রুত ও পরিষ্কার</p>
        </div>
      </div>
    );
  }

  if (src.startsWith("/")) {
    return <Image src={src} alt={alt || ""} fill priority={priority} className={`object-cover ${className}`} />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt || ""} className={`h-full w-full object-cover ${className}`} />;
}
