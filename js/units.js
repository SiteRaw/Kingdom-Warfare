class Unit {
    constructor(x, y, team, name, hp, attack, mov, skl, str, def, type, spe) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.name = name;
        this.hp = hp;
        this.attack = attack;
        this.activated = false;
        this.div = null;

        // Dynamic stats from CSV
        this.mov = mov;
        this.skill = skl;
        this.str = str;
        this.def = def;
        this.atk = attack;
        this.type = type;
        this.wnd = hp;
        this.spe = spe; // [none, crit, lethal, demon]
    }
}

function parseCSV() {
    const csvData = document.getElementById('unit_csv').textContent.trim();
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    const units = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const unitData = {};

        for (let j = 0; j < headers.length; j++) {
            unitData[headers[j]] = values[j].trim();
        }

        units.push(unitData);
    }

    return units;
}

function parseObstacles() {
    const csvText = document.getElementById("obst_csv").innerText.trim();
    return csvText.split(" ").map(pair => {
        const [x, y] = pair.split(",").map(Number);
        return {
            x,
            y
        };
    });
}

let playerUnits = [];
let aiUnits = [];
const obstacles = parseObstacles();

function createUnits() {
    playerUnits.length = 0;
    aiUnits.length = 0;

    const csvUnits = parseCSV();

    csvUnits.forEach(unitData => {
        const team = unitData.team === '0' ? 'player' : 'ai';
        const unit = new Unit(
            parseInt(unitData.x),
            parseInt(unitData.y),
            team,
            unitData.Name,
            parseInt(unitData.wnd),
            parseInt(unitData.atk),
            parseInt(unitData.mov),
            parseInt(unitData.skl),
            parseInt(unitData.str),
            parseInt(unitData.def),
            parseInt(unitData.type),
            parseInt(unitData.spe)
        );

        if (team === 'player') {
            playerUnits.push(unit);
        } else {
            aiUnits.push(unit);
        }
    });
}

function updateUnitStatsPanel() {
    const statsPanel = document.getElementById('unit_stats');
    statsPanel.innerHTML = ''; // Clear existing content

    // Create container for all units
    const unitsContainer = document.createElement('div');
    unitsContainer.className = 'units-container';

    // Add player units first
    playerUnits.forEach(unit => {
        unitsContainer.appendChild(createUnitCard(unit));
    });

    // Add AI units
    aiUnits.forEach(unit => {
        unitsContainer.appendChild(createUnitCard(unit));
    });

    statsPanel.appendChild(unitsContainer);
}

function createUnitCard(unit) {
    const card = document.createElement('div');
    card.className = `unit-card ${unit.team}`;

    // Create header with portrait and name
    const header = document.createElement('div');
    header.className = 'unit-header';

    const portrait = document.createElement('div');
    portrait.className = 'unit-portrait';
    portrait.textContent = unit.name.charAt(0); // Simple "portrait" using first letter
    header.appendChild(portrait);

    const name = document.createElement('div');
    name.className = 'unit-name';
    name.textContent = unit.name;
    header.appendChild(name);

    card.appendChild(header);

    // Create HP bar
    const hpBar = document.createElement('div');
    hpBar.className = 'hp-bar';
    const hpFill = document.createElement('div');
    hpFill.className = 'hp-fill';
    hpFill.style.width = `${(unit.hp / unit.wnd) * 100}%`;
    hpBar.appendChild(hpFill);
    card.appendChild(hpBar);

    // Add HP text
    const hpText = document.createElement('div');
    hpText.textContent = `HP: ${unit.hp}/${unit.wnd}`;
    hpText.style.margin = '5px 0';
    hpText.style.fontWeight = 'bold';
    card.appendChild(hpText);

    // Create stats grid
    const statsGrid = document.createElement('div');
    statsGrid.className = 'unit-stats';

    // Add all stats
    const statsToShow = [
        { name: 'MOV', value: unit.mov },
        { name: 'SKL', value: unit.skill },
        { name: 'STR', value: unit.str },
        { name: 'DEF', value: unit.def },
        { name: 'ATK', value: unit.atk },
        { name: 'SPE', value: unit.spe }
    ];

    statsToShow.forEach(stat => {
        const statRow = document.createElement('div');
        statRow.className = 'stat-row';

        const statName = document.createElement('span');
        statName.className = 'stat-name';
        statName.textContent = stat.name;

        const statValue = document.createElement('span');
        statValue.textContent = stat.value;

        statRow.appendChild(statName);
        statRow.appendChild(statValue);
        statsGrid.appendChild(statRow);
    });

    card.appendChild(statsGrid);

    return card;
}
