export const characterSheet = (player) => {
  const container = document.querySelector(".player-details-container");
  if (!container) return;

  const currOffense = player.details.equipped.mainhand;
  const currDefense = player.details.equipped.offhand;
  
  container.innerHTML = `
    <div class="player-details-container-border noselect">
      <h2>${player.name}</h2>
      
      <p><strong>Level:</strong> ${player.details.lvls.lvl}</p>
      <p><strong>Magic Level:</strong> ${player.details.lvls.mglvl}</p>
      <br>
      <p><strong>Health:</strong> ${player.details.stats.health}</p>
      <p><strong>Magic:</strong> ${player.details.stats.magic}</p>
      <p><strong>Capacity:</strong> ${player.details.stats.capacity}</p>
      <br>
      <p><strong>Fishing:</strong> ${player.details.skills.fishing}</p>
      <p>
        <strong>
          ${typeof currOffense === 'object' ? currOffense.name.charAt(0).toUpperCase() + currOffense.name.slice(1) + ':' : ''} 
        </strong> ${typeof currOffense === 'object' ? player.details.skills[currOffense.name] : ''}
      </p>
      <p>
        <strong>
          ${typeof currDefense === 'object' ? 'Defense:' : ''} 
        </strong> ${typeof currDefense === 'object' ? player.details.skills.shield : ''}
      </p>
    </div>
  `;
};