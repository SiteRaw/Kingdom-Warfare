createUnits();
updateUnitStatsPanel();

// Create the 6x8 grid
for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 6; x++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.dataset.x = x;
        tile.dataset.y = y;
        gameBoard.appendChild(tile);
    }
}

// Place units on the board
function placeUnits() {
    playerUnits.forEach(unit => {
        const tile = document.querySelector(`.tile[data-x="${unit.x}"][data-y="${unit.y}"]`);
        const unitDiv = document.createElement('div');
        unitDiv.classList.add('unit', 'player-unit', 'unit' + unit.type);
        unitDiv.dataset.team = 'player';
        tile.appendChild(unitDiv);
        unit.div = unitDiv; // Link Unit object to its DOM element
        unitDiv.unit = unit; // Link DOM element to its Unit object
    });
    aiUnits.forEach(unit => {
        const tile = document.querySelector(`.tile[data-x="${unit.x}"][data-y="${unit.y}"]`);
        const unitDiv = document.createElement('div');
        unitDiv.classList.add('unit', 'ai-unit', 'unit' + unit.type);
        unitDiv.dataset.team = 'ai';
        tile.appendChild(unitDiv);
        unit.div = unitDiv; // Link Unit object to its DOM element
        unitDiv.unit = unit; // Link DOM element to its Unit object
    });
}

// Check if tile is empty
function isEmpty(x, y) {
    return !playerUnits.some(u => u.x === x && u.y === y) && !aiUnits.some(u => u.x === x && u.y === y);
}

function getMovementRange(unit, a = false) {
    const range = [];

    function isObstacle(x, y) {
        // Define obstacles; this could be a predefined array or a check in a grid
        return obstacles.some(obstacle => obstacle.x === x && obstacle.y === y);
    }

    for (let x = 0; x < 6; x++) {
        for (let y = 0; y < 8; y++) {
            if (!isObstacle(x, y)) { // Ensure this tile is not an obstacle
                if (Math.abs(x - unit.x) + Math.abs(y - unit.y) == unit.mov + 1 &&
                    (x !== unit.x || y !== unit.y) &&
                    isEmpty(x, y) && a == true) {
                    range.push({
                        x,
                        y
                    });
                } else if (Math.abs(x - unit.x) + Math.abs(y - unit.y) <= unit.mov &&
                    (x !== unit.x || y !== unit.y) &&
                    isEmpty(x, y) && a == false) {
                    range.push({
                        x,
                        y
                    });
                }
            }
        }
    }

    return range;
}

// Get attackable enemies
function getAttackableEnemies(unit) {
    const movementRange = getMovementRange(unit);
    const possiblePositions = [...movementRange, {
        x: unit.x,
        y: unit.y
    }];
    const attackable = new Set();
    possiblePositions.forEach(pos => {
        aiUnits.forEach(enemy => {
            if (Math.abs(pos.x - enemy.x) + Math.abs(pos.y - enemy.y) <= 1) {
                attackable.add(enemy);
            }
        });
    });
    return Array.from(attackable);
}

// Highlight movement range
function highlightMovementRange(unit) {
    const range = getMovementRange(unit);
    range.forEach(pos => {
        const tile = document.querySelector(`.tile[data-x="${pos.x}"][data-y="${pos.y}"]`);
        tile.classList.add('movement-range');
    });

    const arange = getMovementRange(unit, true);
    arange.forEach(pos => {
        const tile = document.querySelector(`.tile[data-x="${pos.x}"][data-y="${pos.y}"]`);
        tile.classList.add('atk-range');
    });
}

// Highlight movement range
function highlightEnemyRange(unit) {
    const range = getMovementRange(unit);
    range.forEach(pos => {
        const tile = document.querySelector(`.tile[data-x="${pos.x}"][data-y="${pos.y}"]`);
        tile.classList.add('atk-range');
    });

    const arange = getMovementRange(unit, true);
    arange.forEach(pos => {
        const tile = document.querySelector(`.tile[data-x="${pos.x}"][data-y="${pos.y}"]`);
        tile.classList.add('atk-range');
    });
}

// Highlight attackable enemies
function highlightAttackableEnemies(unit) {
    const enemies = getAttackableEnemies(unit);
    enemies.forEach(enemy => {
        enemy.div.classList.add('attack-range');
    });
}

// Show unit info panel
function showInfoPanel(unit) {
    const panel = document.getElementById('info-panel');
    panel.innerHTML = `
                <h2>${unit.name}</h2>
                <p>HP: ${unit.hp}/${unit.wnd}</p>
                <p>Attacks: ${unit.attack}</p>
                <p>Skill: ${unit.skill}</p>
                <p>Strength: ${unit.str}</p>
                <p>Def: ${unit.def}</p>
                <p>Special: ${unit.spe}</p>
                <p>Move: ${unit.mov}</p>
                <h5><br/>Turn: ${gameTurn}</h5>
            `;
    panel.style.display = 'block';
}

// Hide info panel and remove highlights
function hideInfoPanel() {
    document.getElementById('info-panel').style.display = 'none';
    document.querySelectorAll('.movement-range').forEach(tile => tile.classList.remove('movement-range'));
    document.querySelectorAll('.atk-range').forEach(unit => unit.classList.remove('atk-range'));
    document.querySelectorAll('.attack-range').forEach(unit => unit.classList.remove('attack-range'));
}

