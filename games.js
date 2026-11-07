window.GAMES = [
  {
    id: 'echo-vault', url: 'echo-vault.html', title: 'Echo Vault', emoji: '🔊', tag: 'Stealth', players: '1 player',
    desc: 'The maze is invisible. Ping with sonar to see the walls, but guards hear every ping.',
    how: ['Move with arrow keys or WASD.', 'Press Space to send a sonar ping.', 'Collect every shard, then reach the exit.'],
    tips: ['Move away from your ping spot right after pinging.']
  },
  {
    id: 'bot-arena', file: 'g-shooter.js', title: 'Bot Arena', emoji: '🎯', tag: 'Shooter', players: '1 player vs bots',
    desc: 'A top-down 2D arena shooter. You against endless waves of smarter and faster bots.',
    how: ['Move with WASD or arrow keys and aim with the mouse.', 'Hold the mouse button (or Space) to shoot.', 'On a phone, touch and hold: you move toward your finger and auto-aim at the nearest bot.', 'Grab hearts to heal and lightning bolts for rapid fire.'],
    tips: ['Use the blocks as cover; bots cannot shoot through them.', 'Keep moving sideways. Standing still gets you killed.', 'Each wave heals you a little, so finish waves quickly.']
  },
  {
    id: 'squad-clash', file: 'g-shooter.js', title: 'Squad Clash 4v4', emoji: '🪖', tag: 'Shooter', players: '4 vs 4 (you + 3 bot allies)',
    desc: 'Team shooter, 4 on 4. You and three bot teammates face four enemy bots. First team to win 3 rounds takes the match.',
    how: ['Move with WASD or arrow keys and aim with the mouse.', 'Hold the mouse button (or Space) to shoot.', 'A round ends when one whole team is eliminated.', 'Pick Easy, Normal or Hard before the match starts.'],
    tips: ['Stay close to your teammates so you can focus fire.', 'If you go down, your allies keep fighting for the round.']
  },
  {
    id: 'summon-siege', file: 'g-summoner.js', title: 'Summon Siege', emoji: '🧙', tag: 'Strategy', players: '1 player',
    desc: 'A 2D summoning battle. Spend mana to call monsters into three lanes and smash the enemy castle.',
    how: ['Mana refills over time. Click a card (or press 1-5) to summon a creature.', 'Choose a lane by clicking it or with the up/down arrow keys.', 'Lightning (card 6) lets you click anywhere to strike enemies.', 'Destroy the enemy castle to clear the stage. Each stage is harder.'],
    tips: ['Melee units (Imp, Golem) cannot hit Dragons. Bring Archers or Mages.', 'Golems in front, Archers behind is a classic combo.', 'Do not waste mana; save up for a Dragon when you are safe.']
  },
  {
    id: 'glitch-protocol', file: 'g-glitch.js', title: 'Glitch Protocol', emoji: '🌀', tag: 'Arcade', players: '1 player',
    desc: 'Every 9 seconds the rules of the game mutate: inverted controls, ice floors, lying colors, darkness, spinning worlds and more.',
    how: ['Move with WASD or arrows, or hold the mouse/finger to move toward it.', 'Collect green orbs, avoid red orbs.', 'Read the banner. Each glitch changes how everything works.', 'You have 3 lives.'],
    tips: ['When the banner says COLORS LIE, red orbs are the good ones!', 'In Gravity mode, tap up to flap upward.']
  },
  {
    id: 'daily-cipher', file: 'g-daily.js', title: 'Daily Cipher', emoji: '📅', tag: 'Daily', players: '1 player',
    desc: 'One secret code per day, the same for everyone. Crack it in 8 tries, build a streak and share your result.',
    how: ['Pick 4 colors to make a guess, then press Submit.', '⚫ means right color in the right place. ⚪ means right color, wrong place.', 'Colors can repeat in the secret code.', 'A new code unlocks every day at midnight your time.'],
    tips: ['Use your first guesses to learn which colors exist.', 'Practice mode lets you play extra random codes.']
  },
  {
    id: 'impossible-detective', file: 'g-detective.js', title: 'The Impossible Detective', emoji: '🕵️', tag: 'Story', players: '1 player',
    desc: 'A 15-chapter murder mystery inside a locked vault. Every chapter ends with a deduction and a twist you will not see coming.',
    how: ['Read each chapter carefully. The clues are all in the text.', 'Choose the best deduction at the end of every chapter.', 'Wrong answers do not stop the story, but they cost you Insight.', 'In chapter 15 you must name the culprit.'],
    tips: ['Re-read the notebook (top right) before the final accusation.', 'If something does not fit, it is probably the point.']
  },
  {
    id: 'deep-forge', file: 'g-factory.js', title: 'Deep Forge', emoji: '🏭', tag: 'Factory', players: '1 player',
    desc: 'A big, tedious, wonderful factory game. Mine five layers deep, smelt ores, craft parts and build the Quantum Engine.',
    how: ['Click Mine buttons to dig, then buy miners to dig for you.', 'Smelters and fabricators turn ore into ingots and parts automatically.', 'Unlock the next layer by paying its cost. There are 5 layers.', 'Build 3 Quantum Engines to complete the forge. Progress saves automatically.'],
    tips: ['Coal is needed everywhere. Never let it run out.', 'Buy a machine for each recipe, then scale up the bottleneck.']
  },
  {
    id: 'button-brawl', file: 'g-punch.js', title: 'Button Brawl', emoji: '🥊', tag: 'Fighting', players: '1 vs bot or 2 local',
    desc: 'Mash different buttons to win. Chain different punches to build a combo, press two keys at once for a Super Punch.',
    how: ['Player 1 uses A S D F. Player 2 uses J K L ;', 'Each key is a different punch. Alternating keys builds your combo.', 'Pressing the same key twice in a row breaks the combo.', 'Press two keys at the same instant for a 2.5x Super Punch.', 'On a phone, tap the on-screen buttons to fight the bot.'],
    tips: ['Roll across all four keys instead of spamming one.', 'Hard bots chain Super Punches. Stay on your combo!']
  },
  {
    id: 'pigeon-mail', file: 'g-mini.js', title: 'Pigeon Mail', emoji: '🐦', tag: 'Funny', players: '1 player',
    desc: 'You are a very confident, very chubby pigeon delivering mail between chimneys.',
    how: ['Tap, click or press Space to flap.', 'Fly through the gaps between chimneys.', 'Grab envelopes for bonus points.'],
    tips: ['Small, rhythmic taps beat panic flapping.']
  },
  {
    id: 'toast-tower', file: 'g-mini.js', title: 'Toast Tower', emoji: '🍞', tag: 'Funny', players: '1 player',
    desc: 'Stack slices of toast into the tallest breakfast skyscraper the world has ever seen.',
    how: ['A slice slides left and right. Tap, click or press Space to drop it.', 'Only the overlapping part stays. Perfect drops keep your width.', 'How high can you go?'],
    tips: ['Watch the slice speed up. Drop on the beat.']
  },
  {
    id: 'cat-chaos', file: 'g-mini.js', title: 'Cat Chaos', emoji: '🐱', tag: 'Funny', players: '1 player',
    desc: 'Knock everything off the shelves. But only when the owner is not looking.',
    how: ['Click or tap objects to knock them off the shelf.', 'When the owner shows ❗ get ready, when they show 👀 STOP.', 'Get caught 3 times and the game is over. You have 60 seconds.'],
    tips: ['The warning gives you a short window to sneak in one last swat.']
  },
  {
    id: 'emoji-match', file: 'g-mini.js', title: 'Emoji Mix-Up', emoji: '🧠', tag: 'Puzzle', players: '1 player',
    desc: 'A memory game full of ridiculous emoji. Match all the pairs in the fewest moves.',
    how: ['Click two cards to flip them.', 'Matching pairs stay open.', 'Finish with the fewest moves and the best time.'],
    tips: ['Work in one corner of the board at a time.']
  },
  {
    id: 'chicken-showdown', file: 'g-mini.js', title: 'Chicken Showdown', emoji: '🐔', tag: 'Funny', players: '1 player vs bot',
    desc: 'A quick-draw duel against Cluck Norris. Wait for DRAW, then fire. Too early and you lose.',
    how: ['Wait until the screen says DRAW!', 'Then press Space or tap as fast as you can.', 'Fire early and you lose the duel. Each round Cluck gets faster.'],
    tips: ['Do not anticipate. React.']
  },
  {
    id: 'cow-beam', file: 'g-mini.js', title: 'Cow Beam', emoji: '🛸', tag: 'Funny', players: '1 player',
    desc: 'Be a UFO. Abduct cows with your tractor beam while angry farmers throw pitchforks.',
    how: ['Move the UFO with the mouse, finger or arrow keys.', 'Hold click, touch or Space to fire the beam.', 'Keep the beam on a cow until it floats up.', 'The beam uses energy. Dodge pitchforks. You have 3 lives.'],
    tips: ['Let the beam recharge when farmers are throwing.']
  }
];
