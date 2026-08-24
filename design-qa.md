## Product-page desktop WhatsApp parity QA — 2026-08-24

### Visual truth and implementation

- Source visual truth: `C:\Users\W\AppData\Local\Temp\codex-clipboard-126d4edf-6f8d-46c6-acf2-e3cb4ba965f3.png` (homepage WhatsApp target), 1920 x 929 pixels.
- Browser-rendered implementation: `D:\CodexData\Caches\yaqixin-product-whatsapp-qa\yx1389-desktop-local.png`, 1265 x 712 pixels from a 1280 x 720 CSS-pixel desktop runtime at device scale factor 1.
- Mobile regression evidence: `D:\CodexData\Caches\yaqixin-product-whatsapp-qa\yx2381-mobile-local.png`, 375 x 812 pixels from a 390 x 844 CSS-pixel mobile runtime at device scale factor 1.
- State: English product detail pages. YX1389 represents the previously missing desktop control; YX2381 represents a page whose legacy control was normalized.
- Density normalization: the full pages have different content and viewport sizes, so the fidelity comparison was normalized to the persistent floating component. Both source and implementation use the same 236 x 158 WebP raster rendered at 118 x 79 CSS pixels.

### Full-view and focused comparison evidence

- The source and browser-rendered implementation were opened together in one comparison input. The product content intentionally differs from the homepage; the task-specific full-view target is the fixed lower-right component and its relationship to the viewport edge.
- Focused comparison confirms the same green WhatsApp artwork and wordmark, transparent background, 118 x 79 rendered size, and 22px right/bottom offsets. The implementation uses the homepage asset directly rather than recreating the mark.
- YX1389 and YX2381 each render exactly one desktop control; no legacy `.whatsapp-floating` link remains. No visual P0/P1/P2 mismatch was found.

### Required fidelity surfaces

- Fonts and typography: the WhatsApp wordmark is part of the original homepage raster, so its letterforms, weight and antialiasing are identical.
- Spacing and layout rhythm: the implementation matches the homepage 118px width, natural 79px height, fixed positioning, 22px right/bottom offsets and subtle 3px hover lift.
- Colors and visual tokens: the original green/white/transparent raster and `rgba(36,192,98,.25)` drop shadow are reused.
- Image quality and asset fidelity: `/yaqixin-assets/whatsapp-floating-236.webp` is reused at exactly half its 236 x 158 source dimensions; no synthetic icon or replacement asset was introduced.
- Copy and content: the visible `WhatsApp` wordmark is unchanged. The accessible label identifies YAQIXIN and +86 18125117673.

### Comparison history

- Initial audit P1: 29 of 76 product pages had no floating logo; 47 used heterogeneous legacy markup and routed to `#inquiry`. Fix: all 76 product pages now share one desktop-only component, source asset and direct `https://wa.me/8618125117673` target.
- Final desktop evidence: YX1389 and YX2381 both render one 118 x 79 fixed component with no console errors or horizontal overflow.
- Final mobile evidence: the new component computes to `display:none`; the existing mobile action bar remains visible as a grid, and document width is 375/375 with no horizontal overflow.

### Interaction and audit checks

- The desktop anchor has `target="_blank"`, `rel="noopener noreferrer"` and the exact direct WhatsApp URL for +86 18125117673. The external WhatsApp page was not opened during QA, avoiding an unintended third-party handoff; destination correctness was verified from rendered DOM and the 76-page HTTP crawl.
- The source validator, product catalog validator and Product JSON-LD validator pass for all 76 products.
- Local HTTP crawl: 76/76 product routes return HTTP 200 with exactly one component, the homepage asset, the shared stylesheet and the correct destination; both shared assets return HTTP 200.
- Browser errors checked on the representative desktop and mobile pages: none.

final result: passed
## Blog navigation parity QA — 2026-08-24

### Visual truth and implementation

