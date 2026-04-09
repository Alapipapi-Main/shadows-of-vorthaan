import { useState } from 'react';
import { readAchievements, writeAchievements, readBestiary, writeBestiary } from './achievementData';
import styles from './SettingsModal.module.css';

const FONT_SIZES = [
  { id: 'small',  label: 'Small',  value: '13px' },
  { id: 'normal', label: 'Normal', value: '16px' },
  { id: 'large',  label: 'Large',  value: '19px' },
];

const FONT_KEY = 'vorhaan_font_size';

function getFontSize() {
  return localStorage.getItem(FONT_KEY) || 'normal';
}

function setFontSize(id) {
  const size = FONT_SIZES.find(f => f.id === id);
  if (!size) return;
  localStorage.setItem(FONT_KEY, id);
  document.documentElement.style.setProperty('--game-font-size', size.value);
}

// Apply on load
const savedFont = getFontSize();
const savedFontEntry = FONT_SIZES.find(f => f.id === savedFont);
if (savedFontEntry) document.documentElement.style.setProperty('--game-font-size', savedFontEntry.value);

export default function SettingsModal({ musicVol, sfxVol, onMusicVol, onSfxVol, onClose }) {
  const [tab, setTab]           = useState('audio');
  const [fontSize, setFontSizeState] = useState(getFontSize);
  const [confirm, setConfirm]   = useState(null); // 'achievements' | 'bestiary' | 'all'
  const [cleared, setCleared]   = useState(null);

  const handleFontSize = (id) => {
    setFontSizeState(id);
    setFontSize(id);
  };

  const handleClear = (type) => {
    if (type === 'achievements') {
      writeAchievements({});
      setCleared('Achievements cleared!');
    } else if (type === 'bestiary') {
      writeBestiary({});
      setCleared('Bestiary cleared!');
    } else if (type === 'all') {
      // Clear everything
      Object.keys(localStorage)
        .filter(k => k.startsWith('vorhaan_'))
        .forEach(k => localStorage.removeItem(k));
      setCleared('All data cleared — refresh to start fresh.');
    }
    setConfirm(null);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>⚙️ Settings</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.tabs}>
          {['audio', 'display', 'data'].map(t => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.activeTab : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'audio' ? '🎵 Audio' : t === 'display' ? '🖥️ Display' : '🗑️ Data'}
            </button>
          ))}
        </div>

        <div className={styles.content}>

          {/* ── Audio ── */}
          {tab === 'audio' && (
            <div className={styles.section}>
              <div className={styles.row}>
                <label className={styles.label}>🎵 Music</label>
                <div className={styles.sliderWrap}>
                  <input type="range" min="0" max="1" step="0.05"
                    value={musicVol}
                    onChange={e => onMusicVol(parseFloat(e.target.value))}
                    className={styles.slider}
                  />
                  <span className={styles.val}>{Math.round(musicVol * 100)}%</span>
                </div>
              </div>
              <div className={styles.row}>
                <label className={styles.label}>🔊 Sound FX</label>
                <div className={styles.sliderWrap}>
                  <input type="range" min="0" max="1" step="0.05"
                    value={sfxVol}
                    onChange={e => onSfxVol(parseFloat(e.target.value))}
                    className={styles.slider}
                  />
                  <span className={styles.val}>{Math.round(sfxVol * 100)}%</span>
                </div>
              </div>
              <p className={styles.hint}>Set either slider to 0 to mute.</p>
            </div>
          )}

          {/* ── Display ── */}
          {tab === 'display' && (
            <div className={styles.section}>
              <div className={styles.settingLabel}>Font Size</div>
              <div className={styles.fontButtons}>
                {FONT_SIZES.map(f => (
                  <button
                    key={f.id}
                    className={`${styles.fontBtn} ${fontSize === f.id ? styles.fontActive : ''}`}
                    onClick={() => handleFontSize(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <p className={styles.hint}>Adjusts text size across the game. Useful on small screens.</p>
            </div>
          )}

          {/* ── Data ── */}
          {tab === 'data' && (
            <div className={styles.section}>
              {cleared && <div className={styles.clearedMsg}>✅ {cleared}</div>}

              <div className={styles.dangerZone}>
                <div className={styles.dangerTitle}>⚠️ Danger Zone</div>
                <p className={styles.hint}>These actions cannot be undone.</p>

                <button className={styles.dangerBtn} onClick={() => setConfirm('achievements')}>
                  🏆 Clear Achievements
                </button>
                <button className={styles.dangerBtn} onClick={() => setConfirm('bestiary')}>
                  📖 Clear Bestiary
                </button>
                <button className={`${styles.dangerBtn} ${styles.dangerBtnRed}`} onClick={() => setConfirm('all')}>
                  💣 Clear All Data
                </button>
              </div>

              {confirm && (
                <div className={styles.confirmBox}>
                  <p className={styles.confirmText}>
                    {confirm === 'all'
                      ? '⚠️ This will erase ALL saves, achievements, bestiary and settings. Are you sure?'
                      : `⚠️ Permanently clear your ${confirm}? This cannot be undone.`}
                  </p>
                  <div className={styles.confirmBtns}>
                    <button className={styles.confirmYes} onClick={() => handleClear(confirm)}>
                      Yes, clear it
                    </button>
                    <button className={styles.confirmNo} onClick={() => setConfirm(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
