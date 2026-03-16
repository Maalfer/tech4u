/**
 * LazyImage — Performance-optimised image component
 *
 * PageSpeed / Core Web Vitals benefits:
 *   • loading="lazy"     → defers off-screen images, reduces initial payload
 *   • decoding="async"   → image decode off main thread → lower TBT
 *   • fetchPriority      → "high" for LCP hero image, "auto" elsewhere
 *   • width + height     → browser reserves space before load → zero CLS
 *   • srcSet / sizes     → serves smallest adequate resolution → faster LCP
 *   • onLoad fade-in     → smooth reveal without layout shift
 *
 * Usage:
 *   // Standard lazy image (default)
 *   <LazyImage src="/img/card.webp" alt="Card" width={400} height={250} />
 *
 *   // LCP / above-the-fold hero — eager + high priority
 *   <LazyImage src="/img/hero.webp" alt="Hero" width={1200} height={600} priority />
 *
 *   // Responsive with srcSet
 *   <LazyImage
 *     src="/img/banner.webp"
 *     alt="Banner"
 *     width={800} height={400}
 *     srcSet="/img/banner-400.webp 400w, /img/banner-800.webp 800w"
 *     sizes="(max-width: 640px) 100vw, 800px"
 *   />
 */

import { useState, useCallback } from 'react'

export default function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  style = {},
  priority = false,   // true → LCP image (eager + fetchPriority=high)
  fade = true,        // false → no opacity transition (e.g. icons)
  srcSet,
  sizes,
  onLoad: onLoadProp,
  ...rest
}) {
  const [loaded, setLoaded] = useState(false)

  const handleLoad = useCallback(
    (e) => {
      setLoaded(true)
      onLoadProp?.(e)
    },
    [onLoadProp]
  )

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      srcSet={srcSet}
      sizes={sizes}
      onLoad={handleLoad}
      className={className}
      style={{
        // Prevent CLS: reserve exact space even before image loads
        aspectRatio: width && height ? `${width} / ${height}` : undefined,
        // Smooth fade-in once decoded (only when fade=true)
        opacity: fade && !loaded ? 0 : 1,
        transition: fade ? 'opacity 0.3s ease' : undefined,
        // Never overflow container
        maxWidth: '100%',
        height: 'auto',
        ...style,
      }}
      {...rest}
    />
  )
}
