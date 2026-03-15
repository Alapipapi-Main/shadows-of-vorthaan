import { WEAPONS, ARMORS, SHOP_ITEMS } from './gameData';
import styles from './ShopScreen.module.css';

export default function ShopScreen({ player, onBuy, onClose }) {
  const allItems = [
    ...WEAPONS.slice(1).map(w => ({ ...w, category: 'Weapons', type: 'weapon' })),
    ...ARMORS.slice(1).map(a => ({ ...a, category: 'Armor', type: 'armor' })),
    ...SHOP_ITEMS.map(i => ({ ...i, category: 'Consumables' })),
  ];

  const grouped = allItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const isOwned = (item) => {
    if (item.type === 'weapon') return player.weapon.id === item.id;
    if (item.type === 'armor') return player.armor.id === item.id;
    return false;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>🛒 Shop</h2>
          <div className={styles.gold}>💰 {player.gold} Gold</div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.content}>
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className={styles.category}>
              <h3 className={styles.categoryTitle}>{category}</h3>
              <div className={styles.items}>
                {items.map(item => {
                  const owned = isOwned(item);
                  const canAfford = player.gold >= item.price;
                  return (
                    <div key={item.id} className={`${styles.item} ${owned ? styles.owned : ''}`}>
                      <span className={styles.itemIcon}>{item.icon}</span>
                      <div className={styles.itemInfo}>
                        <div className={styles.itemName}>{item.name}</div>
                        <div className={styles.itemDesc}>{item.description}</div>
                      </div>
                      <div className={styles.itemRight}>
                        <div className={styles.itemPrice}>{item.price}g</div>
                        {owned ? (
                          <span className={styles.equippedTag}>Equipped</span>
                        ) : (
                          <button
                            className={styles.buyBtn}
                            onClick={() => onBuy(item)}
                            disabled={!canAfford}
                          >
                            Buy
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
