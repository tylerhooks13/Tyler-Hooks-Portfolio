/*
 * Stand-in for the design's <image-slot>. With a `src` it renders the image
 * (cover-cropped, grayscale per MOTION-SPEC.md); without one it renders a
 * labeled placeholder so empty slots read as intentional, not broken.
 * Drop real captures into /public/images and pass `src` from data.ts.
 */
export default function Media({
  id,
  src,
  alt,
  placeholder,
  priority,
}: {
  id: string
  src?: string
  alt?: string
  placeholder: string
  priority?: boolean
}) {
  return (
    <div className="media" data-media="" data-slot={id}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt ?? placeholder} loading={priority ? 'eager' : 'lazy'} decoding="async" draggable={false} />
      ) : (
        <div className="media-empty" role="img" aria-label={placeholder}>
          <span>{placeholder}</span>
        </div>
      )}
    </div>
  )
}
