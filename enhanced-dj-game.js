/**
 * 🎧 ENHANCED DJ SIMULATOR 2026 🎧
 * Features: Multiplayer, Special Events, Kerala DJ Collaborations
 */

class DJGame {
  constructor() {
    this.playerName = '';
    this.level = 1;
    this.experience = 0;
    this.money = 1000;
    this.reputation = 50;
    this.currentVenue = null;
    this.equipment = {
      turntables: 1,
      mixer: 1,
      speakers: 1,
      microphone: 0,
      lightingRig: 0,
      soundSystem: 0
    };
    this.tracks = [];
    this.currentPlaylist = [];
    this.crowdMood = 50;
    this.gameTime = 0;
    this.isPerforming = false;
    this.collaborations = [];
    this.achievements = new Map();
    this.multiplayer = {
      isMultiplayer: false,
      opponent: null,
      battleScore: 0
    };
    this.keralaDJs = this.initializeKeralaDJs();
    this.specialEvents = this.initializeSpecialEvents();
  }

  // Initialize Kerala's Top DJs
  initializeKeralaDJs() {
    return [
      {
        id: 1,
        name: 'DJ Savyo',
        reputation: 95,
        specialty: 'House & Techno',
        baseCity: 'Kochi',
        experience: 'High',
        collaborationBonus: 25,
        description: 'Most sought-after DJ in Kochi. Known for electrifying performances.'
      },
      {
        id: 2,
        name: 'DJ Ricky Brown',
        reputation: 90,
        specialty: 'Electronic & Dance',
        baseCity: 'Kerala',
        experience: 'Veteran',
        collaborationBonus: 20,
        description: 'Pioneer DJ in Kerala with decades of experience.'
      },
      {
        id: 3,
        name: 'DJ Charles',
        reputation: 88,
        specialty: 'Club & Festival',
        baseCity: 'Kochi',
        experience: 'High',
        collaborationBonus: 22,
        description: 'Regular at major clubs and events. Great mixer.'
      },
      {
        id: 4,
        name: 'DJ Mickey',
        reputation: 85,
        specialty: 'Party & Events',
        baseCity: 'Kochi',
        experience: 'Experienced',
        collaborationBonus: 18,
        description: 'Popular for club and party events with high energy.'
      },
      {
        id: 5,
        name: 'DJ Jubin Sunny',
        reputation: 87,
        specialty: 'Dubstep & Drum & Bass',
        baseCity: 'Kochi',
        experience: 'High',
        collaborationBonus: 21,
        description: 'The Dubstep Guru. Dominates club and festival scenes.'
      },
      {
        id: 6,
        name: 'DJ Archie',
        reputation: 82,
        specialty: 'Weddings & Events',
        baseCity: 'Kochi',
        experience: 'Experienced',
        collaborationBonus: 17,
        description: 'Master of engagement. Perfect for weddings and private gigs.'
      },
      {
        id: 7,
        name: 'DJ Dheeru Beatz',
        reputation: 80,
        specialty: 'Weddings & Parties',
        baseCity: 'Kochi',
        experience: 'Intermediate',
        collaborationBonus: 16,
        description: 'Specializes in weddings, college parties, and bachelor events.'
      },
      {
        id: 8,
        name: 'DJ Jay',
        reputation: 78,
        specialty: 'Hip-Hop & Reggae',
        baseCity: 'Kochi',
        experience: 'Intermediate',
        collaborationBonus: 15,
        description: 'Brings vibrant energy to parties across Kochi.'
      }
    ];
  }

