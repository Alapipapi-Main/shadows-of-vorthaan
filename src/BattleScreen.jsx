import { useEffect, useState } from 'react';
import styles from './BattleScreen.module.css';

export default function BattleScreen({
  player, battleState, onAttack, onDefend, onFlee, onEnemyTurn, onResolveVictory, onUseItem, log,
}) {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!battleState) return;
    if (battleState.turn === 'enemy' || battleState.turn === 'enemy_defend') {
      const t = setTimeout(() => {
        onEnemyTurn();
      }, 900);
      return () => clearTimeout(t);
    }
    if (battleState.turn === 'resolved') {
      const t = setTimeout(() => {
        onResolveVictory();
      }, 700);
      return () => clearTimeout(t);
    }
  }, [battleState?.turn]);

  // Check player death
  useEffect(() => {
    if (player.hp <= 0) {
      // handled by App
    }
  }, [player.hp]);

  if (!battleState) return null;

  const { enemy } = battleState;
  const enemyHpPct = (enemy.hp / enemy.maxHp) * 100;
  const playerHpPct = (player.hp / player.maxHp) * 100;
  const isPlayerTurn = battleState.turn === 'player';
  const potions = player.inventory.filter(i => i.type === 'consumable');

  const enemyHpColor = enemyHpPct > 60 ? 'var(--hp-green)' : enemyHpPct > 30 ? 'var(--hp-yellow)' : 'var(--hp-red)';
  const playerHpColor = playerHpPct > 60 ? 'var(--hp-green)' : playerHpPct > 30 ? 'var(--hp-yellow)' : 'var(--hp-red)';

  return (
    <div className={styles.wrap}>
      {enemy.isBoss && (
        <div className={styles.bossAlert}>
          ⚠️ BOSS ENCOUNTER — {enemy.name}
        </div>
      )}

      <div className={styles.arena}>
        {/* Enemy */}
        <div className={`${styles.combatant} ${styles.enemyCombatant}`}>
          <div className={`${styles.sprite} ${battleState.turn === 'enemy' || battleState.turn === 'enemy_defend' ? styles.attacking : ''}`}>
            {enemy.icon}
          </div>
          <div className={styles.combatantName}>{enemy.name}</div>
          <div className={styles.combatantLevel}>Level {enemy.level}</div>
          <div className={styles.hpBar}>
            <div className={styles.hpFill} style={{ width: `${enemyHpPct}%`, background: enemyHpColor }} />
          </div>
          <div className={styles.hpText}>{enemy.hp} / {enemy.maxHp}</div>
        </div>

        <div className={styles.vsText}>⚔️</div>

        {/* Player */}
        <div className={`${styles.combatant} ${styles.playerCombatant}`}>
          <div className={`${styles.sprite} ${isPlayerTurn && animating ? styles.attacking : ''}`}>
            🧙
          </div>
          <div className={styles.combatantName}>{player.name}</div>
          <div className={styles.combatantLevel}>Level {player.level}</div>
          <div className={styles.hpBar}>
            <div className={styles.hpFill} style={{ width: `${playerHpPct}%`, background: playerHpColor }} />
          </div>
          <div className={styles.hpText}>{player.hp} / {player.maxHp}</div>
          <div className={styles.statsRow}>
            <span>⚔️ {player.atk + player.weapon.atk + (battleState.buffs?.atk || 0)}</span>
            <span>🛡️ {player.def + player.armor.def}</span>
          </div>
        </div>
      </div>

      {/* Battle Log */}
      <div className={styles.battleLog}>
        {[...log].slice(-6).reverse().map(entry => (
          <div key={entry.id} className={`${styles.logEntry} ${styles[entry.type] || ''}`}>
            {entry.msg}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <div className={styles.turnIndicator}>
          {isPlayerTurn ? '⚡ Your Turn' : '⏳ Enemy Turn...'}
        </div>

        <div className={styles.buttons}>
          <button
            className={`${styles.btn} ${styles.attackBtn}`}
            onClick={onAttack}
            disabled={!isPlayerTurn}
          >
            ⚔️ Attack
          </button>
          <button
            className={`${styles.btn} ${styles.defendBtn}`}
            onClick={onDefend}
            disabled={!isPlayerTurn}
          >
            🛡️ Defend
          </button>

          {potions.length > 0 && (
            <button
              className={`${styles.btn} ${styles.itemBtn}`}
              onClick={() => onUseItem(potions[0], true)}
              disabled={!isPlayerTurn}
            >
              {potions[0].icon} {potions[0].name}
            </button>
          )}

          <button
            className={`${styles.btn} ${styles.fleeBtn}`}
            onClick={onFlee}
            disabled={!isPlayerTurn}
          >
            💨 Flee
          </button>
        </div>
      </div>
    </div>
  );
}
