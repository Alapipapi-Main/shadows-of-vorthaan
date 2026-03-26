// ── Achievement definitions ───────────────────────────────────────────────────
export const ACHIEVEMENTS = [
  // ⚔️ Combat
  { id: 'first_blood',     icon: '🗡️', title: 'First Blood',     desc: 'Defeat your first enemy',                      category: 'Combat' },
  { id: 'veteran',         icon: '⚔️', title: 'Veteran',         desc: 'Defeat 50 enemies total',                      category: 'Combat' },
  { id: 'warlord',         icon: '🏹', title: 'Warlord',          desc: 'Defeat 100 enemies total',                     category: 'Combat' },
  { id: 'untouchable',     icon: '🛡️', title: 'Untouchable',     desc: 'Win a battle without taking any damage',       category: 'Combat' },
  { id: 'flawless',        icon: '🎯', title: 'Flawless',         desc: 'Win a battle without using Defend or Flee',    category: 'Combat' },
  { id: 'boss_slayer',     icon: '👑', title: 'Boss Slayer',      desc: 'Defeat the Shadow King',                       category: 'Combat' },
  { id: 'poisoner',        icon: '🐍', title: 'Poisoner',         desc: 'Poison 10 enemies',                            category: 'Combat' },
  { id: 'pyro',            icon: '🔥', title: 'Pyromaniac',       desc: 'Burn 10 enemies',                              category: 'Combat' },

  // 🗺️ Exploration
  { id: 'explorer',        icon: '🗺️', title: 'Explorer',        desc: 'Visit all 7 locations',                        category: 'Exploration' },
  { id: 'dungeon_diver',   icon: '🕳️', title: 'Dungeon Diver',  desc: 'Visit the Sunken Dungeon',                     category: 'Exploration' },
  { id: 'shrine_seeker',   icon: '🗿', title: 'Shrine Seeker',   desc: 'Visit the Ruined Shrine of the Ancients',      category: 'Exploration' },

  // 📜 Quests
  { id: 'bounty_hunter',   icon: '📜', title: 'Bounty Hunter',   desc: 'Complete 5 quests',                            category: 'Quests' },
  { id: 'quest_master',    icon: '🏅', title: 'Quest Master',    desc: 'Complete all 20 quests',                       category: 'Quests' },

  // 🌳 Skill Tree
  { id: 'first_perk',      icon: '✨', title: 'First Step',      desc: 'Unlock your first perk',                       category: 'Skills' },
  { id: 'path_chosen',     icon: '🌿', title: 'Path Chosen',     desc: 'Unlock 5 perks',                               category: 'Skills' },
  { id: 'fully_mastered',  icon: '🌟', title: 'Fully Mastered',  desc: 'Unlock all 15 perks',                          category: 'Skills' },

  // ⚒️ Crafting
  { id: 'tinker',          icon: '⚒️', title: 'Tinker',          desc: 'Craft your first item',                        category: 'Crafting' },
  { id: 'master_crafter',  icon: '🔨', title: 'Master Crafter',  desc: 'Craft 5 items total',                          category: 'Crafting' },

  // 📖 Bestiary
  { id: 'monster_hunter',  icon: '📖', title: 'Monster Hunter',  desc: 'Encounter all 13 enemy types',                 category: 'Bestiary' },
  { id: 'exterminator',    icon: '💀', title: 'Exterminator',    desc: 'Kill at least 1 of every enemy type',          category: 'Bestiary' },

  // 💀 Difficulty
  { id: 'hardened',        icon: '💀', title: 'Hardened',         desc: 'Defeat the Shadow King on Hard difficulty',    category: 'Difficulty' },
  { id: 'speed_runner',    icon: '⚡', title: 'Speed Runner',     desc: 'Defeat the Shadow King below level 8',         category: 'Difficulty' },
];

const ACH_KEY = 'vorhaan_achievements';
const BESTIARY_KEY = 'vorhaan_bestiary';

// ── Persistence helpers ───────────────────────────────────────────────────────
export function readAchievements() {
  try {
    const raw = localStorage.getItem(ACH_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function writeAchievements(data) {
  try { localStorage.setItem(ACH_KEY, JSON.stringify(data)); } catch {}
}

export function readBestiary() {
  try {
    const raw = localStorage.getItem(BESTIARY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function writeBestiary(data) {
  try { localStorage.setItem(BESTIARY_KEY, JSON.stringify(data)); } catch {}
}

// Record an enemy encounter in the bestiary
export function recordBestiaryKill(enemyId) {
  const data = readBestiary();
  const entry = data[enemyId] || { kills: 0, firstSeen: null };
  data[enemyId] = {
    kills: entry.kills + 1,
    firstSeen: entry.firstSeen || new Date().toISOString(),
  };
  writeBestiary(data);
  return data;
}

export function recordBestiaryEncounter(enemyId) {
  const data = readBestiary();
  if (!data[enemyId]) {
    data[enemyId] = { kills: 0, firstSeen: new Date().toISOString() };
    writeBestiary(data);
  }
  return data;
}
