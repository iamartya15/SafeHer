import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry for SafeHer AI with Zero-PII Leak Safeguards.
 * Scrubs latitude, longitude, phone numbers, and location payloads BEFORE sending to Sentry servers.
 */
export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN || '';
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE || 'production',
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    tracesSampleRate: 0.1,
    sendDefaultPii: false,

    // Scrub UI interaction breadcrumbs (DOM click hrefs, WhatsApp links, phone numbers)
    beforeBreadcrumb(breadcrumb, hint) {
      if (breadcrumb.category === 'ui.click' && breadcrumb.data) {
        try {
          let dataStr = JSON.stringify(breadcrumb.data);
          
          // Scrub Google Maps coordinates from URLs
          dataStr = dataStr.replace(/q=[-+]?[0-9]*\.?[0-9]+,[-+]?[0-9]*\.?[0-9]+/gi, 'q=[REDACTED_COORDS]');
          
          // Scrub Indian phone numbers
          dataStr = dataStr.replace(/(\+?91|0)?[6-9]\d{9}/g, '[REDACTED_PHONE]');
          
          breadcrumb.data = JSON.parse(dataStr);
        } catch (e) {}
      }

      if (breadcrumb.data && breadcrumb.data.url) {
        breadcrumb.data.url = breadcrumb.data.url.replace(/q=[-+]?[0-9]*\.?[0-9]+,[-+]?[0-9]*\.?[0-9]+/gi, 'q=[REDACTED_COORDS]');
      }

      if (breadcrumb.message) {
        breadcrumb.message = breadcrumb.message.replace(/(\+?91|0)?[6-9]\d{9}/g, '[REDACTED_PHONE]');
      }

      return breadcrumb;
    },

    // Scrub error event payloads before transmission
    beforeSend(event) {
      if (event.extra) {
        delete event.extra.location;
        delete event.extra.coords;
        delete event.extra.phone;
      }

      if (event.request && event.request.data) {
        try {
          let reqStr = typeof event.request.data === 'string' ? event.request.data : JSON.stringify(event.request.data);
          reqStr = reqStr.replace(/"lat":\s*[-+]?[0-9]*\.?[0-9]+/gi, '"lat": "[REDACTED]"');
          reqStr = reqStr.replace(/"lng":\s*[-+]?[0-9]*\.?[0-9]+/gi, '"lng": "[REDACTED]"');
          reqStr = reqStr.replace(/q=[-+]?[0-9]*\.?[0-9]+,[-+]?[0-9]*\.?[0-9]+/gi, 'q=[REDACTED_COORDS]');
          reqStr = reqStr.replace(/(\+?91|0)?[6-9]\d{9}/g, '[REDACTED_PHONE]');
          event.request.data = reqStr;
        } catch (e) {}
      }

      if (event.user) {
        delete event.user.ip_address;
        delete event.user.email;
        delete event.user.phone;
      }

      return event;
    }
  });
};
