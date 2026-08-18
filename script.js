
function startGameWithPlayer() {
  // ... (əvvəlki kodların)

  // Ekranı avtomatik üfüqi rejimə çevirib kilidləyir
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch((err) => {
      console.log("Avtomatik kilidləmə dəstəklənmədi, istifadəçi özü çevirməlidir:", err);
    });
  }

  // Canvas ölçüsünü JS daxilində yeniləyirik
  canvas.width = 500;
  canvas.height = 320;
  
  // Player-in y oxunu yeni boyuta uyğunlaşdırırıq
  player.y = 230; 

  gameLoop();
}
