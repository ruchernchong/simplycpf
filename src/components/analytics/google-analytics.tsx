"use client";

import Script from "next/script";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied'
          });
          gtag('config', '${GA_MEASUREMENT_ID}', {
            anonymize_ip: true
          });
        `}
      </Script>
      <Script id="ga4-consent-grant" strategy="afterInteractive">
        {`
          function grantConsentOnInteraction() {
            gtag('consent', 'update', {
              analytics_storage: 'granted'
            });
            document.removeEventListener('click', grantConsentOnInteraction);
            document.removeEventListener('scroll', grantConsentOnInteraction);
            document.removeEventListener('keydown', grantConsentOnInteraction);
          }
          document.addEventListener('click', grantConsentOnInteraction);
          document.addEventListener('scroll', grantConsentOnInteraction);
          document.addEventListener('keydown', grantConsentOnInteraction);
        `}
      </Script>
    </>
  );
}
