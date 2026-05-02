/* ════════════════════════════════════════
   reviews.js
   ════════════════════════════════════════ */

async function initReviewsTab() {
  try {
    const resp = await fetch(`${API_BASE}/reviews`);
    const data = await resp.json();
    console.log('Reviews loaded:', data);
  } catch (err) {
      console.error(err);
  }
}