// Select unit
function selectUnit(unitDiv, pl = true) {
    if (pl) {
        if (unitDiv.unit.activated) return;
        deselectUnit();
        selectedUnit = unitDiv;
        const unit = unitDiv.unit;
        highlightMovementRange(unit);
        highlightAttackableEnemies(unit);
        showInfoPanel(unit);
    } else {
        const unit = unitDiv.unit;
        highlightEnemyRange(unit);
        showInfoPanel(unit);
    }
}

// Deselect unit
function deselectUnit() {
    hideInfoPanel();
    selectedUnit = null;
}

// Move unit
function moveUnit(unitDiv, x, y) {
    const unit = unitDiv.unit;
    const oldTile = document.querySelector(`.tile[data-x="${unit.x}"][data-y="${unit.y}"]`);
    const newTile = document.querySelector(`.tile[data-x="${x}"][data-y="${y}"]`);
    oldTile.removeChild(unitDiv);
    newTile.appendChild(unitDiv);
    unit.x = x;
    unit.y = y;
    unit.activated = true;
    newTile.classList.add('unit-act');
    deselectUnit();
    checkTurnEnd();
}

// Get possible attack positions
function getPossibleAttackPositions(unit, enemy) {
    const movementRange = getMovementRange(unit);
    const possiblePositions = [...movementRange, {
        x: unit.x,
        y: unit.y
    }];
    return possiblePositions.filter(pos => Math.abs(pos.x - enemy.x) + Math.abs(pos.y - enemy.y) <= 1);
}

// Attack enemy
function attackEnemy(unitDiv, enemyDiv) {
    const unit = unitDiv.unit;
    const enemy = enemyDiv.unit;
    const possibleTs = getPossibleAttackPositions(unit, enemy);
    if (possibleTs.length > 0) {
        const T = possibleTs[0];
        if (T.x !== unit.x || T.y !== unit.y) {
            const oldTile = document.querySelector(`.tile[data-x="${unit.x}"][data-y="${unit.y}"]`);
            const newTile = document.querySelector(`.tile[data-x="${T.x}"][data-y="${T.y}"]`);
            oldTile.removeChild(unitDiv);
            newTile.appendChild(unitDiv);
            unit.x = T.x;
            unit.y = T.y;
        }
        performAttack(unit, enemy);
        unit.activated = true;
        document.querySelector(`.tile[data-x="${unit.x}"][data-y="${unit.y}"]`).classList.add('unit-act');
        deselectUnit();
        checkTurnEnd();
    }
}

// Perform attack
function performAttack(attacker, defender) {
    const attackDice = attacker.attack;
    const hitThreshold = Math.max(2, Math.min(6, 4 - attacker.skill + defender.skill));
    const hasCrit = attacker.spe === 1 ? 1 : 0;
    const hitRolls = [];
    for (let i = 0; i < attackDice; i++) {
        hitRolls.push(Math.floor(Math.random() * 6) + 1);
    }

    let hitCount = 0;
    hitRolls.forEach(roll => {
        if (roll >= hitThreshold) {
            hitCount++;
            if (hasCrit && roll === 6) {
                hitCount++;
            }
        }
    });

    // Round 2: To Wound
    const woundDice = hitCount;
    const woundThreshold = Math.max(2, Math.min(6, 4 - attacker.str + defender.def));
    const hasLeth = attacker.spe === 2 ? 1 : 0;
    const woundRolls = [];
    for (let i = 0; i < woundDice; i++) {
        woundRolls.push(Math.floor(Math.random() * 6) + 1);
    }

    let woundCount = 0;
    woundRolls.forEach(roll => {
        if (roll >= woundThreshold) {
            woundCount++;
            if (hasLeth && roll === 6) {
                woundCount++;
            }
        }
    });

    // Display To Wound round
    const woundDiv = createRoundDiv(attacker.name, defender.name, hitRolls, woundRolls, hitThreshold, woundThreshold, hitCount, woundCount, attackDice, defender.hp, attacker.team);

    resultsDiv.appendChild(woundDiv);

    defender.hp -= woundCount;
    if (defender.hp <= 0) {
        removeUnit(defender);
    }
}

// Remove unit
function removeUnit(unit) {
    const tile = document.querySelector(`.tile[data-x="${unit.x}"][data-y="${unit.y}"]`);
    tile.removeChild(unit.div);
    if (unit.team === 'player') {
        playerUnits = playerUnits.filter(u => u !== unit);
    } else {
        aiUnits = aiUnits.filter(u => u !== unit);
    }
    checkGameEnd();
}

// Check game end
function checkGameEnd() {
    if (playerUnits.length === 0) {
        alert('AI wins!');
        resetGame();
    } else if (aiUnits.length === 0) {
        changeQuest();
        toggleQuest();
        //alert('Player wins!');
        //resetGame();
    }
}

// Check turn end
function checkTurnEnd() {
    updateUnitStatsPanel();
    if (playerUnits.every(unit => unit.activated)) {
        endTurn();
    }
}

// End turn
function endTurn() {
    if (currentTurn === 'player') {
        currentTurn = 'ai';
        aiTurn();
    } else {
        currentTurn = 'player';
        updateUnitStatsPanel();
        playerUnits.forEach(unit => {
            unit.activated = false;
            document.querySelector(`.tile[data-x="${unit.x}"][data-y="${unit.y}"]`).classList.remove('unit-act');
        });
        aiUnits.forEach(unit => unit.activated = false);
        gameTurn++;
    }
}
