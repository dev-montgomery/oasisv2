const characterSheet = (player) => {
  const container = document.querySelector(".player-details-container");
  if (!container) return;

  container.innerHTML = `
    <h2>${player.name}</h2>
    <p><strong>level:</strong> ${player.details.lvls.lvl}</p>
    <p><strong>m.level:</strong> ${player.details.lvls.mglvl}</p>
    <br>
    <p><strong>health:</strong> ${player.details.stats.health}</p>
    <p><strong>magic:</strong> ${player.details.stats.magic}</p>
    <p><strong>capacity:</strong> ${player.details.stats.capacity}</p>
    <p><strong>speed:</strong> ${player.details.stats.speed}</p>
    <br>
    <p><strong>fist:</strong> ${player.details.skills.fist}</p>
    <p><strong>sword:</strong> ${player.details.skills.sword}</p>
    <p><strong>axe:</strong> ${player.details.skills.axe}</p>
    <p><strong>blunt:</strong> ${player.details.skills.blunt}</p>
    <p><strong>distance:</strong> ${player.details.skills.distance}</p>
    <p><strong>shield:</strong> ${player.details.skills.shield}</p>
    <p><strong>fishing:</strong> ${player.details.skills.fishing}</p>
  `;
};

export { characterSheet };