  // Initialize Special Events
  initializeSpecialEvents() {
    return [
      {
        id: 1,
        name: 'Kochi Music Festival',
        type: 'Festival',
        capacity: 5000,
        payPerHour: 5000,
        reputation: 100,
        difficulty: 'Hard',
        duration: 4,
        requirements: { level: 5, reputation: 70 },
        bonus: 'Festival Champion Badge',
        description: 'Biggest music festival in Kochi. Play alongside top DJs!'
      },
      {
        id: 2,
        name: 'Beach Rave Night',
        type: 'Beach Party',
        capacity: 2000,
        payPerHour: 2000,
        reputation: 60,
        difficulty: 'Medium',
        duration: 3,
        requirements: { level: 3, reputation: 50 },
        bonus: 'Beach Master Badge',
        description: 'Epic beach party with sunset vibes and massive crowd.'
      },
      {
        id: 3,
        name: 'Underground Rave',
        type: 'Club',
        capacity: 500,
        payPerHour: 1500,
        reputation: 45,
        difficulty: 'Medium',
        duration: 2,
        requirements: { level: 2, reputation: 30 },
        bonus: 'Underground Legend Badge',
        description: 'Secret underground event. Exclusive crowd!'
      },
      {
        id: 4,
        name: 'Wedding Extravaganza',
        type: 'Wedding',
        capacity: 800,
        payPerHour: 3000,
        reputation: 50,
        difficulty: 'Medium',
        duration: 5,
        requirements: { level: 2, reputation: 40 },
        bonus: 'Wedding Specialist Badge',
        description: 'High-paying wedding event. Keep the couple happy!'
      },
      {
        id: 5,
        name: 'New Year Countdown',
        type: 'Holiday',
        capacity: 3000,
        payPerHour: 4000,
        reputation: 80,
        difficulty: 'Hard',
        duration: 4,
        requirements: { level: 4, reputation: 65 },
        bonus: 'New Year Champion Badge',
        description: 'Countdown to midnight with spectacular energy!'
      },
      {
        id: 6,
        name: 'Corporate Gala',
        type: 'Corporate',
        capacity: 300,
        payPerHour: 2500,
        reputation: 40,
        difficulty: 'Easy',
        duration: 3,
        requirements: { level: 1, reputation: 20 },
        bonus: 'Corporate Elite Badge',
        description: 'Classy corporate event. Professional atmosphere required.'
      },
      {
        id: 7,
        name: 'Battle of DJs',
        type: 'Competition',
        capacity: 1000,
        payPerHour: 2000,
        reputation: 70,
        difficulty: 'Hard',
        duration: 2,
        requirements: { level: 4, reputation: 60 },
        bonus: 'DJ Battle Winner Badge',
        description: 'Compete against other top DJs. Win the crowd!'
      },
      {
        id: 8,
        name: 'College Fest',
        type: 'College',
        capacity: 2000,
        payPerHour: 1200,
        reputation: 55,
        difficulty: 'Medium',
        duration: 3,
        requirements: { level: 2, reputation: 35 },
        bonus: 'College Favorite Badge',
        description: 'Get the college crowd dancing all night!'
      }
    ];
  }

  // Main Game Start
  startGame(name, gameMode = 'single') {
    this.playerName = name;
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║           🎧 ENHANCED DJ SIMULATOR 2026 🎧                  ║
║     Master the Beats. Collaborate with Kerala's Top DJs!    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `);
    console.log(`Welcome, DJ ${name}! 🎵\n`);

    if (gameMode === 'multiplayer') {
      this.startMultiplayer();
    } else {
      this.showMainMenu();
    }
  }

