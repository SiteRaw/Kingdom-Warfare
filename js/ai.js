// AI turn
function aiTurn() {
    aiUnits.forEach(aiUnit => {
        if (!aiUnit.activated) {
            const target = findClosestPlayerUnit(aiUnit);
            if (target) {
                const moveTo = getMoveTowards(aiUnit, target);
                if (moveTo) {
                    const oldTile = document.querySelector(`.tile[data-x="${aiUnit.x}"][data-y="${aiUnit.y}"]`);
                    const newTile = document.querySelector(`.tile[data-x="${moveTo.x}"][data-y="${moveTo.y}"]`);
                    oldTile.removeChild(aiUnit.div);
                    newTile.appendChild(aiUnit.div);
                    aiUnit.x = moveTo.x;
                    aiUnit.y = moveTo.y;
                    const distance = Math.abs(aiUnit.x - target.x) + Math.abs(aiUnit.y - target.y);
                    if (distance <= 1) {
                        performAttack(aiUnit, target);
                    }
                    aiUnit.activated = true;
                }
            }
        }
    });
    setTimeout(() => {
        endTurn();
    }, 1000);
}

// Find closest player unit
function findClosestPlayerUnit(aiUnit) {
    let closest = null;
    let minDistance = Infinity;
    playerUnits.forEach(playerUnit => {
        const distance = Math.abs(aiUnit.x - playerUnit.x) + Math.abs(aiUnit.y - playerUnit.y);
        if (distance < minDistance) {
            minDistance = distance;
            closest = playerUnit;
        }
    });
    return closest;
}

// Get move towards target
function getMoveTowards(aiUnit, target) {
    const movementRange = getMovementRange(aiUnit);
    if (movementRange.length === 0) return null;
    let bestMove = movementRange[0];
    let minDistance = Math.abs(bestMove.x - target.x) + Math.abs(bestMove.y - target.y);
    movementRange.forEach(pos => {
        const distance = Math.abs(pos.x - target.x) + Math.abs(pos.y - target.y);
        if (distance < minDistance) {
            minDistance = distance;
            bestMove = pos;
        }
    });
    return bestMove;
}
