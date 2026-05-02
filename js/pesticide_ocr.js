/* ════════════════════════════════════════
   pesticide_ocr.js
   Handles: Identifying pesticide from labels.
   ════════════════════════════════════════ */

function initPesticideOCR() {
  const content = document.getElementById('ocr-content');
  if(!content) return;

  content.innerHTML = `
    <div style="background:#fff; border-radius:12px; padding:20px; border:1.5px solid var(--border); text-align:center;">
       <h3 style="margin-bottom:10px; font-weight:700;">📸 Identify Your Pesticide</h3>
       <p style="font-size:0.85rem; color:#666; margin-bottom:20px;">Take a photo of the pesticide bottle/bag to check if it's approved and see correct dosages.</p>
       
       <div id="ocr-upload-area" style="border:2px dashed #ccc; border-radius:12px; padding:30px; cursor:pointer; background:#f9f9f9;" onclick="document.getElementById('ocr-input').click()">
          <div style="font-size:2.5rem; margin-bottom:10px;">🛡️</div>
          <div style="font-weight:600; color:var(--soil);">Upload Label Photo</div>
          <div style="font-size:0.75rem; color:#999; margin-top:5px;">Works best with clear text showing Brand Name</div>
          <input type="file" id="ocr-input" style="display:none;" accept="image/*" onchange="runOCRAnalysis(this)">
       </div>

       <div id="ocr-result" style="margin-top:20px; display:none;">
          <!-- Result injected here -->
       </div>
    </div>
  `;
}

async function runOCRAnalysis(input) {
  const file = input.files[0];
  if(!file) return;

  const resultDiv = document.getElementById('ocr-result');
  const uploadArea = document.getElementById('ocr-upload-area');
  
  uploadArea.innerHTML = '<div class="loader-ring"></div><p>Scanning Label...</p>';

  try {
    // In a real app, send to Google Vision API or similar
    await new Promise(r => setTimeout(r, 2000));

    const mockData = {
      brand: "Nativo 75 WG",
      active: "Tebuconazole 50% + Trifloxystrobin 25% WG",
      status: "APPROVED",
      usage: "Control of Early & Late Blight in Tomato",
      dose: "100g per acre"
    };

    uploadArea.innerHTML = `
      <div style="font-size:2.5rem; margin-bottom:10px;">🛡️</div>
      <div style="font-weight:600; color:var(--soil);">Label Scanned!</div>
      <button style="margin-top:10px; font-size:0.8rem; background:none; border:none; text-decoration:underline; cursor:pointer;" onclick="initPesticideOCR()">Scan Another</button>
    `;

    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
      <div style="background:#e8f5e9; border:1px solid #c8e6c9; border-radius:10px; padding:15px; text-align:left;">
         <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div style="font-weight:800; font-size:1.1rem; color:#1a3a2a;">${mockData.brand}</div>
            <div style="background:#27ae60; color:white; padding:3px 10px; border-radius:20px; font-size:0.7rem; font-weight:700;">${mockData.status}</div>
         </div>
         <div style="font-size:0.85rem; color:#444; margin-bottom:10px;"><strong>Active:</strong> ${mockData.active}</div>
         <div style="font-size:0.85rem; color:#444; margin-bottom:10px;"><strong>Target:</strong> ${mockData.usage}</div>
         <div style="background:#fff; border:1px solid #eee; padding:10px; border-radius:8px; font-size:0.85rem;">
            <strong>PestiSense Dose Check:</strong><br/>
            <span style="color:var(--green); font-weight:700;">${mockData.dose}</span> is correct for Tomato Early Blight.
         </div>
      </div>
    `;

  } catch (err) {
    console.error(err);
    alert('OCR failed. Please enter name manually in Review tab.');
    initPesticideOCR();
  }
}
