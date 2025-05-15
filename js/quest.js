// Reset game
function resetGame() {
    createUnits();
    document.querySelectorAll('.unit').forEach(unit => unit.remove());
    placeUnits();
    currentTurn = 'player';
    deselectUnit();
}

// Event listeners
gameBoard.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('unit') && currentTurn === 'player') {
        const team = target.dataset.team;
        if (team === 'player') {
            if (selectedUnit === target) {
                deselectUnit();
            } else {
                selectUnit(target);
            }
        } else if (team === 'ai' && selectedUnit) {
            if (target.classList.contains('attack-range')) {
                attackEnemy(selectedUnit, target);
            } else {
                deselectUnit();
                selectUnit(target, false);
            }

        } else if (team === 'ai' && !selectedUnit) {
            deselectUnit();
            selectUnit(target, false);
        }
    } else if (target.classList.contains('tile') && selectedUnit) {
        const x = parseInt(target.dataset.x);
        const y = parseInt(target.dataset.y);
        if (target.classList.contains('movement-range')) {
            moveUnit(selectedUnit, x, y);
        } else {
            deselectUnit();
        }
    } else {
        deselectUnit();
    }
});

document.getElementById('end-turn').addEventListener('click', () => {
    if (currentTurn === 'player') {
        endTurn();
    }
});

function cleanLog() {
    document.getElementById('results').innerHTML = '';
}

function createRoundDiv(attacker, defender, hitRolls, woundRolls, hitThreshold, woundThreshold, hitCount, woundCount, attackDice, hp, team) {
    const roundDiv = document.createElement('div');
    roundDiv.className = 'unit-card ' + team;

    const roundTitle = document.createElement('div');
    roundTitle.className = 'unit-name';
    roundTitle.textContent = attacker + ' vs ' + defender;
    roundDiv.appendChild(roundTitle);

    const diceContainer = document.createElement('div');
    diceContainer.className = 'dice-container';

    const stats = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0
    };
    hitRolls.forEach(roll => {
        stats[roll]++;

        const diceElement = document.createElement('div');
        diceElement.className = 'dice';

        // Determine if this die passed
        const passed = roll >= hitThreshold;
        if (passed) {
            diceElement.classList.add('passed');
        } else {
            diceElement.classList.add('failed');
        }

        // Position the sprite
        let x, y;
        if (roll <= 3) {
            x = (roll - 1) * (357 / 9);
            y = 0;
        } else {
            x = (roll - 4) * (357 / 9);
            y = 135 / 3;
        }
        diceElement.style.backgroundPosition = `-${x}px -${y}px`;
        diceContainer.appendChild(diceElement);
    });
    const breakDiv = document.createElement("div");
    breakDiv.style.flexBasis = "100%";
    breakDiv.className = 'stats';
    breakDiv.innerHTML = "To Wound (" + woundThreshold + "+):";
    diceContainer.appendChild(breakDiv);


    const wstats = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0
    };
    woundRolls.forEach(roll => {
        wstats[roll]++;

        const diceElement = document.createElement('div');
        diceElement.className = 'dice';

        // Determine if this die passed
        const passed = roll >= woundThreshold;
        if (passed) {
            diceElement.classList.add('passed');
        } else {
            diceElement.classList.add('failed');
        }

        // Position the sprite
        let x, y;
        if (roll <= 3) {
            x = (roll - 1) * (357 / 9);
            y = 0;
        } else {
            x = (roll - 4) * (357 / 9);
            y = 135 / 3;
        }
        diceElement.style.backgroundPosition = `-${x}px -${y}px`;
        diceContainer.appendChild(diceElement);
    });

    // Stats
    const statsDiv = document.createElement('div');
    statsDiv.className = 'stats';
    const passedText = `To Hit (${hitThreshold}+):`;
    const passedSpan = document.createElement('span');
    passedSpan.textContent = passedText;
    statsDiv.appendChild(passedSpan);

    roundDiv.appendChild(statsDiv);
    roundDiv.appendChild(diceContainer);
    return roundDiv;
}

function toggleQuest() {
    const questText = document.getElementById("questContainer");
    if (questText.style.display === "none") {
        questText.style.display = "block";
    } else {
        questText.style.display = "none";
    }
}

function changeQuest() {
    let nextL = (gameLvl === maxLvl) ? 'https://www.siteraw.com/kingdom' : 'https://www.siteraw.com/kingdom/'+(gameLvl+1);
    document.getElementById("questHeader").innerHTML = '<span>Victory!</span>';
    document.getElementById("questText").innerHTML = '<p>You won! Proceed to <a href="'+nextL+'">the next level</a>.</p>';
}
