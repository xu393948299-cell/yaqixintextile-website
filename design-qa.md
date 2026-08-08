# Homepage static B2B hero — design QA

## Visual reference and implementation

- Selected visual direction: Option 1, B2B split hero (copy and conversion actions on the left; operational proof and fabric material cards on the right).
- Reference: `C:\Users\W\.codex\generated_images\019f6907-37be-7421-b7ec-cdc8b716e076\exec-70e6bc99-3092-4279-8027-9f144d198796.png`
- Final desktop capture: `C:\Users\W\AppData\Local\Temp\yaqixin-hero-implementation-desktop-final.png`
- Side-by-side comparison: `C:\Users\W\AppData\Local\Temp\yaqixin-hero-design-comparison-final.png`

## Checks completed

- Desktop, first slide: the split composition, hierarchy, primary CTA pair, warehouse image, and material-card proof points are visible and balanced at a 1440px desktop viewport.
- Mobile: the copy is above the visual, buttons remain usable without horizontal overflow, and the carousel retains dots and swipe navigation. The compact breakpoint stacks the CTAs.
- Slide controls: previous/next controls, three indicators, keyboard focus, hover/focus pause, automatic 6.5-second rotation, and touch swipe are implemented.
- Conversion paths: collection CTA opens `/all-products`; quote and sample CTAs target `#inquiry`; custom CTA opens `/custom-capability`.
- Performance: the first warehouse image is preloaded with `fetchpriority="high"`; slides 2 and 3 hydrate only after a delay or direct selection. The removed video is not referenced by either English or Spanish homepage.
- Content: copy is selectable HTML, exactly three slides are present, and the requested material cards are Tulle, Satin, and Lace. Lace intentionally replaces the reference concept's Denim card.
- Runtime: no browser console errors were observed on the English or Spanish local homepage.

## Result

Passed. No P0, P1, or P2 visual or interaction issues remain. The only intentional visual deviation from the selected concept is replacing Denim with Lace at the buyer's request.
