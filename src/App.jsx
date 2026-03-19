import { useEffect, useState } from 'react';
import { useGameState, getAllSlots } from './useGameState';
import HUD from './HUD';
import ExploreScreen from './ExploreScreen';
import BattleScreen from './BattleScreen';
import ShopScreen from './ShopScreen';
import InventoryModal from './InventoryModal';
import QuestBoard from './QuestBoard';
import SaveSlotPicker from './SaveSlotPicker';
import { TitleScreen, GameOverScreen, VictoryScreen } from './SpecialScreens';
import './App.css';

export default function App() {
  const {
    player, screen, setScreen, battleState, log, notification, quests,
    travel, startBattle, playerAttack, playerDefend, enemyAttack,
    resolveVictory, useItem, buyItem, rest, claimQuest, addLog,
    loadSlot, eraseSlot, goToTitle,
  } = useGameState();

  const [showShop,      setShowShop]      = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showQuests,    setShowQuests]    = useState(false);
  const [slotPicker,    setSlotPicker]    = useState(null); // null | 'load' | 'new'

  // Count filled slots for title screen
  const filledSlots = getAllSlots().filter(s => !s.empty).length;

  // Player death detection
  useEffect(() => {
    if (player.hp <= 0 && screen === 'battle') {
      setTimeout(() => setScreen('gameover'), 600);
    }
  }, [player.hp, screen, setScreen]);

  const handleFlee = () => {
    if (Math.random() > 0.4) {
      addLog('💨 You fled from battle!', 'travel');
      setScreen('explore');
    } else {
      addLog('❌ Failed to flee!', 'danger');
      enemyAttack();
    }
  };

  // ── Title screen ────────────────────────────────────────────────────────────
  if (screen === 'title') return (
    <>
      <TitleScreen
        hasAnySave={filledSlots || null}
        onContinue={() => setSlotPicker('load')}
        onNewGame={() => setSlotPicker('new')}
      />
      {slotPicker && (
        <SaveSlotPicker
          mode={slotPicker}
          onSelect={(slot) => { setSlotPicker(null); loadSlot(slot); }}
          onErase={(slot) => { eraseSlot(slot); setSlotPicker(null); setTimeout(() => setSlotPicker(slotPicker), 50); }}
          onClose={() => setSlotPicker(null)}
        />
      )}
    </>
  );

  if (screen === 'gameover') return <GameOverScreen player={player} onRestart={goToTitle} />;
  if (screen === 'victory')  return <VictoryScreen  player={player} onRestart={goToTitle} />;

  const readyQuests = quests.filter(q => q.status === 'completed').length;

  return (
    <div className="app">
      {notification && (
        <div className={`toast toast--${notification.type}`}>{notification.msg}</div>
      )}

      <HUD
        player={player}
        quests={quests}
        onInventory={() => setShowInventory(true)}
        onQuestBoard={() => setShowQuests(true)}
      />

      <main className="main-content">
        {screen === 'explore' && (
          <ExploreScreen
            player={player}
            quests={quests}
            onTravel={travel}
            onStartBattle={startBattle}
            onShop={() => setShowShop(true)}
            onQuestBoard={() => setShowQuests(true)}
            onRest={rest}
            log={log}
          />
        )}
        {screen === 'battle' && battleState && (
          <BattleScreen
            player={player}
            battleState={battleState}
            onAttack={playerAttack}
            onDefend={playerDefend}
            onFlee={handleFlee}
            onEnemyTurn={enemyAttack}
            onResolveVictory={resolveVictory}
            onUseItem={useItem}
            log={log}
          />
        )}
      </main>

      {showShop      && <ShopScreen     player={player} onBuy={buyItem}              onClose={() => setShowShop(false)}      />}
      {showInventory && <InventoryModal player={player} onUse={i => useItem(i,false)} onClose={() => setShowInventory(false)} />}
      {showQuests    && <QuestBoard     quests={quests}  onClaim={claimQuest}         onClose={() => setShowQuests(false)}    />}
    </div>
  );
}
