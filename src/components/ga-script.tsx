import Script from "next/script";

const gaId = process.env.NEXT_PUBLIC_GA_ID;
const internalTrafficKey = "glm52_internal_traffic";

export function GAScript() {
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          (function () {
            var params = new URLSearchParams(window.location.search);
            if (params.get('internal') === '1') {
              localStorage.setItem('${internalTrafficKey}', 'true');
            }
            if (params.get('internal') === '0') {
              localStorage.removeItem('${internalTrafficKey}');
            }
            if (localStorage.getItem('${internalTrafficKey}') === 'true') {
              return;
            }

          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${gaId}', { page_path: window.location.pathname });
          })();
        `}
      </Script>
    </>
  );
}
