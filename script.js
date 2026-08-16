let globalReportText = "";
let scene, camera, renderer, carMesh;

// Səhifələri dəyişən funksiya
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
  }
}

// 3D Rendering Funksiyası (Three.js)
function init3DCar(colorHex) {
  const container = document.getElementById('threeContainer');
  container.innerHTML = ''; // Köhnə obyekti təmizlə

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f172a);

  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(3, 2, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // İşıqlandırma
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  // 3D Avtomobil Qrupu (Gövdə + Təkərlər)
  const carGroup = new THREE.Group();

  // Avtomobil Gövdəsi
  const bodyGeo = new THREE.BoxGeometry(2.2, 0.6, 1.2);
  const bodyMat = new THREE.MeshPhongMaterial({ color: colorHex, shininess: 100 });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = 0.5;
  carGroup.add(bodyMesh);

  // Kabin / Şüşə Hissə
  const cabinGeo = new THREE.BoxGeometry(1.2, 0.5, 1.0);
  const cabinMat = new THREE.MeshPhongMaterial({ color: 0x111111, shininess: 90 });
  const cabinMesh = new THREE.Mesh(cabinGeo, cabinMat);
  cabinMesh.position.set(-0.1, 0.9, 0);
  carGroup.add(cabinMesh);

  // Təkərlər
  const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 32);
  const wheelMat = new THREE.MeshPhongMaterial({ color: 0x333333 });

  const wheelPositions = [
    [-0.7, 0.3, 0.65],
    [0.7, 0.3, 0.65],
    [-0.7, 0.3, -0.65],
    [0.7, 0.3, -0.65]
  ];

  wheelPositions.forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(pos[0], pos[1], pos[2]);
    carGroup.add(wheel);
  });

  scene.add(carGroup);
  carMesh = carGroup;

  camera.lookAt(carGroup.position);

  function animate() {
    requestAnimationFrame(animate);
    if (carMesh) {
      carMesh.rotation.y += 0.01; // 360 Dərəcə Fırlanma
    }
    renderer.render(scene, camera);
  }
  animate();
}

// 1. QARAJDA MAŞIN YARATMA HİSSƏSİ
function searchAndGenerate3D() {
  const modelInput = document.getElementById('customModel').value.trim();
  const yearInput = document.getElementById('customYear').value.trim();

  if (!modelInput) {
    alert("Zəhmət olmasa maşının modelini yazın!");
    return;
  }

  const carTitle = document.getElementById('carTitle');
  const garageDisplay = document.getElementById('garageDisplay');

  carTitle.innerText = `${modelInput} ${yearInput ? '(' + yearInput + ')' : ''}`;
  garageDisplay.style.display = 'block';

  const searchKey = modelInput.toLowerCase();
  let carColor = 0x38bdf8; // Standart Mavi (Cruze)

  if (searchKey.includes("optima") || searchKey.includes("kia")) carColor = 0xe11d48; // Qırmızı
  else if (searchKey.includes("fusion") || searchKey.includes("ford")) carColor = 0x2563eb; // Tünd Mavi
  else if (searchKey.includes("w210") || searchKey.includes("mercedes")) carColor = 0x64748b; // Gümüşü/Boz
  else if (searchKey.includes("elantra") || searchKey.includes("hyundai")) carColor = 0x059669; // Yaşıl
  else if (searchKey.includes("note") || searchKey.includes("nissan")) carColor = 0xd97706; // Narıncı

  init3DCar(carColor);
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
      alert("❌ Xəta baş verdi. Bot Token və Chat ID-ni yoxlayın.");
    }
  });
}
