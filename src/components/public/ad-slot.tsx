import { cn } from "@/lib/utils";
import { getActiveAdSlot, type AdTarget } from "@/lib/public/ads";

type AdSlotProps = AdTarget & {
  className?: string;
  slotKey: string;
  stickyMobile?: boolean;
};

export async function AdSlot({ className, pageType, sectionSlug, slotKey, stickyMobile = false }: AdSlotProps) {
  const slot = await getActiveAdSlot(slotKey, { pageType, sectionSlug });

  if (!slot) {
    return null;
  }

  return (
    <aside
      aria-label="Advertisement"
      className={cn(
        "ad-slot overflow-hidden border border-neutral-200 bg-white text-center",
        stickyMobile
          ? "fixed inset-x-0 bottom-0 z-50 mx-auto block min-h-14 border-x-0 border-b-0 p-2 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] md:hidden"
          : "rounded-lg p-3",
        className
      )}
      data-ad-placement={slot.placement}
      data-ad-slot={slot.slotKey}
      dangerouslySetInnerHTML={{ __html: slot.html }}
    />
  );
}
