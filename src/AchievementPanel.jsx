import { useState } from 'react';
import { ACHIEVEMENTS, readAchievements, readBestiary } from './achievementData';
import { ENEMIES } from './gameData';
import styles from './AchievementPanel.module.css';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const CATEGORIES = ['Combat', 'Exploration', 'Quests', 'Skills', 'Crafting', 'Bestiary', 'Difficulty'];

export default function AchievementPanel({ unlocked, onClose }) {
  const [tab, setTab] = useState('achievements');
  const bestiary = readBestiary();
  const unlockedCount = Object.keys(unlocked).length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>🏆 Achievements & Bestiary</h2>
            <span className={styles.progress}>{unlockedCount} / {totalCount} unlocked</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'achievements' ? styles.activeTab : ''}`} onClick={() => setTab('achievements')}>
            🏆 Achievements
          </button>
          <button className={`${styles.tab} ${tab === 'bestiary' ? styles.activeTab : ''}`} onClick={() => setTab('bestiary')}>
            📖 Bestiary
          </button>
        </div>

        {tab === 'achievements' && (
          <div className={styles.content}>
            {CATEGORIES.map(cat => {
              const catAchs = ACHIEVEMENTS.filter(a => a.category === cat);
              return (
                <div key={cat} className={styles.category}>
                  <div className={styles.catTitle}>{cat}</div>
                  <div className={styles.achGrid}>
                    {catAchs.map(ach => {
                      const isUnlocked = !!unlocked[ach.id];
                      return (
                        <div key={ach.id} className={`${styles.ach} ${isUnlocked ? styles.unlocked : styles.locked}`}>
                          <div className={styles.achIcon}>{isUnlocked ? ach.icon : '🔒'}</div>
                          <div className={styles.achInfo}>
                            <div className={styles.achTitle}>{isUnlocked ? ach.title : '???'}</div>
                            <div className={styles.achDesc}>{isUnlocked ? ach.desc : 'Keep playing to unlock'}</div>
                            {isUnlocked && unlocked[ach.id].unlockedAt && (
                              <div className={styles.achDate}>🗓️ {formatDate(unlocked[ach.id].unlockedAt)}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'bestiary' && (
          <div className={styles.content}>
            <div className={styles.bestiaryGrid}>
              {Object.values(ENEMIES).map(enemy => {
                const entry = bestiary[enemy.id];
                const seen = !!entry;
                return (
                  <div key={enemy.id} className={`${styles.beastCard} ${seen ? styles.beastSeen : styles.beastUnseen}`}>
                    <div className={styles.beastIcon}>{seen ? enemy.icon : '❓'}</div>
                    <div className={styles.beastInfo}>
                      <div className={styles.beastName}>{seen ? enemy.name : '???'}</div>
                      {seen ? (
                        <>
                          <div className={styles.beastStats}>
                            <span>Lv.{enemy.level}</span>
                            <span>⚔️ {entry.kills} kills</span>
                          </div>
                          <div className={styles.beastDate}>First seen {formatDate(entry.firstSeen)}</div>
                        </>
                      ) : (
                        <div className={styles.beastUnknown}>Not yet encountered</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