- User reference: `C:\Users\W\AppData\Local\Temp\codex-clipboard-df55897b-b6c0-462b-928c-8540a9231a58.png` (homepage navigation target).
- Normalized source capture: `D:\CodexData\Caches\yaqixin-blog-nav-qa\home-nav-1920.png`.
- Final implementation capture: `D:\CodexData\Caches\yaqixin-blog-nav-qa\blog-nav-1920-final.png`.
- Combined comparison: `D:\CodexData\Caches\yaqixin-blog-nav-qa\home-vs-blog-nav-1920.png` (homepage first, Blog second).
- Desktop viewport: 1920 x 1050 CSS px; device scale factor 1. Source and implementation navigation captures are both 1920 x 84 px.
- Mobile implementation: `D:\CodexData\Caches\yaqixin-blog-nav-qa\blog-mobile-390-final.png` at a 390 x 844 CSS-pixel viewport and device scale factor 1.
- State: English, navigation closed for the visual comparison; Products and language menus tested separately in their open states.

### Full-view and focused comparison evidence

- The supplied homepage and Blog screenshots were opened before implementation. The page bodies intentionally differ, so full-page content was not treated as a fidelity target; the task-specific full view is the complete header region from announcement bar through navigation.
- The normalized combined comparison places the complete homepage and Blog navigation captures in one image. Brand position, menu order, header height, background, search control, language control and lower border align without a visible P0/P1/P2 mismatch.
- Focused computed-style evidence matches at 1920px: navigation 1920 x 84, gap 34px, padding 0 38px, brand 30px Georgia at weight 700, menu 13px Inter at weight 800 with 22px gap, search 248 x 38, and language trigger 102 x 38.

### Required fidelity surfaces

- Fonts and typography: Blog header now uses the homepage Inter/Segoe UI/Arial stack; the YAQIXIN wordmark uses the same Georgia stack, 30px size and 700 weight.
- Spacing and layout rhythm: header height, grid tracks, brand alignment, menu gap, search width and language-control spacing match the homepage capture.
- Colors and visual tokens: announcement navy, warm paper navigation background, ink text, copper interaction color and line color match the homepage header.
- Image quality and asset fidelity: the existing US/Spain flag assets and wordmark treatment are reused; no replacement or synthetic assets were introduced.
- Copy and content: exactly one `Home / Products / Custom Capability / About Us / Blog / Inquiry` sequence is present. The duplicate Blog and extra Customize entries are removed.

### Comparison history

- Initial P1: Blog used a separate legacy header, duplicated Blog, added Customize, and omitted the Products dropdown, search and language controls. Fix: the Blog generator now derives its header from the homepage navigation source.
- Pass 1 P2: inherited Arial typography, a 388px search box and excess Products-button height differed from the homepage. Fix: header typography, grid track, search width, line height and trigger padding were matched to measured homepage values.
- Mobile pass 1 P2: both desktop and mobile announcement strings were visible. Fix: the responsive visibility rules now show only the compact mobile announcement at 390px.
- Final desktop and mobile evidence: no actionable P0/P1/P2 findings remain; desktop and mobile show no horizontal overflow or browser error overlay.

### Interaction checks

- Products opens the full product-category panel and updates `aria-expanded`; Escape closes it.
- Language menu opens with English and Spanish options.
- Search remains visible and uses the existing site search handler.
- Mobile quick-action Menu opens the shared sitewide category sheet.
- Blog listing and a representative article page both render the same header with one Blog link and no horizontal overflow.
- Browser errors checked: none.

final result: passed

## Instagram wall QA — 2026-08-14

### Final result: passed

The English and Spanish homepages now include a six-card Instagram Reel wall using local WebP cover images. The English wall follows the customer showroom section and each card opens its matching public Reel.

### Browser evidence

- Desktop local preview at 1920×873: six cards, three columns at 388px each, all six images loaded at their source dimensions, and no horizontal overflow.
- Mobile local preview at 390×844: six cards, two columns at 166.5px each, all six images loaded, `clientWidth` and `scrollWidth` both 375px, and the mobile action bar remains usable.
- The six cards link to individual public Reels; the header CTA links to the public Instagram profile.

### Code and asset checks

- Six source images are stored as WebP under `yaqixin-assets/instagram/`; original JPG references are retained outside the public bundle for traceability.
- `node --check scripts/sync-instagram-profile.mjs` passed.
- `git diff --check` passed.
- Local CSS and all six WebP assets returned HTTP 200 during preview checks.
- No browser console errors or warnings were observed during the local English homepage checks.

