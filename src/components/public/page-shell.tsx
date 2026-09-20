import { getNavigationCategories } from "@/lib/public/content";
import { AdSlot } from "@/components/public/ad-slot";
import { SiteHeader } from "@/components/public/site-header";

export async function PageShell({ children }: { children: React.ReactNode }) {
  const categories = await getNavigationCategories();

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-neutral-950">
      <SiteHeader categories={categories} />
      {children}
      <AdSlot slotKey="sticky-mobile" stickyMobile />
      <footer className="mt-16 border-t border-neutral-200 bg-neutral-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-[1fr_1.4fr] lg:px-8">
          <div>
            <p className="text-2xl font-black">Sportsfair</p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-300">
              বাংলা ভাষায় দ্রুত, নির্ভরযোগ্য এবং মোবাইল-ফার্স্ট স্পোর্টস নিউজরুম।
            </p>
          </div>
          <div className="grid gap-3 text-sm text-neutral-300 sm:grid-cols-3">
            <span>ক্রিকেট</span>
            <span>ফুটবল</span>
            <span>বাংলাদেশ</span>
            <span>আন্তর্জাতিক</span>
            <span>ভিডিও</span>
            <span>ছবি</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
