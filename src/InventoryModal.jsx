import styles from './InventoryModal.module.css';

export default function InventoryModal({ player, onUse, onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>🎒 Inventory</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Equipment</h3>
            <div className={styles.equipRow}>
              <div className={styles.equip}>
                <span>{player.weapon.icon}</span>
                <div>
                  <div className={styles.equipName}>{player.weapon.name}</div>
                  <div className={styles.equipStat}>+{player.weapon.atk} ATK</div>
                </div>
              </div>
              <div className={styles.equip}>
                <span>{player.armor.icon}</span>
                <div>
                  <div className={styles.equipName}>{player.armor.name}</div>
                  <div className={styles.equipStat}>+{player.armor.def} DEF</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Items ({player.inventory.length})</h3>
            {player.inventory.length === 0 && (
              <p className={styles.empty}>Your bag is empty.</p>
            )}
            <div className={styles.items}>
              {player.inventory.map((item, idx) => (
                <div key={idx} className={styles.item}>
                  <span className={styles.itemIcon}>{item.icon}</span>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemDesc}>{item.description}</div>
                  </div>
                  <button className={styles.useBtn} onClick={() => { onUse(item); onClose(); }}>
                    Use
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Character Stats</h3>
            <div className={styles.statsGrid}>
              <div className={styles.stat}><span>Level</span><span>{player.level}</span></div>
              <div className={styles.stat}><span>HP</span><span>{player.hp}/{player.maxHp}</span></div>
              <div className={styles.stat}><span>ATK</span><span>{player.atk} (+{player.weapon.atk})</span></div>
              <div className={styles.stat}><span>DEF</span><span>{player.def} (+{player.armor.def})</span></div>
              <div className={styles.stat}><span>Gold</span><span>💰 {player.gold}</span></div>
              <div className={styles.stat}><span>Kills</span><span>⚔️ {player.totalKills}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
