import { useEffect, useState } from 'react';
import { useGameState } from './useGameState';
import HUD from './HUD';
import ExploreScreen from './ExploreScreen';
import BattleScreen from './BattleScreen';
import ShopScreen from './ShopScreen';
import InventoryModal from './InventoryModal';
import { TitleScreen, GameOverScreen, VictoryScreen } from './SpecialScreens';
import './App.css';

export default function App() {
  const {
    player, screen, setScreen, battleState, log, notification,
    travel, startBattle, playerAttack, playerDefend, enemyAttack,
    resolveVictory, useItem, buyItem, rest, resetGame, addLog,
  } = useGameState();

  const [showShop, setShowShop] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  // Check player death during battle
  useEffect(() => {
    if (player.hp <= 0 && screen === 'battle') {
      setTimeout(() => setScreen('gameover'), 600);
    }
  }, [player.hp, screen, setScreen]);

  const handleFlee = () => {
    const success = Math.random() > 0.4;
    if (success) {
      addLog('💨 You fled from battle!', 'travel');
      setScreen('explore');
    } else {
      addLog('❌ Failed to flee!', 'danger');
      enemyAttack();
    }
  };

  if (screen === 'title') return <TitleScreen onStart={() => setScreen('explore')} />;
  if (screen === 'gameover') return <GameOverScreen player={player} onRestart={resetGame} />;
  if (screen === 'victory') return <VictoryScreen player={player} onRestart={resetGame} />;

  return (
    <div className="app">
      {notification && (
        <div className={`toast toast--${notification.type}`}>
          {notification.msg}
        </div>
      )}

      <HUD player={player} onInventory={() => setShowInventory(true)} />

      <main className="main-content">
        {screen === 'explore' && (
          <ExploreScreen
            player={player}
            onTravel={travel}
            onStartBattle={startBattle}
            onShop={() => setShowShop(true)}
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

      {showShop && (
        <ShopScreen
          player={player}
          onBuy={buyItem}
          onClose={() => setShowShop(false)}
        />
      )}

      {showInventory && (
        <InventoryModal
          player={player}
          onUse={(item) => useItem(item, false)}
          onClose={() => setShowInventory(false)}
        />
      )}
    </div>
  );
}
