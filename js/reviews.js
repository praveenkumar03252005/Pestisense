/* ════════════════════════════════════════
   reviews.js
   Handles: Pesticide review system.
   ════════════════════════════════════════ */

async function initReviewsTab() {
  const content = document.getElementById('reviews-content');
  if(!content) return;

  content.innerHTML = '<div class="loader-ring"></div><p style="text-align:center">Loading farmer reviews...</p>';

  try {
    const res = await fetch(`${API_BASE}/reviews`);
    if(!res.ok) throw new Error('Failed to fetch reviews');
    const data = await res.json();

    content.innerHTML = `
      <div class="review-container">
        <div class="pesticide-selector">
          <label>Filter by Pesticide:</label>
          <select id="rev-filter-pesticide" onchange="filterReviews()">
            <option value="all">All Products</option>
            <option value="nativo">Nativo (Tebuconazole + Trifloxystrobin)</option>
            <option value="amistar">Amistar (Azoxystrobin)</option>
            <option value="bavistin">Bavistin (Carbendazim)</option>
          </select>
        </div>

        <div id="reviews-list">
           ${data.map(r => renderReview(r)).join('')}
        </div>

        <div class="add-review-box">
          <h4 style="margin-bottom:10px;">Post your Review</h4>
          <input type="text" id="rev-name" placeholder="Your Name">
          <select id="rev-pesticide">
            <option value="nativo">Nativo</option>
            <option value="amistar">Amistar</option>
            <option value="bavistin">Bavistin</option>
          </select>
          <select id="rev-rating">
            <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
            <option value="4">⭐⭐⭐⭐ (Good)</option>
            <option value="3">⭐⭐⭐ (Average)</option>
            <option value="2">⭐⭐ (Poor)</option>
            <option value="1">⭐ (Waste of money)</option>
          </select>
          <textarea id="rev-text" placeholder="Share your experience (Did it work? How many days? Any side effects?)"></textarea>
          <button class="btn-submit-review" onclick="submitReview()">Post My Review →</button>
        </div>
      </div>
    `;

  } catch (err) {
    console.error(err);
    content.innerHTML = '<p class="error-text">Failed to load reviews.</p>';
  }
}

function renderReview(r) {
  return `
    <div class="review-card">
      <div class="review-header">
        <div class="review-author">${r.author} <span style="font-weight:400; color:#888;">from ${r.village}</span></div>
        <div class="review-date">${r.date}</div>
      </div>
      <div style="font-weight:700; color:var(--green); font-size:0.8rem; margin-bottom:5px;">Used: ${r.pesticide}</div>
      <div class="review-stars">${'⭐'.repeat(r.rating)}</div>
      <p class="review-text">"${r.comment}"</p>
    </div>
  `;
}

async function submitReview() {
  const name = document.getElementById('rev-name').value;
  const pesticide = document.getElementById('rev-pesticide').value;
  const rating = document.getElementById('rev-rating').value;
  const comment = document.getElementById('rev-text').value;

  if(!name || !comment) return alert('Please fill all fields');

  try {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: name, pesticide, rating: parseInt(rating), comment, village: 'Madanapalle' })
    });
    if(res.ok) {
      alert('Review posted successfully!');
      initReviewsTab();
    }
  } catch (err) {
    console.error(err);
  }
}

function filterReviews() {
  // Client-side filtering logic here
  console.log('Filtering reviews...');
}
