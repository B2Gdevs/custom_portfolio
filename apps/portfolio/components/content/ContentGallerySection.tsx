import Image from 'next/image';

type Variant = 'blog' | 'projects';

const gridByVariant: Record<Variant, string> = {
  blog: 'grid grid-cols-1 gap-4 md:grid-cols-2',
  projects: 'grid grid-cols-2 gap-4 md:grid-cols-3',
};

/** Extra image strip when `images` has more than the hero alone (length &gt; 1). */
export function ContentGallerySection({
  title = 'Gallery',
  images,
  altPrefix,
  variant,
}: {
  title?: string;
  images: string[];
  altPrefix: string;
  variant: Variant;
}) {
  if (images.length <= 1) {
    return null;
  }

  const isProject = variant === 'projects';

  return (
    <section
      className="rounded-[2rem] border border-border/70 bg-dark-alt/55 p-6"
      {...(isProject ? { 'data-gallery-container': true } : {})}
    >
      <h2 className="font-serif text-2xl text-primary">{title}</h2>
      <div className={`mt-6 ${gridByVariant[variant]}`}>
        {images.map((img: string, idx: number) => (
          <div
            key={idx}
            {...(isProject ? { 'data-gallery-image': true } : {})}
            className={
              isProject
                ? 'group relative aspect-video cursor-pointer overflow-hidden rounded-2xl border border-border shadow-md transition-shadow hover:shadow-xl'
                : 'group relative aspect-video overflow-hidden rounded-2xl border border-border shadow-md transition-shadow hover:shadow-xl'
            }
          >
            <Image
              src={img}
              alt={`${altPrefix} - Image ${idx + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
