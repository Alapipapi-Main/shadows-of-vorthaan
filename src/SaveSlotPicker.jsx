import { useState } from 'react';
import { getAllSlots } from './useGameState';
import styles from './SaveSlotPicker.module.css';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function SaveSlotPicker({ mode, onSelect, onErase, onClose }) {
  const [slots, setSlots] = useState(() => getAllSlots());
  const [confirmErase, setConfirmErase] = useState(null);

  const refreshSlots = () => setSlots(getAllSlots());

  const handleSlotClick = (slot) => {
    if (mode === 'new' && !slot.empty) {
      setConfirmErase({ slot: slot.slot, reason: 'overwrite' });
    } else {
      onSelect(slot.slot);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {mode === 'load' ? '▶ Continue Adventure' : '⚔️ New Game — Choose Slot'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.slots}>
          {slots.map(slot => (
            <div key={slot.slot} className={`${styles.slot} ${slot.empty ? styles.empty : styles.occupied}`}>
              <button
                className={styles.slotMain}
                onClick={() => handleSlotClick(slot)}
                disabled={mode === 'load' && slot.empty}
              >
                <div className={styles.slotLabel}>Slot {slot.slot}</div>

                {slot.empty ? (
                  <div className={styles.emptyText}>
                    {mode === 'new' ? '+ New Game' : 'Empty'}
                  </div>
                ) : (
                  <div className={styles.slotInfo}>
                    <div className={styles.slotName}>
                      {slot.player.weapon.icon} {slot.player.name}
                    </div>
                    <div className={styles.slotStats}>
                      <span>Lv.{slot.player.level}</span>
                      <span>⚔️ {slot.player.totalKills} kills</span>
                      <span>💰 {slot.player.gold}g</span>
                    </div>
                    <div className={styles.slotLocation}>
                      📍 {slot.player.location.replace(/_/g, ' ')}
                    </div>
                    <div className={styles.slotDate}>💾 {formatDate(slot.savedAt)}</div>
                  </div>
                )}
              </button>

              {!slot.empty && (
                <button
                  className={styles.eraseBtn}
                  onClick={() => setConfirmErase({ slot: slot.slot, reason: 'delete' })}
                  title="Erase this save"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>

        {confirmErase && (
          <div className={styles.confirmOverlay}>
            <div className={styles.confirmBox}>
              <p className={styles.confirmText}>
                {confirmErase.reason === 'overwrite'
                  ? `⚠️ Slot ${confirmErase.slot} already has save data. Starting here will erase it. Continue?`
                  : `⚠️ Permanently delete Slot ${confirmErase.slot}? This cannot be undone.`}
              </p>
              <div className={styles.confirmBtns}>
                <button
                  className={styles.confirmYes}
                  onClick={() => {
                    if (confirmErase.reason === 'overwrite') {
                      onSelect(confirmErase.slot);
                    } else {
                      onErase(confirmErase.slot);
                      refreshSlots();
                    }
                    setConfirmErase(null);
                  }}
                >
                  {confirmErase.reason === 'overwrite' ? 'Yes, overwrite' : 'Yes, delete'}
                </button>
                <button className={styles.confirmNo} onClick={() => setConfirmErase(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
