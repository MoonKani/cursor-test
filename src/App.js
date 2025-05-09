import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [showNameModal, setShowNameModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [showCombat, setShowCombat] = useState(false);
  const [enemyHealth, setEnemyHealth] = useState(100);
  const [killCount, setKillCount] = useState(0);
  const [isDying, setIsDying] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [totalGold, setTotalGold] = useState(0);
  const [enemiesUntilBoss, setEnemiesUntilBoss] = useState(10);
  const [isBoss, setIsBoss] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const enemyRef = useRef(null);
  const idleIntervalRef = useRef(null);
  const [attackSpeed, setAttackSpeed] = useState(1200); // Default 1.2 seconds
  const [showBossCelebration, setShowBossCelebration] = useState(false);
  const [weapons, setWeapons] = useState([
    { id: 1, name: 'Laser Pistol', cost: 1000, speedBoost: 100, owned: false },
    { id: 2, name: 'Plasma Rifle', cost: 5000, speedBoost: 200, owned: false },
    { id: 3, name: 'Quantum Cannon', cost: 20000, speedBoost: 300, owned: false },
    { id: 4, name: 'Void Blaster', cost: 100000, speedBoost: 400, owned: false }
  ]);

  const [skills, setSkills] = useState([
    { id: 1, name: 'Vitality', level: 1, xp: 0, maxXp: 100 },
    { id: 2, name: 'Power', level: 1, xp: 0, maxXp: 100 },
    { id: 3, name: 'Evasion', level: 1, xp: 0, maxXp: 100 },
  ]);

  const items = {
    'Energy Crystal': {
      description: 'A basic energy source used for powering small devices.',
      value: 100
    },
    'Quantum Core': {
      description: 'Advanced technology that manipulates quantum states.',
      value: 500
    },
    'Void Essence': {
      description: 'A mysterious substance from the void between dimensions.',
      value: 2000
    },
    'Star Fragment': {
      description: 'A piece of a dying star, containing immense cosmic power.',
      value: 10000
    }
  };

  const [selectedItem, setSelectedItem] = useState(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  // Cleanup idle interval on unmount
  useEffect(() => {
    return () => {
      if (idleIntervalRef.current) {
        clearInterval(idleIntervalRef.current);
      }
    };
  }, []);

  // Add music control functions
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleIdle = () => {
    if (isIdle) {
      clearInterval(idleIntervalRef.current);
      idleIntervalRef.current = null;
    } else {
      if (idleIntervalRef.current) {
        clearInterval(idleIntervalRef.current);
      }
      idleIntervalRef.current = setInterval(() => {
        handleAttack();
      }, attackSpeed);
    }
    setIsIdle(!isIdle);
  };

  const generateLoot = () => {
    const itemList = [
      { id: 1, name: 'Energy Crystal', rarity: 'common' },
      { id: 2, name: 'Quantum Core', rarity: 'rare' },
      { id: 3, name: 'Void Essence', rarity: 'epic' },
      { id: 4, name: 'Star Fragment', rarity: 'legendary' }
    ];
    
    const roll = Math.random() * 100;
    let selectedItem;
    
    if (roll < 70) selectedItem = itemList[0];
    else if (roll < 90) selectedItem = itemList[1];
    else if (roll < 98) selectedItem = itemList[2];
    else selectedItem = itemList[3];

    const value = items[selectedItem.name].value;
    setTotalGold(prev => prev + value);

    return {
      ...selectedItem,
      id: Date.now(),
      quantity: 1,
      value: value
    };
  };

  const addItemToInventory = (newItem) => {
    setInventory(prev => {
      const existingItemIndex = prev.findIndex(
        item => item.name === newItem.name && item.rarity === newItem.rarity
      );

      if (existingItemIndex !== -1) {
        const updatedInventory = [...prev];
        updatedInventory[existingItemIndex] = {
          ...updatedInventory[existingItemIndex],
          quantity: updatedInventory[existingItemIndex].quantity + 1
        };
        return updatedInventory;
      } else {
        return [...prev, newItem];
      }
    });
  };

  const createParticles = () => {
    const enemy = enemyRef.current;
    if (!enemy) return;

    const rect = enemy.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 50;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      
      particle.style.left = `${rect.width / 2}px`;
      particle.style.top = `${rect.height / 2}px`;
      
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      
      particle.style.animation = `particleAnimation 0.8s ease-out forwards`;
      
      enemy.appendChild(particle);
      
      setTimeout(() => {
        particle.remove();
      }, 800);
    }
  };

  const showDamageNumber = (damage) => {
    const enemy = enemyRef.current;
    if (!enemy) return;

    const damageNumber = document.createElement('div');
    damageNumber.className = 'damage-number';
    damageNumber.textContent = `-${damage.toFixed(1)}%`;
    
    damageNumber.style.left = '50%';
    damageNumber.style.top = '50%';
    damageNumber.style.transform = 'translate(-50%, -50%)';
    
    enemy.appendChild(damageNumber);
    
    setTimeout(() => {
      damageNumber.remove();
    }, 800);
  };

  const showGoldGain = (amount) => {
    const enemy = enemyRef.current;
    if (!enemy) return;

    const goldNumber = document.createElement('div');
    goldNumber.className = 'gold-number';
    goldNumber.textContent = `+${amount} gold`;
    
    goldNumber.style.left = '50%';
    goldNumber.style.top = '60%';
    goldNumber.style.transform = 'translate(-50%, -50%)';
    
    enemy.appendChild(goldNumber);
    
    setTimeout(() => {
      goldNumber.remove();
    }, 800);
  };

  const handlePlayClick = () => {
    setShowNameModal(true);
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      setGameStarted(true);
      setShowNameModal(false);
    }
  };

  const handleCombatClick = () => {
    setShowCombat(true);
    setEnemyHealth(100);
    setIsDying(false);
    setIsBoss(false);
    if (isIdle) {
      toggleIdle();
    }
  };

  const handleBackClick = () => {
    setShowCombat(false);
    if (isIdle) {
      toggleIdle();
    }
  };

  const handleAttack = () => {
    if (isDying) return;

    const powerSkill = skills.find(skill => skill.name === 'Power');
    const damage = isBoss ? 
      (5 + (0.5 * powerSkill.level)) * 0.5 : // Boss takes half damage
      (5 + (0.5 * powerSkill.level));
    
    setEnemyHealth(currentHealth => {
      const newHealth = Math.max(0, currentHealth - damage);
      
      showDamageNumber(damage);

      if (newHealth <= 0) {
        if (!isDying) {  // Only process death if not already dying
          setIsDying(true);
          createParticles();
          setKillCount(prev => prev + 1);
          
          const newItem = generateLoot();
          showGoldGain(newItem.value);
          addItemToInventory(newItem);
          
          // Only update Power skill with XP
          const newSkills = skills.map(skill => {
            if (skill.name === 'Power') {
              const newXp = skill.xp + (isBoss ? 100 : 50); // Boss gives double XP
              const newLevel = newXp >= skill.maxXp ? skill.level + 1 : skill.level;
              const newMaxXp = newLevel > skill.level ? skill.maxXp * 1.5 : skill.maxXp;
              return {
                ...skill,
                xp: newXp >= skill.maxXp ? 0 : newXp,
                level: newLevel,
                maxXp: newMaxXp
              };
            }
            return skill;
          });
          setSkills(newSkills);

          if (isBoss) {
            setShowBossCelebration(true);
            setTimeout(() => setShowBossCelebration(false), 3000);
            setIsBoss(false);
            setEnemiesUntilBoss(10);
          } else {
            setEnemiesUntilBoss(prev => {
              const newCount = prev - 1;
              if (newCount <= 0) {
                setIsBoss(true);
                return 10;
              }
              return newCount;
            });
          }

          setTimeout(() => {
            setEnemyHealth(isBoss ? 300 : 100); // Boss has triple health
            setIsDying(false);
          }, 1000);
        }
      }

      return newHealth;
    });
  };

  const purchaseWeapon = (weapon) => {
    if (totalGold >= weapon.cost && !weapon.owned) {
      setTotalGold(prev => prev - weapon.cost);
      setWeapons(prev => prev.map(w => 
        w.id === weapon.id ? { ...w, owned: true } : w
      ));
      setAttackSpeed(prev => Math.max(200, prev - weapon.speedBoost));
      
      // Update idle interval if active
      if (isIdle) {
        clearInterval(idleIntervalRef.current);
        idleIntervalRef.current = setInterval(() => {
          handleAttack();
        }, Math.max(200, attackSpeed - weapon.speedBoost));
      }
    }
  };

  const handleSellItem = (item) => {
    setTotalGold(prev => prev + item.value);
    setInventory(prev => prev.filter(i => i.id !== item.id));
    setSelectedItem(null);
    
    // Show gold gain animation
    const goldNumber = document.createElement('div');
    goldNumber.className = 'gold-number';
    goldNumber.textContent = `+${item.value} gold`;
    goldNumber.style.left = '50%';
    goldNumber.style.top = '50%';
    goldNumber.style.transform = 'translate(-50%, -50%)';
    document.querySelector('.inventory-section').appendChild(goldNumber);
    
    setTimeout(() => {
      goldNumber.remove();
    }, 800);
  };

  const calculateTotalInventoryValue = () => {
    return inventory.reduce((total, item) => total + (item.value * item.quantity), 0);
  };

  return (
    <div className="App">
      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/music/preview/mixkit-space-ambience-1184.mp3"
        loop
      />
      <button 
        className={`music-toggle ${isMusicPlaying ? 'playing' : ''}`}
        onClick={toggleMusic}
        title={isMusicPlaying ? 'Pause Music' : 'Play Music'}
      >
        {isMusicPlaying ? '🔊' : '🔈'}
      </button>
      <header className="App-header">
        <h1>Space Station</h1>
      </header>
      <main>
        <div className="content">
          {!gameStarted ? (
            <>
              <h2>Welcome to Space Station</h2>
              <p>Your journey begins here...</p>
              <button className="play-button" onClick={handlePlayClick}>
                Play
              </button>
            </>
          ) : showCombat ? (
            <div className="combat-area">
              <button className="back-button" onClick={handleBackClick}>
                ← Back to Skills
              </button>
              <div className="combat-container">
                <div className="combat-main">
                  <h2>Combat Training</h2>
                  <div className="enemy" ref={enemyRef}>
                    <div className={`enemy-sprite ${isBoss ? 'boss' : ''} ${isDying ? 'dying' : ''}`} />
                    <div className={`enemy-health ${isBoss ? 'boss-health' : ''}`}>
                      <div 
                        className={`health-bar ${isBoss ? 'boss-health-bar' : ''}`}
                        style={{ width: `${enemyHealth}%` }}
                      />
                      <span>{Math.round(enemyHealth)}%</span>
                    </div>
                  </div>
                  {showBossCelebration && (
                    <div className="boss-celebration">
                      <div className="celebration-text">BOSS DEFEATED!</div>
                      <div className="celebration-particles"></div>
                    </div>
                  )}
                  <div className="kill-counter">
                    Enemies Defeated: {killCount}
                  </div>
                  <div className="gold-counter">
                    Total Gold: {totalGold.toLocaleString()}
                  </div>
                  {!isBoss && (
                    <div className="boss-counter">
                      Enemies until Boss: {enemiesUntilBoss}
                    </div>
                  )}
                  {isBoss && (
                    <div className="boss-warning">
                      BOSS FIGHT!
                    </div>
                  )}
                  <button 
                    className={`attack-button ${isIdle ? 'idle-active' : ''}`}
                    onClick={handleAttack}
                    disabled={enemyHealth <= 0 || isIdle}
                  >
                    Attack
                  </button>
                  <button 
                    className={`idle-button ${isIdle ? 'idle-active' : ''}`}
                    onClick={toggleIdle}
                  >
                    {isIdle ? 'Disable Idle' : 'Enable Idle'}
                  </button>
                </div>
                <div className="combat-skills">
                  <h3>Skills</h3>
                  {skills.map((skill) => (
                    <div key={skill.id} className="combat-skill-card">
                      <div className="combat-skill-header">
                        <span className="combat-skill-name">{skill.name}</span>
                        <span className="combat-skill-level">Lvl {skill.level}</span>
                      </div>
                      <div className="combat-xp-bar-container">
                        <div 
                          className="combat-xp-bar" 
                          style={{ width: `${(skill.xp / skill.maxXp) * 100}%` }}
                        />
                        <span className="combat-xp-text">{skill.xp}/{Math.round(skill.maxXp)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="inventory-section">
                    <h3>Inventory</h3>
                    <div className="inventory-grid">
                      {inventory.map((item) => (
                        <div 
                          key={item.id} 
                          className={`inventory-item ${item.rarity}`}
                          onMouseEnter={() => setShowTooltip(item.id)}
                          onMouseLeave={() => setShowTooltip(null)}
                        >
                          <span className="item-name">{item.name}</span>
                          <span className="item-quantity">x{item.quantity}</span>
                          {showTooltip === item.id && (
                            <div className={`tooltip ${item.rarity}`}>
                              <p>{items[item.name].description}</p>
                              <p className="tooltip-value">Value: {item.value.toLocaleString()} gold</p>
                            </div>
                          )}
                          <div className="item-actions">
                            <button 
                              className="sell-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSellItem(item);
                              }}
                            >
                              Sell for {item.value.toLocaleString()} gold
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="inventory-total">
                      Total Value: {calculateTotalInventoryValue().toLocaleString()} gold
                    </div>
                  </div>
                </div>
                <div className="shop-section">
                  <h3>Weapon Shop</h3>
                  <div className="weapons-grid">
                    {weapons.map(weapon => (
                      <div 
                        key={weapon.id} 
                        className={`weapon-card ${weapon.owned ? 'owned' : ''}`}
                        onClick={() => !weapon.owned && purchaseWeapon(weapon)}
                      >
                        <h4>{weapon.name}</h4>
                        <p>Speed Boost: -{weapon.speedBoost}ms</p>
                        <p className="weapon-cost">
                          {weapon.owned ? 'OWNED' : `${weapon.cost.toLocaleString()} gold`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="game-content">
              <h2>Welcome, {playerName}!</h2>
              <p>Choose your skills to begin your journey</p>
              
              <div className="skills-list">
                {skills.map((skill) => (
                  <div key={skill.id} className="skill-card">
                    <div className="skill-header">
                      <h3>{skill.name}</h3>
                      <span className="level">Level {skill.level}</span>
                    </div>
                    <div className="xp-bar-container">
                      <div 
                        className="xp-bar" 
                        style={{ width: `${(skill.xp / skill.maxXp) * 100}%` }}
                      />
                      <span className="xp-text">{skill.xp}/{Math.round(skill.maxXp)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="combat-button" onClick={handleCombatClick}>
                Enter Combat Training
              </button>
            </div>
          )}
        </div>
      </main>

      {showNameModal && (
        <div className="modal-overlay" onClick={() => setShowNameModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Enter Your Name</h2>
            <form onSubmit={handleNameSubmit}>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Space Explorer"
                maxLength={20}
                autoFocus
              />
              <button type="submit" className="submit-button">
                Start Journey
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
