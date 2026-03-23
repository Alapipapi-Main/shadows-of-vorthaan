import { RECIPES } from './gameData';
import styles from './CraftingModal.module.css';

export default function CraftingModal({ player, onCraft, onClose }) {
  const inventory = player.inventory;

  // Count how many of each material the player has
  const materialCount = (id) => inventory.filter(i => i.id === id).length;

  // Check if player can afford a recipe
  const canCraft = (recipe) =>
    recipe.materials.every(m => materialCount(m.id) >= m.qty);

  // Check if player already owns a passive (non-stackable)
  const hasPassive = (recipeId) =>
    inventory.some(i => i.id === recipeId && i.type === 'passive');

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>⚒️ Gregor's Forge</h2>
          <div className={styles.subtitle}>Combine materials to craft powerful items</div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.recipes}>
          {RECIPES.map(recipe => {
            const craftable = canCraft(recipe);
            const owned     = hasPassive(recipe.result.id);
            const disabled  = !craftable || owned;
            return (
              <div key={recipe.id} className={`${styles.recipe} ${craftable && !owned ? styles.available : ''}`}>
                <div className={styles.recipeLeft}>
                  <span className={styles.recipeIcon}>{recipe.icon}</span>
                  <div>
                    <div className={styles.recipeName}>{recipe.name}</div>
                    <div className={styles.recipeDesc}>{recipe.description}</div>
                    <div className={styles.materials}>
                      {recipe.materials.map(m => {
                        const have = materialCount(m.id);
                        const enough = have >= m.qty;
                        return (
                          <span
                            key={m.id}
                            className={`${styles.material} ${enough ? styles.matOk : styles.matMissing}`}
                          >
                            {m.icon} {m.name} {have}/{m.qty}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <button
                  className={`${styles.craftBtn} ${disabled ? styles.craftDisabled : ''}`}
                  onClick={() => !disabled && onCraft(recipe)}
                  disabled={disabled}
                >
                  {owned ? '✓ Owned' : craftable ? 'Craft' : 'Missing'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
