/* =====================================================================
 * CONFIG — edit project settings here (client-safe, no secrets).
 *
 * - appName ......... site name shown in the header + footer.
 *                       Change it in ONE place: here.
 * - eventMonth/Day .. annual remembrance date (August 3).
 * - eventStartTime .. 24-hour start time for calendar invites ("14:00").
 * - eventDurationHours / demoRsvpBase / pledgeAmounts: demo settings.
 *
 * Server secrets (OpenRouter key + model) live ONLY in server.js / env.
 * ===================================================================== */
(function () {
  var CONFIG = {
    appName: "Rooted Honor",
    eventMonth: 8,
    eventDay: 3,
    eventStartTime: "14:00",
    eventDurationHours: 2,
    demoRsvpBase: 12,
    pledgeAmounts: [10, 25, 50]
  };
  if (typeof module !== "undefined" && module.exports) module.exports = CONFIG;
  if (typeof window !== "undefined") window.SITE_CONFIG = CONFIG;
})();
