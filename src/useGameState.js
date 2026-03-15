import { useState, useCallback } from 'react';
import { ENEMIES, LOCATIONS, WEAPONS, ARMORS, INITIAL_PLAYER, getXpToNext, getLevelStats } from './gameData';

export function useGameState() {
  const [player, setPlayer] = useState(() => JSON.parse(JSON.stringify(INITIAL_PLAYER)));
  const [screen, setScreen] = useState('title'); // title | explore | battle | shop | inventory | gameover | victory
  const [battleState, setBattleState] = useState(null);
  const [log, setLog] = useState([]);
  const [notification, setNotification] = useState(null);

  const addLog = useCallback((msg, type = 'normal') => {
    setLog(prev => [...prev.slice(-40), { msg, type, id: Date.now() + Math.random() }]);
  }, []);

  const notify = useCallback((msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 2500);
  }, []);

  const travel = useCallback((locationId) => {
    setPlayer(p => ({ ...p, location: locationId }));
    addLog(`You travel to ${LOCATIONS[locationId].name}.`, 'travel');
    setScreen('explore');
  }, [addLog]);

  const startBattle = useCallback((enemyId) => {
    const enemy = JSON.parse(JSON.stringify(ENEMIES[enemyId]));
    setBattleState({ enemy, turn: 'player', buffs: { atk: 0 }, round: 1 });
    setScreen('battle');
    addLog(`⚔️ A ${enemy.name} appears!`, 'danger');
  }, [addLog]);

  const playerAttack = useCallback(() => {
    if (!battleState || battleState.turn !== 'player') return;
    const atk = player.atk + player.weapon.atk + battleState.buffs.atk;
    const dmg = Math.max(1, atk - battleState.enemy.def + Math.floor(Math.random() * 6) - 2);
    const isCrit = Math.random() < 0.15;
    const finalDmg = isCrit ? Math.floor(dmg * 1.75) : dmg;

    addLog(`${isCrit ? '💥 Critical! ' : ''}You deal ${finalDmg} damage to ${battleState.enemy.name}.`, isCrit ? 'crit' : 'player');

    setBattleState(prev => {
      const newHp = Math.max(0, prev.enemy.hp - finalDmg);
      const updatedEnemy = { ...prev.enemy, hp: newHp };
      if (newHp <= 0) {
        return { ...prev, enemy: updatedEnemy, turn: 'resolved' };
      }
      return { ...prev, enemy: updatedEnemy, turn: 'enemy' };
    });
  }, [battleState, player, addLog]);

  const playerDefend = useCallback(() => {
    if (!battleState || battleState.turn !== 'player') return;
    addLog(`🛡️ You take a defensive stance, reducing incoming damage.`, 'player');
    setBattleState(prev => ({ ...prev, turn: 'enemy_defend', defendBonus: 10 }));
  }, [battleState, addLog]);

  const useItem = useCallback((item, inBattle = false) => {
    setPlayer(p => {
      const inv = p.inventory.filter((_, i) => p.inventory.indexOf(item) !== i || (p.inventory.slice(0, i).filter(x => x.id === item.id).length > 0));
      const idx = p.inventory.findIndex(x => x.id === item.id);
      const newInv = [...p.inventory];
      newInv.splice(idx, 1);
      let newHp = p.hp;
      let newAtk = p.atk;
      if (item.effect === 'heal') {
        newHp = Math.min(p.maxHp, p.hp + item.value);
        addLog(`💊 You use ${item.name} and restore ${Math.min(item.value, p.maxHp - p.hp)} HP.`, 'heal');
      }
      return { ...p, hp: newHp, inventory: newInv };
    });
    if (inBattle && item.effect === 'buff') {
      setBattleState(prev => prev ? { ...prev, buffs: { ...prev.buffs, atk: prev.buffs.atk + item.value } } : prev);
      addLog(`✨ You use ${item.name}! ATK +${item.value} for this battle.`, 'buff');
    }
    if (inBattle && item.effect === 'heal') {
      setBattleState(prev => prev ? { ...prev, turn: 'enemy' } : prev);
    }
  }, [addLog]);

  const enemyAttack = useCallback(() => {
    if (!battleState) return;
    const isDefending = battleState.turn === 'enemy_defend';
    const bonus = isDefending ? (battleState.defendBonus || 0) : 0;
    const def = player.def + player.armor.def + bonus;
    const dmg = Math.max(1, battleState.enemy.atk - def + Math.floor(Math.random() * 6) - 2);

    addLog(`${battleState.enemy.icon} ${battleState.enemy.name} attacks you for ${dmg} damage!`, 'danger');

    setPlayer(p => {
      const newHp = Math.max(0, p.hp - dmg);
      return { ...p, hp: newHp };
    });

    setBattleState(prev => ({ ...prev, turn: 'player', defendBonus: 0, round: (prev.round || 1) + 1 }));
  }, [battleState, player, addLog]);

  const resolveVictory = useCallback(() => {
    if (!battleState) return;
    const { enemy } = battleState;
    addLog(`🏆 You defeated ${enemy.name}! +${enemy.xp} XP, +${enemy.gold} Gold`, 'victory');

    setPlayer(p => {
      let newXp = p.xp + enemy.xp;
      let newLevel = p.level;
      let newMaxHp = p.maxHp;
      let newAtk = p.atk;
      let newDef = p.def;
      let leveledUp = false;

      while (newXp >= getXpToNext(newLevel)) {
        newXp -= getXpToNext(newLevel);
        newLevel++;
        const stats = getLevelStats(newLevel);
        newMaxHp = stats.maxHp;
        newAtk = stats.atk;
        newDef = stats.def;
        leveledUp = true;
      }

      if (leveledUp) {
        addLog(`⭐ Level Up! You are now Level ${newLevel}!`, 'levelup');
        notify(`Level Up! → Level ${newLevel}`, 'levelup');
      }

      const defeatedBosses = enemy.isBoss
        ? [...p.defeatedBosses, enemy.id]
        : p.defeatedBosses;

      return {
        ...p,
        xp: newXp,
        xpToNext: getXpToNext(newLevel),
        level: newLevel,
        maxHp: newMaxHp,
        hp: leveledUp ? newMaxHp : p.hp,
        atk: newAtk,
        def: newDef,
        gold: p.gold + enemy.gold,
        totalKills: p.totalKills + 1,
        defeatedBosses,
      };
    });

    setBattleState(null);

    // Check win condition
    if (enemy.id === 'shadow_king') {
      setTimeout(() => setScreen('victory'), 500);
    } else {
      setTimeout(() => setScreen('explore'), 300);
    }
  }, [battleState, addLog, notify]);

  const buyItem = useCallback((item) => {
    if (player.gold < item.price) { notify('Not enough gold!', 'error'); return; }
    if (item.type === 'weapon' || WEAPONS.find(w => w.id === item.id)) {
      setPlayer(p => ({ ...p, gold: p.gold - item.price, weapon: item }));
      notify(`Equipped ${item.name}!`, 'success');
    } else if (item.type === 'armor' || ARMORS.find(a => a.id === item.id)) {
      setPlayer(p => ({ ...p, gold: p.gold - item.price, armor: item }));
      notify(`Equipped ${item.name}!`, 'success');
    } else {
      setPlayer(p => ({ ...p, gold: p.gold - item.price, inventory: [...p.inventory, { ...item }] }));
      notify(`Bought ${item.name}!`, 'success');
    }
    addLog(`🛒 Purchased ${item.name} for ${item.price} gold.`, 'shop');
  }, [player.gold, notify, addLog]);

  const rest = useCallback(() => {
    setPlayer(p => ({ ...p, hp: p.maxHp }));
    addLog('🌙 You rest and recover all HP.', 'heal');
    notify('Fully rested!', 'success');
  }, [addLog, notify]);

  const resetGame = useCallback(() => {
    setPlayer(JSON.parse(JSON.stringify(INITIAL_PLAYER)));
    setScreen('title');
    setBattleState(null);
    setLog([]);
  }, []);

  return {
    player, screen, setScreen, battleState, log, notification,
    travel, startBattle, playerAttack, playerDefend, enemyAttack,
    resolveVictory, useItem, buyItem, rest, resetGame, addLog, notify,
  };
}
