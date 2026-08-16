let globalReportText = "";

// Modellərin bazası
// Tam işlək və açıq 3D Modellər Bazası
const car3DBase = {
  "cruze": "https://sketchfab.com/models/041efbc3b8e44b93b827e87a229a4a75/embed?autostart=1&ui_controls=1",
  "optima": "https://sketchfab.com/models/300eb058b8d447d287fa678d1ad64547/embed?autostart=1&ui_controls=1",
  "fusion": "https://sketchfab.com/models/193237a34fa04a8894ec05b1b70129bc/embed?autostart=1&ui_controls=1",
  "w210": "https://sketchfab.com/models/782d49f05fef438da15dc2463e8006e8/embed?autostart=1&ui_controls=1",
  "elantra": "https://sketchfab.com/models/9c488b030bbf4c1aaee79899f8d9b2e7/embed?autostart=1&ui_controls=1",
  "note": "https://sketchfab.com/models/02f08eb0fb5642cebeebcfbf1c360563/embed?autostart=1&ui_controls=1"
};


// Səhifələri dəyişən funksiya
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(pageId).classList.add('active');
}

// 1. QARAJDADA MAŞIN YARATMA HİSSƏSİ
function searchAndGenerate3D() {
  const modelInput = document.getElementById('customModel').value.trim();
  const yearInput = document.getElementById('customYear').value.trim();

  if (!modelInput) {
    alert("Zəhmət olmasa maşının modelini yazın!");
    return;
  }

  const carTitle = document.getElementById('carTitle');
  const iframe = document.getElementById('carIframe');
  const garageDisplay = document.getElementById('garageDisplay');

  carTitle.innerText = `${modelInput} ${yearInput ? '(' + yearInput + ')' : ''}`;

  const searchKey = modelInput.toLowerCase();
  let foundUrl = car3DBase["cruze"];

  if (searchKey.includes("optima")) foundUrl = car3DBase["optima"];
  else if (searchKey.includes("fusion")) foundUrl = car3DBase["fusion"];
  else if (searchKey.includes("w210") || searchKey.includes("mercedes")) foundUrl = car3DBase["w210"];
  else if (searchKey.includes("elantra")) foundUrl = car3DBase["elantra"];
  else if (searchKey.includes("note")) foundUrl = car3DBase["note"];

  iframe.src = foundUrl;
  garageDisplay.style.display = 'block';
}

// 2. YANACAQ VƏ TEXNİKİ HESABLAYICI HİSSƏSİ
function calculateFuel() {
  const model = document.getElementById('calcModelName').value || "Avtomobil";
  const distance = parseFloat(document.getElementById('distance').value);
  const fuel = parseFloat(document.getElementById('fuel').value);
  const price = parseFloat(document.getElementById('price').value);
  const mileage = parseInt(document.getElementById('mileage').value);

  if (!distance || !fuel || !price || !mileage) {
    alert("Zəhmət olmasa bütün xanaları doldurun!");
    return;
  }

  const avgFuel = ((fuel / distance) * 100).toFixed(1);
  const totalCost = (fuel * price).toFixed(2);
  const costPerKm = (totalCost / distance).toFixed(2);
  const nextOilChange = mileage + 8000;

  document.getElementById('resFuel').innerHTML = `⛽ <b>Orta sərfiyyat:</b> ${avgFuel} L / 100 km`;
  document.getElementById('resCost').innerHTML = `💰 <b>Ümumi xərc:</b> ${totalCost} AZN (1 km = ${costPerKm} AZN)`;
  document.getElementById('resOil').innerHTML = `🔧 <b>Növbəti yağ dəyişmə:</b> ${nextOilChange} km-də`;

  document.getElementById('calcResult').style.display = 'block';

  globalReportText = `🚘 *Avtomobil Hesabatı*\n` +
                     `───────────────\n` +
                     `🏎️ *Model:* ${model}\n` +
                     `📍 *Probeq:* ${mileage} km\n` +
                     `⛽ *Sərfiyyat:* ${avgFuel} L/100 km\n` +
                     `💵 *Xərc:* ${totalCost} AZN\n` +
                     `🔧 *Növbəti Yağ Dəyişmə:* ${nextOilChange} km\n\n` +
                     `📅 *Tarix:* ${new Date().toLocaleDateString('az-AZ')}`;
}

function sendToTelegram() {
  const botToken = '8898539577:AAEio79TVe2UPlYevcUD9yks9ju9VfUYE2A';
  const chatId = '1937526981';

  if (!globalReportText) return;

  fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: globalReportText,
      parse_mode: 'Markdown'
    })
  })
  .then(res => {
    if(res.ok) {
      alert("✅ Hesabat Telegram botunuza göndərildi!");
    } else {
      alert("❌ Xəta baş verdi.");
    }
  });
}
