let globalReportText = "";

function calculate() {
  const model = document.getElementById('model').value;
  const distance = parseFloat(document.getElementById('distance').value);
  const fuel = parseFloat(document.getElementById('fuel').value);
  const price = parseFloat(document.getElementById('price').value);
  const mileage = parseInt(document.getElementById('mileage').value);

  if (!model || !distance || !fuel || !price || !mileage) {
    alert("Zəhmət olmasa bütün xanaları doldurun!");
    return;
  }

  // 100 km-ə sərfiyyat
  const avgFuel = ((fuel / distance) * 100).toFixed(1);
  
  // Ümumi xərc və 1 km xərci
  const totalCost = (fuel * price).toFixed(2);
  const costPerKm = (totalCost / distance).toFixed(2);

  // Yağ dəyişmə vaxtı (+8000 km standart norma)
  const nextOilChange = mileage + 8000;

  // Nəticələri ekranda göstəririk
  document.getElementById('resFuel').innerHTML = `⛽ <b>Orta sərfiyyat:</b> ${avgFuel} L / 100 km`;
  document.getElementById('resCost').innerHTML = `💰 <b>Ümumi xərc:</b> ${totalCost} AZN (1 km = ${costPerKm} AZN)`;
  document.getElementById('resOil').innerHTML = `🔧 <b>Növbəti yağ dəyişmə:</b> ${nextOilChange} km-də`;

  document.getElementById('result').style.display = 'block';

  // Telegram üçün mətni hazırlayırıq
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
      alert("❌ Xəta baş verdi, məlumatları yoxlayın.");
    }
  });
}