### Result

Passed. No P0, P1, or P2 issues remain for the Instagram wall implementation.

## Historical homepage implementation QA — 2026-08-10

### Historical result: blocked

The current homepage/product-layout implementation could not receive browser visual sign-off in this run: the permitted in-app browser could not navigate to the local HTTP preview, and Chrome control was unavailable. No new screenshots were generated. Static checks completed instead: HTML tag-stack parsing, inline/external JavaScript parsing, local HTTP asset checks, and homepage module counts.

The hero snapshot and “Passed” result below are historical evidence for an earlier hero-only implementation and do not certify the current source after the homepage restructuring.

# Historical homepage static B2B hero — design QA

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

## Historical result

Passed. No P0, P1, or P2 visual or interaction issues remain. The only intentional visual deviation from the selected concept is replacing Denim with Lace at the buyer's request.

# Homepage Banner Design QA

**Source visual truth**

- `C:\Users\W\Downloads\New Banner.png`
- Source pixels: 1916 × 821.

**Rendered implementation**

- Screenshot: `D:\CodexData\Caches\yaqixin-banner-new\qa\yaqixin-homepage-banner-new-implementation.png`
- Full-view comparison: `D:\CodexData\Caches\yaqixin-banner-new\qa\yaqixin-homepage-banner-new-comparison.png`
- Focused CTA comparison: `D:\CodexData\Caches\yaqixin-banner-new\qa\yaqixin-homepage-banner-new-buttons-comparison.png`
- Browser viewport: 1916 × 1000 CSS px at device scale factor 1.
- Rendered banner: 1901 × 814.56 CSS px; implementation capture normalized to 1901 × 815 pixels.
- Reference normalization: source resized from 1916 × 821 to 1901 × 815 for equal-size comparison.
- State: desktop default state, with the primary CTA hover state checked separately.

**Findings**

- No actionable P0, P1, or P2 differences remain.
- Fonts and typography: the supplied image retains its original display typography. The live CTA labels use the site's Inter stack and closely match the baked labels; the slightly stronger live weight is an acceptable affordance for interactive controls.
- Spacing and layout rhythm: the 1916:821 aspect ratio, full-width crop, CTA positions, and CTA dimensions align with the normalized source.
- Colors and visual tokens: the live CTA fills and borders visually match the supplied dark brown and warm ivory palette. Hover states intentionally add darkening and shadow.
- Image quality and asset fidelity: the exact supplied raster is used; the 1916-pixel WebP is paired with a sharpened 3832-pixel high-density derivative. No visible crop, stretch, or compression artifact was found.
- Copy and content: headline, support copy, feature strip, process strip, and the two CTA labels match the supplied design. Semantic alt text describes the fabric rolls, lace, satin, and swatches without keyword stuffing.
- Interaction: Explore Fabrics resolves to `/all-products`; Get Free Sample resolves to `/inquiry`. Hover lifts the button by 5px, adds a shadow, darkens/brightens the fill, and moves the arrow 7px.
- Responsive behavior: at 390 × 844 the desktop hero is `display:none`, its image remains the 1×1 fallback, and the page has no horizontal overflow. This preserves the user's decision to defer the mobile banner.
- Console: no browser console errors were observed in the tested homepage states.

**Comparison history**

- First pass: no P0/P1/P2 mismatch found. No corrective visual iteration was required.

**Focused evidence**

- The focused comparison covers both CTA rectangles at equal density; no separate micro-crop was needed beyond that button-region comparison.

**Follow-up Polish**

- P3: the live CTA text is marginally bolder than the baked source label, accepted because it improves click affordance and disappears as a difference during interaction.

**Implementation Checklist**

- [x] Use the supplied visual at the original desktop ratio.
- [x] Add real, keyboard-focusable CTA links.
- [x] Add visible hover, active, focus, and reduced-motion states.
- [x] Keep the desktop banner hidden below 601px.
- [x] Remove the previous 1×, 2×, and source-image records.

final result: passed
