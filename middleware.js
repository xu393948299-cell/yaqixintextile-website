const migratedRoutes = new Map([
  ["/about-us", "/custom-capability"],
  ["/about-us.html", "/custom-capability"],
  [
    "/blog/content/how-to-source-wholesale-fabric-from-china",
    "/blog/how-to-source-wholesale-fabric-from-china",
  ],
  [
    "/blog/content/how-to-source-wholesale-fabric-from-china.html",
    "/blog/how-to-source-wholesale-fabric-from-china",
  ],
  [
    "/blog/content/how-to-choose-tulle-fabric-for-wedding-dresses-veils-and-dancewear",
    "/blog/how-to-choose-tulle-fabric-for-wedding-dresses-veils-and-dancewear",
  ],
  [
    "/blog/content/how-to-choose-tulle-fabric-for-wedding-dresses-veils-and-dancewear.html",
    "/blog/how-to-choose-tulle-fabric-for-wedding-dresses-veils-and-dancewear",
  ],
  [
    "/blog/content/types-of-satin-fabric-mikado-stretch-matte-liquid-compared",
    "/blog/types-of-satin-fabric-mikado-stretch-matte-liquid-compared",
  ],
  [
    "/blog/content/types-of-satin-fabric-mikado-stretch-matte-liquid-compared.html",
    "/blog/types-of-satin-fabric-mikado-stretch-matte-liquid-compared",
  ],
]);

export default function middleware(request) {
  const url = new URL(request.url);
  const destinationPath = migratedRoutes.get(url.pathname);

  if (!destinationPath) return;

  const destination = new URL(destinationPath, request.url);
  destination.search = url.search;
  return Response.redirect(destination, 308);
}

export const config = {
  matcher: [
    "/about-us",
    "/about-us.html",
    "/blog/content/how-to-source-wholesale-fabric-from-china",
    "/blog/content/how-to-source-wholesale-fabric-from-china.html",
    "/blog/content/how-to-choose-tulle-fabric-for-wedding-dresses-veils-and-dancewear",
    "/blog/content/how-to-choose-tulle-fabric-for-wedding-dresses-veils-and-dancewear.html",
    "/blog/content/types-of-satin-fabric-mikado-stretch-matte-liquid-compared",
    "/blog/content/types-of-satin-fabric-mikado-stretch-matte-liquid-compared.html",
  ],
};