  // Main Menu
  showMainMenu() {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                     MAIN MENU                                ║
╚══════════════════════════════════════════════════════════════╝

📊 STATUS:
  DJ: ${this.playerName}
  Level: ${this.level} | XP: ${this.experience}/100
  Money: $${this.money} | Reputation: ${this.reputation}/100
  Collaborations: ${this.collaborations.length}

OPTIONS:
  1. 🎵 Create Playlist
  2. 🏢 Book Regular Venue
  3. 🎪 Book Special Event
  4. 🎤 Perform & Earn
  5. 🤝 Collaborate with Kerala DJs
  6. 🛒 Buy Equipment
  7. ⚔️  Multiplayer Mode
  8. 📊 View Stats & Achievements
  9. 🏆 View Leaderboard
  10. 💾 Save & Exit

Choose an option (1-10):
    `);
  }

  // Create Playlist
  createPlaylist() {
    const genres = [
      'House', 'Techno', 'Trance', 'Hip-Hop', 'Reggae', 'Pop',
      'Drum & Bass', 'Dubstep', 'Deep House', 'Electro', 'Psytrance'
    ];
    const tracks = [
      'Electric Pulse', 'Night Drive', 'Sunset Dreams', 'Urban Beats', 'Crystal Waters',
      'Thunder Storm', 'Neon Lights', 'Deep Ocean', 'Golden Hour', 'Midnight City',
      'Tropical Vibes', 'Desert Wind', 'Electric Dreams', 'Cosmic Journey', 'Wave Rider'
    ];

    this.currentPlaylist = [];
    const playlistLength = Math.floor(Math.random() * 5) + 8; // 8-13 tracks

    console.log(`\n🎵 CREATING PLAYLIST...\n`);
    console.log(`╔════════════════════════════════════════════════════════════╗`);

    for (let i = 0; i < playlistLength; i++) {
      const track = {
        id: i + 1,
        name: tracks[Math.floor(Math.random() * tracks.length)],
        genre: genres[Math.floor(Math.random() * genres.length)],
        duration: Math.floor(Math.random() * 4) + 3,
        energy: Math.floor(Math.random() * 100),
        bpm: Math.floor(Math.random() * 60) + 90,
        vibe: this.generateVibe()
      };
      this.currentPlaylist.push(track);
      console.log(`║ ${String(i + 1).padStart(2)}. ${track.name.padEnd(20)} [${track.genre.padEnd(12)}] ${track.bpm} BPM - ${track.energy}% Energy`);
    }

    console.log(`╚════════════════════════════════════════════════════════════╝`);
    console.log(`✅ Playlist created with ${playlistLength} tracks!\n`);
    return this.currentPlaylist;
  }

  // Generate vibe for track
  generateVibe() {
    const vibes = ['Chill', 'Energetic', 'Groovy', 'Uplifting', 'Dark', 'Funky', 'Smooth'];
    return vibes[Math.floor(Math.random() * vibes.length)];
  }

  // Book Regular Venue
  bookVenue() {
    const venues = [
      {
        name: 'The Underground Club',
        capacity: 100,
        payPerHour: 200,
        reputation: 20,
        difficulty: 'Easy',
        vibe: 'Underground'
      },
      {
        name: 'Metro Nightclub',
        capacity: 300,
        payPerHour: 500,
        reputation: 40,
        difficulty: 'Medium',
        vibe: 'Club'
      },
      {
        name: 'Elite Lounge',
        capacity: 200,
        payPerHour: 400,
        reputation: 35,
        difficulty: 'Medium',
        vibe: 'Lounge'
      },
      {
        name: 'Apex Arena',
        capacity: 500,
        payPerHour: 1000,
        reputation: 60,
        difficulty: 'Hard',
        vibe: 'Arena'
      },
      {
        name: 'Euphoria Club',
        capacity: 250,
        payPerHour: 600,
        reputation: 50,
        difficulty: 'Medium',
        vibe: 'Electronic'
      },
      {
        name: 'The Sunset Bar',
        capacity: 150,
        payPerHour: 350,
        reputation: 30,
        difficulty: 'Easy',
        vibe: 'Chill'
      }
    ];

    console.log(`\n🏢 AVAILABLE VENUES:\n`);
    venues.forEach((venue, index) => {
      console.log(`  ${index + 1}. ${venue.name}`);
      console.log(`     Capacity: ${venue.capacity} | Pay: $${venue.payPerHour}/hr | Vibe: ${venue.vibe}`);
      console.log(`     Reputation Gain: +${venue.reputation} | Difficulty: ${venue.difficulty}\n`);
    });

    const selectedVenue = venues[Math.floor(Math.random() * venues.length)];
    this.currentVenue = selectedVenue;
    console.log(`✅ Booked: ${selectedVenue.name}\n`);
    return selectedVenue;
  }

  // Book Special Event
  bookSpecialEvent() {
    console.log(`\n🎪 SPECIAL EVENTS:\n`);
    console.log(`╔════════════════════════════════════════════════════════════╗`);

    this.specialEvents.forEach((event, index) => {
      const canBook = this.level >= event.requirements.level && 
                      this.reputation >= event.requirements.reputation;
      const status = canBook ? '✅' : '🔒';

      console.log(`\n${status} ${index + 1}. ${event.name}`);
      console.log(`   Type: ${event.type} | Duration: ${event.duration}h`);
      console.log(`   Capacity: ${event.capacity} | Pay: $${event.payPerHour}/hr`);
      console.log(`   Reputation: +${event.reputation} | Difficulty: ${event.difficulty}`);
      console.log(`   Requirements: Level ${event.requirements.level}+ | Reputation ${event.requirements.reputation}+`);
      console.log(`   Bonus: ${event.bonus}`);
      console.log(`   "${event.description}"`);
    });

    console.log(`\n╚════════════════════════════════════════════════════════════╝`);

    const selectedEvent = this.specialEvents[Math.floor(Math.random() * this.specialEvents.length)];
    const canBook = this.level >= selectedEvent.requirements.level && 
                    this.reputation >= selectedEvent.requirements.reputation;

    if (canBook) {
      this.currentVenue = selectedEvent;
      console.log(`\n✅ Special Event Booked: ${selectedEvent.name}\n`);
    } else {
      console.log(`\n❌ You don't meet the requirements for this event.\n`);
    }

