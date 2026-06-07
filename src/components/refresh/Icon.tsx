export type IconProps = {
  /**
   * Lucide icon name in kebab-case (e.g. 'shopping-cart', 'chevron-down').
   * Browse the full set at https://lucide.dev/icons.
   */
  name: string;
  /** Pixel size — applied to both width and height. Default 16. */
  size?: number;
  /**
   * When set, switches the icon from decorative to semantic — adds
   * `role="img"` + `aria-label`. Leave unset for purely decorative usage
   * (the default), which renders the icon with `aria-hidden="true"`.
   */
  ariaLabel?: string;
  className?: string;
  /**
   * Inline style escape hatch (e.g. for transforms / rotations). Merged on
   * top of the mask + size styles the component already emits.
   */
  style?: React.CSSProperties;
};

/**
 * Pin the Lucide-static version so the CDN URL doesn't drift between
 * deploys. Bump intentionally when picking up new icons.
 */
const LUCIDE_VERSION = '1.14.0';

/**
 * Lucide icon, delivered via the jsDelivr CDN. No npm dependency.
 *
 * Lucide-static SVGs use `stroke="currentColor"` to inherit text color, but
 * `<img src=".svg">` doesn't honor CSS `color`. We work around that with
 * a CSS `mask-image`: the element's `background-color` (here, `currentColor`)
 * shows through the SVG silhouette. Result — icons inherit `text-refresh-*`
 * tokens automatically and theme correctly.
 *
 * @example
 * <Icon name="shopping-cart" />
 * <Icon name="check" size={20} className="text-refresh-sage" />
 * <Icon name="alert-triangle" ariaLabel="Warning" />
 */
export function Icon({
  name,
  size = 16,
  ariaLabel,
  className = '',
  style,
}: IconProps) {
  const url = `https://cdn.jsdelivr.net/npm/lucide-static@${LUCIDE_VERSION}/icons/${name}.svg`;
  const isSemantic = !!ariaLabel;

  return (
    <span
      role={isSemantic ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={isSemantic ? undefined : true}
      style={{
        width: size,
        height: size,
        backgroundColor: 'currentColor',
        WebkitMaskImage: `url("${url}")`,
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskImage: `url("${url}")`,
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        maskSize: 'contain',
        ...style,
      }}
      className={`inline-block shrink-0 align-[-0.125em] ${className}`}
    />
  );
}
