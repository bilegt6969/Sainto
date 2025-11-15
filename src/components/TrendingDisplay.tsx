// components/TrendingDisplay.tsx
import { fetchUsedEbayItems } from '../../lib/ebayApi.server'; // ← .server.ts
import { client } from '../../lib/client';
import Link from 'next/link';
import Image from 'next/image';
 
interface EbayItem {
  itemId: string;
  title: string;
  itemWebUrl: string;
  image?: { imageUrl?: string };
}

interface TrendingSectionProps {
  title: string;
  subTitle: string;
  items: EbayItem[];
  viewMoreKeyword: string;
}

interface SanityTrendingSection {
  _id: string;
  title: string;
  subTitle: string;
  searchKeyword: string;
  viewMoreKeyword: string;
  order?: number;
}

function TrendingSection({
  title,
  subTitle,
  items,
  viewMoreKeyword,
}: TrendingSectionProps) {
  const displayItems = [...items];
  while (displayItems.length < 4) {
    displayItems.push({
      itemId: `placeholder-${displayItems.length}`,
      title: 'Placeholder',
      itemWebUrl: '#',
    });
  }

  const viewMoreLink = `/dog?q=${encodeURIComponent(viewMoreKeyword)}`;

  console.log(viewMoreLink)

  return (
    <div className="flex-1 min-w-0">
      <p className="text-[11px] text-gray-400 font-mono uppercase tracking-wider font-normal m-0 mb-1">
        {subTitle}
      </p>
      <h2 className="text-xl font-bold text-black m-0 mb-4">{title}</h2>

      <div className="grid grid-cols-2 gap-[2px]">
        {displayItems.slice(0, 4).map((item, idx) => {
          const isViewMore = idx === 3;
          const img =
            item.image?.imageUrl
              ?.replace('s-l140', 's-l500')
              ?.replace('s-l225', 's-l500') ||
            'https://placehold.co/300x300?text=N/A';
          const href = isViewMore ? viewMoreLink : item.itemWebUrl;
          const Wrapper = isViewMore ? Link : 'a';

          return (
            <div
              key={item.itemId}
              className="relative w-full pt-[100%] bg-gray-100 overflow-hidden"
            >
              <Wrapper
                href={href}
                target={isViewMore ? '_self' : '_blank'}
                rel={isViewMore ? '' : 'noopener noreferrer'}
                className="absolute inset-0 block"
              >
                <Image
                  src={img}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  unoptimized={img.includes('ebay.com')}
                />
                {isViewMore && (
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-white font-bold text-sm bg-black/30 z-10">
                    + VIEW MORE
                  </div>
                )}
              </Wrapper>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- SERVER COMPONENT ---- */
export default async function TrendingDisplay() {
  const sections: SanityTrendingSection[] = await client.fetch(
    `*[_type == "trendingSection"] | order(order asc)`
  );

  if (!sections?.length) return null;

  const itemsPromises = sections.map((s) =>
    fetchUsedEbayItems(s.searchKeyword, 4)
  );
  const allItems = await Promise.all(itemsPromises);

  return (
    <div className="flex flex-row gap-8 w-full max-w-full bg-white px-4 py-8">
      {sections.map((s, i) => (
        <TrendingSection
          key={s._id}
          title={s.title}
          subTitle={s.subTitle}
          items={allItems[i]}
          viewMoreKeyword={s.viewMoreKeyword}
        />
      ))}
    </div>
  );
}