    return selectedEvent;
  }

  // Perform at Venue
  performAtVenue() {
    if (!this.currentVenue) {
      console.log(`\n❌ Book a venue first!\n`);
      return;
    }

    if (this.currentPlaylist.length === 0) {
      console.log(`\n❌ Create a playlist first!\n`);
      return;
    }

    console.log(`\n🎤 NOW PERFORMING...\n`);
    console.log(`════════════════════════════════════════════════════════════`);
    console.log(`📍 Venue: ${this.currentVenue.name}`);
    console.log(`👥 Capacity: ${this.currentVenue.capacity}`);
    console.log(`════════════════════════════════════════════════════════════\n`);

    let performance = {
      crowdEngagement: 0,
      correctMixes: 0,
      totalMixes: 0,
      earnings: 0,
      xpGained: 0,
      tracks: []
    };

    // Simulate performance
    this.currentPlaylist.forEach((track, index) => {
      const mixSkill = Math.random() * 100;
      const prevTrack = this.currentPlaylist[index - 1];
      const bpmMatch = !prevTrack || Math.abs(prevTrack.bpm - track.bpm) < 15;
      const energyFlow = !prevTrack || Math.abs(prevTrack.energy - track.energy) < 30;
      const crowdResponse = track.energy * 0.6 + mixSkill * 0.4;

      let mixQuality = '⚠️ Rough';
      if (mixSkill > 80) mixQuality = '✅ PERFECT';
      else if (mixSkill > 60) mixQuality = '👍 Good';
      else if (mixSkill > 40) mixQuality = '⚡ Fair';

      console.log(`🎵 Track ${index + 1}: "${track.name}"`);
      console.log(`   [${track.genre}] ${track.bpm}BPM | Energy: ${track.energy}% | ${track.vibe}`);
      console.log(`   Mix Quality: ${mixQuality} (${Math.floor(mixSkill)}%)`);

      if (bpmMatch && energyFlow && mixSkill > 70) {
        console.log(`   💫 SEAMLESS TRANSITION! Crowd LOVES IT!`);
        performance.correctMixes++;
      }

      performance.totalMixes++;
      performance.crowdEngagement += crowdResponse;
      performance.tracks.push({ track: track.name, mixQuality: Math.floor(mixSkill) });
    });

    // Calculate results
    performance.crowdEngagement = Math.min(100, performance.crowdEngagement / this.currentPlaylist.length);
    performance.xpGained = Math.floor(performance.crowdEngagement * 12);
    performance.earnings = Math.floor((performance.crowdEngagement / 100) * this.currentVenue.payPerHour * 
                           (this.currentVenue.duration || 2));

    // Add equipment bonus
    const equipmentBonus = (Object.values(this.equipment).reduce((a, b) => a + b) - 2) * 0.05;
    performance.earnings = Math.floor(performance.earnings * (1 + equipmentBonus));

    console.log(`\n════════════════════════════════════════════════════════════`);
    console.log(`🎊 PERFORMANCE COMPLETE!\n`);
    console.log(`Crowd Engagement: ${Math.floor(performance.crowdEngagement)}%`);
    console.log(`Perfect Mixes: ${performance.correctMixes}/${performance.totalMixes}`);
    console.log(`Earnings: $${performance.earnings}`);
    console.log(`XP Gained: ${performance.xpGained}`);
    console.log(`════════════════════════════════════════════════════════════\n`);

    // Update stats
    this.money += performance.earnings;
    this.experience += performance.xpGained;
    this.reputation += Math.floor((this.currentVenue.reputation || 50) * (performance.crowdEngagement / 100));
    this.crowdMood = performance.crowdEngagement;

    this.checkLevelUp();
    return performance;
  }

  // Collaborate with Kerala DJs
  collaborateWithDJ() {
    console.log(`\n🤝 COLLABORATE WITH KERALA'S TOP DJs\n`);
    console.log(`╔════════════════════════════════════════════════════════════╗`);

    this.keralaDJs.forEach((dj, index) => {
      console.log(`\n${index + 1}. ${dj.name}`);
      console.log(`   City: ${dj.baseCity} | Specialty: ${dj.specialty}`);
      console.log(`   Reputation: ${dj.reputation}/100 | Experience: ${dj.experience}`);
      console.log(`   "${dj.description}"`);
      console.log(`   💰 Collaboration Bonus: +${dj.collaborationBonus} Reputation`);
    });

    console.log(`\n╚════════════════════════════════════════════════════════════╝`);

    const selectedDJ = this.keralaDJs[Math.floor(Math.random() * this.keralaDJs.length)];

    console.log(`\n🎵 COLLABORATING WITH ${selectedDJ.name.toUpperCase()}...\n`);

    // Collaboration effects
    const collaborationSuccess = Math.random() > 0.2; // 80% success rate

    if (collaborationSuccess) {
      this.collaborations.push({
        djName: selectedDJ.name,
        date: new Date().toLocaleDateString(),
        bonus: selectedDJ.collaborationBonus,
        moneyBonus: 500
      });

      this.reputation += selectedDJ.collaborationBonus;
      this.money += 500;
      this.experience += 50;

      console.log(`✅ COLLABORATION SUCCESSFUL!\n`);
      console.log(`🤝 You performed with ${selectedDJ.name}`);
      console.log(`💰 Earned: $500 + ${selectedDJ.collaborationBonus} Reputation`);
      console.log(`⭐ XP Gained: 50\n`);

      // Special achievement
      this.unlockAchievement(`Collaborated with ${selectedDJ.name}`);
    } else {
      console.log(`⚠️ Collaboration didn't go as planned. Try again!\n`);
    }

    return selectedDJ;
  }

  // Multiplayer Mode
  startMultiplayer() {
    console.log(`\n⚔️ MULTIPLAYER MODE - DJ BATTLE\n`);
    console.log(`════════════════════════════════════════════════════════════`);

    const opponent = {
      name: this.generateOpponentName(),
      level: Math.floor(Math.random() * 5) + 1,
      reputation: Math.floor(Math.random() * 50) + 30,
      equipment: Math.floor(Math.random() * 3) + 1,
      skill: Math.random()
    };

    console.log(`\n🎤 DJ BATTLE: ${this.playerName} vs ${opponent.name}`);
    console.log(`\nOpponent Stats:`);
    console.log(`  Level: ${opponent.level}`);
    console.log(`  Reputation: ${opponent.reputation}/100`);
    console.log(`  Equipment Quality: ${opponent.equipment}/5`);
    console.log(`\n════════════════════════════════════════════════════════════\n`);

    const battleRound1 = this.playBattleRound(1, opponent);
    const battleRound2 = this.playBattleRound(2, opponent);
    const battleRound3 = this.playBattleRound(3, opponent);

    const playerScore = battleRound1.playerScore + battleRound2.playerScore + battleRound3.playerScore;
    const opponentScore = battleRound1.opponentScore + battleRound2.opponentScore + battleRound3.opponentScore;

    console.log(`\n════════════════════════════════════════════════════════════`);
    console.log(`🏆 FINAL RESULTS:\n`);
    console.log(`${this.playerName}: ${playerScore} points`);
    console.log(`${opponent.name}: ${opponentScore} points\n`);

    if (playerScore > opponentScore) {
      console.log(`🎉 YOU WIN! VICTORY!\n`);
      this.money += 2000;
      this.reputation += 50;
      this.experience += 100;
      this.unlockAchievement('Battle Champion');
    } else if (playerScore < opponentScore) {
      console.log(`😔 You Lost! Better luck next time!\n`);
      this.money += 500;
      this.experience += 30;
    } else {
      console.log(`🤝 It's a TIE!\n`);
      this.money += 1000;
      this.experience += 50;
    }

    console.log(`════════════════════════════════════════════════════════════\n`);
    this.checkLevelUp();
  }

  // Battle Round
  playBattleRound(roundNumber, opponent) {
    console.log(`\n🎵 ROUND ${roundNumber}\n`);

    const playerPerformance = Math.random() * 100;
    const opponentPerformance = opponent.skill * 100 + Math.random() * 20;

    const playerScore = Math.floor(playerPerformance * (1 + (Object.values(this.equipment).reduce((a, b) => a + b) / 20)));
    const opponentScore = Math.floor(opponentPerformance * (1 + (opponent.equipment / 5)));

    console.log(`${this.playerName}: ${playerScore} pts | ${opponent.name}: ${opponentScore} pts`);

    if (playerScore > opponentScore) {
      console.log(`✅ ${this.playerName} wins this round!\n`);
    } else if (opponentScore > playerScore) {
      console.log(`❌ ${opponent.name} wins this round!\n`);
    } else {
      console.log(`🤝 This round is tied!\n`);
    }

    return { playerScore, opponentScore };
  }

  // Generate opponent name
  generateOpponentName() {
    const names = ['DJ Nova', 'DJ Phoenix', 'DJ Storm', 'DJ Pulse', 'DJ Blaze', 'DJ Sonic', 'DJ Wave'];
    return names[Math.floor(Math.random() * names.length)];
  }

  // Buy Equipment
  buyEquipment() {
    const equipmentShop = [
      { name: 'Microphone', cost: 500, stat: 'microphone', boost: 0.1, description: 'Engage crowd with vocals' },
      { name: 'Extra Turntable', cost: 2000, stat: 'turntables', boost: 0.15, description: 'Better mixing control' },
      { name: 'Premium Mixer', cost: 3000, stat: 'mixer', boost: 0.2, description: 'Advanced sound control' },
      { name: 'Studio Speakers', cost: 4000, stat: 'speakers', boost: 0.25, description: 'Crystal clear audio' },
      { name: 'Lighting Rig', cost: 5000, stat: 'lightingRig', boost: 0.18, description: 'Spectacular light show' },
      { name: 'Sound System Pro', cost: 6000, stat: 'soundSystem', boost: 0.3, description: 'Professional grade system' }
    ];

    console.log(`\n🛒 EQUIPMENT SHOP\n`);
    console.log(`Your Money: $${this.money}\n`);
    console.log(`╔════════════════════════════════════════════════════════════╗`);

    equipmentShop.forEach((item, index) => {
      const owned = this.equipment[item.stat] > 0;
      const affordable = this.money >= item.cost;
      const status = owned ? '✅' : (affordable ? '💰' : '❌');

      console.log(`\n${status} ${index + 1}. ${item.name} - $${item.cost}`);
      console.log(`   ${item.description}`);
      console.log(`   Performance Boost: +${Math.floor(item.boost * 100)}%`);
    });

    console.log(`\n╚════════════════════════════════════════════════════════════╝`);

    // Simulate purchase
    const purchaseItem = equipmentShop[Math.floor(Math.random() * equipmentShop.length)];

    if (this.money >= purchaseItem.cost && !this.equipment[purchaseItem.stat]) {
      this.money -= purchaseItem.cost;
      this.equipment[purchaseItem.stat]++;
      console.log(`\n✅ Purchased: ${purchaseItem.name} for $${purchaseItem.cost}\n`);
      this.unlockAchievement(`Bought ${purchaseItem.name}`);
    } else {
      console.log(`\n❌ Not enough money or already owned!\n`);
    }
  }

  // View Stats & Achievements
  viewStatsAndAchievements() {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                    DJ STATISTICS                           ║
╚════════════════════════════════════════════════════════════╝

👤 Player: ${this.playerName}
📊 Level: ${this.level}
⭐ Experience: ${this.experience}/100
💰 Money: $${this.money}
🏆 Reputation: ${this.reputation}/100
😊 Crowd Mood: ${this.crowdMood}%

🎛️ EQUIPMENT STATUS:
  Turntables: ${this.equipment.turntables}
  Mixer: ${this.equipment.mixer}
  Speakers: ${this.equipment.speakers}
  Microphone: ${this.equipment.microphone}
  Lighting Rig: ${this.equipment.lightingRig}
  Sound System: ${this.equipment.soundSystem}

🤝 COLLABORATIONS: ${this.collaborations.length}
    `);

    if (this.collaborations.length > 0) {
      console.log(`  Recent Collaborations:`);
      this.collaborations.slice(-5).forEach(collab => {
        console.log(`    • ${collab.djName} (${collab.date})`);
      });
    }

    console.log(`\n🏆 ACHIEVEMENTS:\n`);
    this.achievements.forEach((achievement) => {
      console.log(`  ✅ ${achievement}`);
    });

    if (this.achievements.size === 0) {
      console.log(`  No achievements yet. Keep playing!\n`);
    }
  }

  // View Leaderboard
  viewLeaderboard() {
    const leaderboard = [
      { rank: 1, name: 'DJ Savyo', level: 10, reputation: 100, money: 50000 },
      { rank: 2, name: 'DJ Ricky Brown', level: 9, reputation: 95, money: 45000 },
      { rank: 3, name: this.playerName, level: this.level, reputation: this.reputation, money: this.money },
      { rank: 4, name: 'DJ Charles', level: 8, reputation: 88, money: 35000 },
      { rank: 5, name: 'DJ Mickey', level: 7, reputation: 85, money: 28000 },
      { rank: 6, name: 'DJ Jubin Sunny', level: 7, reputation: 87, money: 32000 }
    ];

    // Sort by level and reputation
    leaderboard.sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      return b.reputation - a.reputation;
    });

    console.log(`\n🏆 GLOBAL LEADERBOARD\n`);
    console.log(`╔═══════════════════════════════════════════════════════════╗`);
    console.log(`║ Rank │ DJ Name                  │ Level │ Reputation │   ║`);
    console.log(`╠═══════════════════════════════════════════════════════════╣`);

    leaderboard.forEach((entry, index) => {
      const prefix = entry.name === this.playerName ? '👉' : '  ';
      console.log(`║ ${String(index + 1).padStart(2)}   │ ${entry.name.padEnd(23)} │  ${String(entry.level).padStart(2)}  │    ${String(entry.reputation).padStart(3)}     │${prefix}║`);
    });

    console.log(`╚═══════════════════════════════════════════════════════════╝\n`);
  }

  // Unlock Achievement
  unlockAchievement(name) {
    if (!this.achievements.has(name)) {
      this.achievements.set(name, true);
      console.log(`🎖️ NEW ACHIEVEMENT UNLOCKED: ${name}!\n`);
    }
  }

  // Check Level Up
  checkLevelUp() {
    const nextLevelXP = this.level * 100;
    if (this.experience >= nextLevelXP) {
      this.level++;
      this.experience = 0;
      console.log(`\n🎉 LEVEL UP! You are now level ${this.level}!\n`);
      this.unlockAchievement(`Reached Level ${this.level}`);
    }
  }

  // Save Game
  saveGame() {
    const gameData = {
      playerName: this.playerName,
      level: this.level,
      experience: this.experience,
      money: this.money,
      reputation: this.reputation,
      equipment: this.equipment,
      crowdMood: this.crowdMood,
      collaborations: this.collaborations,
      achievements: Array.from(this.achievements.keys())
    };

    console.log(`\n💾 GAME SAVED!\n`);
    console.log(`Game Data (JSON):\n`);
    console.log(JSON.stringify(gameData, null, 2));
    console.log();

    return gameData;
  }
}

// =====================================================
// GAME DEMO EXECUTION
// =====================================================

console.log(`\n${'═'.repeat(62)}`);
console.log(`STARTING DJ GAME...`);
console.log(`${'═'.repeat(62)}\n`);

const game = new DJGame();

// Start single player game
game.startGame('Savyo Disciple', 'single');

// Demonstrate features
console.log(`\n${'═'.repeat(62)}`);
console.log(`FEATURE DEMONSTRATION`);
console.log(`${'═'.repeat(62)}\n`);

// Create playlist
console.log(`\n📍 STEP 1: Creating Playlist`);
game.createPlaylist();

// Book venue
console.log(`\n📍 STEP 2: Booking Venue`);
game.bookVenue();

// Perform
console.log(`\n📍 STEP 3: Performing at Venue`);
game.performAtVenue();

// Collaborate with Kerala DJ
console.log(`\n📍 STEP 4: Collaborating with Kerala DJs`);
game.collaborateWithDJ();

// Buy equipment
console.log(`\n📍 STEP 5: Upgrading Equipment`);
game.buyEquipment();

// Special events
console.log(`\n📍 STEP 6: Special Events Available`);
game.bookSpecialEvent();

// Multiplayer battle
console.log(`\n📍 STEP 7: Multiplayer DJ Battle`);
game.startMultiplayer();

// View stats
console.log(`\n📍 STEP 8: Final Statistics & Achievements`);
game.viewStatsAndAchievements();

// Leaderboard
game.viewLeaderboard();

// Save game
console.log(`\n📍 STEP 9: Saving Progress`);
game.saveGame();

console.log(`\n${'═'.repeat(62)}`);
console.log(`🎵 Thanks for playing DJ SIMULATOR 2026! 🎵`);
console.log(`${'═'.repeat(62)}\n`);
