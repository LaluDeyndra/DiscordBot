require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, Events, SlashCommandBuilder, REST, Routes } = require('discord.js');
// Initialize client
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Enhanced character database with more attributes
const waifus = [
  { name: 'Rem', image: 'https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/waifu%20images/rem.jpg?raw=true', rarity: 'Common', series: 'Re:Zero', quote: 'I love you from the bottom of my heart!' },
  { name: 'Zero Two', image: 'https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/waifu%20images/zero%20two.jpg?raw=true', rarity: 'Legendary', series: 'Darling in the Franxx', quote: 'Darling!' },
  { name: 'Asuna', image: 'https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/waifu%20images/asuna.jpg?raw=true', rarity: 'Rare', series: 'Sword Art Online', quote: "I'll always be with you." },
  { name: 'Nezuko', image: 'https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/waifu%20images/nezuko.jpg?raw=true', rarity: 'Common', series: 'Demon Slayer', quote: 'Mmph!' },
  { name: 'Hinata', image: 'https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/waifu%20images/hinata.jpg?raw=true', rarity: 'Epic', series: 'Naruto', quote: "I've loved you all along, Naruto!" },
  { name: 'Yor Forger', image: 'https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/waifu%20images/yor%20forger.jpg?raw=true', rarity: 'Legendary', series: 'Spy x Family', quote: "I'll protect my family at all costs." },
  { name: 'Yor Forger (Special Ver.)', image: 'https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/waifu%20images/yor.jpg?raw=true', rarity: 'Mythic', series: 'Spy x Family', quote: 'Even assassins deserve love.' },
];

const husbandos = [
  { name: 'Levi Ackerman', image: 'https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/husbandoi%20images/levi.jpg?raw=true', rarity: 'Rare', series: 'Attack on Titan', quote: 'Give up on your dreams and die.' },
  {
    name: 'Sasuke Uchiha',
    image: 'https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/husbandoi%20images/sasuka.jpg?raw=true',
    rarity: 'Epic',
    series: 'Naruto',
    quote: "I hate a lot of things, and I don't particularly like anything.",
  },
  {
    name: 'Gojo Satoru',
    image: 'https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/husbandoi%20images/gojo.jpg?raw=true',
    rarity: 'Legendary',
    series: 'Jujutsu Kaisen',
    quote: 'Throughout Heaven and Earth, I alone am the honored one.',
  },
  {
    name: 'Rimuru Tempest',
    image: 'https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/husbandoi%20images/rimuru.jpg?raw=true',
    rarity: 'Common',
    series: 'That Time I Got Reincarnated as a Slime',
    quote: "Let's all get along!",
  },
];

// Enhanced rarity system with visual indicators
const rarityData = {
  Mythic: { chance: 0.5, color: '#c40e04', emoji: '💎', multiplier: 10 },
  Legendary: { chance: 3, color: '#FFD700', emoji: '✨', multiplier: 5 },
  Epic: { chance: 10, color: '#9932CC', emoji: '🔥', multiplier: 3 },
  Rare: { chance: 25, color: '#4169E1', emoji: '⭐', multiplier: 2 },
  Common: { chance: 61.5, color: '#C0C0C0', emoji: '⚪', multiplier: 1 },
};

// User collection tracking
const userCollections = new Map();

// Gacha animation messages
const gachaMessages = ['Rolling the gacha...', 'Summoning the waifu/husbando...', "Pulling with your heart's desire...", 'The gacha gods are deciding...', 'Will you get lucky this time?'];

// Special effects for rare pulls
const specialEffects = {
  Mythic: 'https://media.giphy.com/media/3o7abKhK8ErT1k3zU4/giphy.gif',
  Legendary: 'https://media.giphy.com/media/3o7abKhK8ErT1k3zU4/giphy.gif',
  Epic: 'https://media.giphy.com/media/3o7abKhK8ErT1k3zU4/giphy.gif',
};

// Enhanced gacha function with animation simulation
async function performGacha(interaction, pool) {
  // Send initial message with random gacha message
  const loadingMsg = gachaMessages[Math.floor(Math.random() * gachaMessages.length)];
  await interaction.reply({ content: `${loadingMsg} ${rarityData.Mythic.emoji}` });

  // Simulate gacha animation delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const result = getRandomCharacter(pool);
  return result;
}

// Enhanced random character selection
function getRandomCharacter(pool) {
  const roll = Math.random() * 100;
  let cumulative = 0;

  for (const [rarity, data] of Object.entries(rarityData)) {
    cumulative += data.chance;
    if (roll <= cumulative) {
      const availableChars = pool.filter((c) => c.rarity === rarity);
      if (availableChars.length > 0) {
        return {
          ...availableChars[Math.floor(Math.random() * availableChars.length)],
          pullValue: data.multiplier,
        };
      }
    }
  }

  // Fallback to common if no characters found for the rolled rarity
  const commons = pool.filter((c) => c.rarity === 'Common');
  return {
    ...commons[Math.floor(Math.random() * commons.length)],
    pullValue: 1,
  };
}

// Track user collection
function updateUserCollection(userId, character, type) {
  if (!userCollections.has(userId)) {
    userCollections.set(userId, {
      waifu: new Map(),
      husbando: new Map(),
      totalPulls: 0,
      points: 0,
    });
  }

  const userData = userCollections.get(userId);
  userData.totalPulls++;
  userData.points += character.pullValue;

  // Pilih koleksi sesuai tipe
  const collection = type === 'husbando' ? userData.husbando : userData.waifu;

  if (!collection.has(character.name)) {
    collection.set(character.name, {
      count: 1,
      firstObtained: new Date(),
      rarity: character.rarity,
    });
  } else {
    const charData = collection.get(character.name);
    charData.count++;
  }

  return userData;
}

// Register slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('gacha')
    .setDescription('Pull for a waifu or husbando')
    .addStringOption((option) => option.setName('type').setDescription('Choose waifu or husbando').setRequired(true).addChoices({ name: 'Waifu 💗', value: 'waifu' }, { name: 'Husbando 🔥', value: 'husbando' })),
  new SlashCommandBuilder()
    .setName('collection')
    .setDescription('View your gacha collection')
    .addUserOption((option) => option.setName('user').setDescription("View another user's collection (optional)").setRequired(false)),
  new SlashCommandBuilder().setName('gacha-stats').setDescription('View your gacha statistics'),
  new SlashCommandBuilder().setName('gacha-leaderboard').setDescription('View top collectors'),
  new SlashCommandBuilder().setName('gacha-help').setDescription('Get help with gacha commands'),
].map((command) => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Deploy commands
(async () => {
  try {
    console.log('Registering commands...');
    await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: commands });
    console.log('Commands registered successfully.');
  } catch (error) {
    console.error('❌ Command registration error:', error);
  }
})();

// Bot ready event
client.once(Events.ClientReady, () => {
  console.log(`Bot ready as ${client.user.tag}`);
});

// Command handling
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    const { commandName, user } = interaction;

    if (commandName === 'gacha') {
      const type = interaction.options.getString('type');
      const pool = type === 'husbando' ? husbandos : waifus;

      const result = await performGacha(interaction, pool);
      const userData = updateUserCollection(user.id, result, type);

      // Pilih koleksi sesuai tipe
      const collection = type === 'husbando' ? userData.husbando : userData.waifu;

      // Create enhanced embed
      const embed = new EmbedBuilder()
        .setColor(rarityData[result.rarity].color)
        .setTitle(`${rarityData[result.rarity].emoji} ${result.name} ${rarityData[result.rarity].emoji}`)
        .setDescription(`"${result.quote}"`)
        .addFields(
          { name: '🌟 Rarity', value: `${result.rarity} (x${result.pullValue} points)`, inline: true },
          { name: '📺 Series', value: result.series, inline: true },
          { name: '📊 Your Stats', value: `Pulls: ${userData.totalPulls} | Points: ${userData.points}`, inline: false }
        )
        .setImage(result.image)
        .setFooter({ text: `Collection: ${collection.size}/${pool.length} | ${user.username}'s pull #${userData.totalPulls}` });

      // Add special effect for rare pulls
      if (specialEffects[result.rarity]) {
        embed.setThumbnail(specialEffects[result.rarity]);
      }

      await interaction.editReply({ content: null, embeds: [embed] });
    } else if (commandName === 'collection') {
      const targetUser = interaction.options.getUser('user') || user;
      const userData = userCollections.get(targetUser.id) || {
        waifu: new Map(),
        husbando: new Map(),
        totalPulls: 0,
        points: 0,
      };

      // Gabungkan waifu dan husbando
      const allCollection = new Map([...userData.waifu, ...userData.husbando]);
      const pool = [...waifus, ...husbandos];
      const collected = Array.from(allCollection.entries()).sort((a, b) => rarityData[b[1].rarity].multiplier - rarityData[a[1].rarity].multiplier);

      const embed = new EmbedBuilder()
        .setColor('#00BFFF')
        .setTitle(`${targetUser.username}'s Collection`)
        .setDescription(`📊 **${allCollection.size}/${pool.length}** characters collected\n✨ **${userData.points}** total points`)
        .setThumbnail(targetUser.displayAvatarURL());

      // Add top 5 rarest characters
      if (collected.length > 0) {
        embed.addFields({
          name: '🌟 Top 5 Rarest',
          value: collected
            .slice(0, 5)
            .map(([name, data]) => `${rarityData[data.rarity].emoji} ${name} (x${data.count})`)
            .join('\n'),
        });
      }

      await interaction.reply({ embeds: [embed] });
    } else if (commandName === 'gacha-stats') {
      const userData = userCollections.get(user.id) || {
        waifu: new Map(),
        husbando: new Map(),
        totalPulls: 0,
        points: 0,
      };

      const pool = [...waifus, ...husbandos];
      const allCollection = new Map([...userData.waifu, ...userData.husbando]);
      const embed = new EmbedBuilder()
        .setColor('#FF69B4')
        .setTitle(`${user.username}'s Gacha Stats`)
        .addFields(
          { name: '🎫 Total Pulls', value: userData.totalPulls.toString(), inline: true },
          { name: '✨ Total Points', value: userData.points.toString(), inline: true },
          { name: '📚 Collection', value: `${allCollection.size}/${pool.length}`, inline: true }
        );

      await interaction.reply({ embeds: [embed] });
    } else if (commandName === 'gacha-leaderboard') {
      const sortedUsers = Array.from(userCollections.entries())
        .sort((a, b) => b[1].points - a[1].points)
        .slice(0, 10);

      const embed = new EmbedBuilder().setColor('#FFD700').setTitle('🏆 Gacha Leaderboard').setDescription('Top 10 collectors by points');

      if (sortedUsers.length > 0) {
        embed.addFields({
          name: 'Rankings',
          value: sortedUsers
            .map(([id, data], index) => {
              const allCollection = new Map([...data.waifu, ...data.husbando]);
              return `${['🥇', '🥈', '🥉'][index] || `🏅`} <@${id}> - ${data.points}pts (${allCollection.size} chars)`;
            })
            .join('\n'),
        });
      } else {
        embed.setDescription('No data yet. Be the first to pull with `/gacha`!');
      }

      await interaction.reply({ embeds: [embed] });
    } else if (commandName === 'gacha-help') {
      const helpEmbed = new EmbedBuilder()
        .setColor('#FF69B4') // Pink color theme
        .setTitle('🌸 **Waifu/Husbando Gacha Help** 🌸')
        .setDescription("Welcome to the ultimate anime character gacha experience! Here's how to use the bot:")
        .setThumbnail('https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/waifu%20images/anime%20icon.jpeg?raw=true')
        .addFields(
          {
            name: '🎰 **Gacha Commands**',
            value: '```/gacha [waifu/husbando]```Pull a random character with awesome animations!',
            inline: false,
          },
          {
            name: '📚 **Collection & Stats**',
            value: "```/collection [user]```View your (or someone else's) collected characters\n" + '```/gacha-stats```Check your gacha statistics\n' + '```/gacha-leaderboard```See top collectors',
            inline: false,
          },
          {
            name: '🌟 **Rarity System**',
            value:
              '```💎 Mythic (0.5%)```Ultra rare special versions!\n' +
              '```✨ Legendary (3%)```Powerful and beautiful!\n' +
              '```🔥 Epic (10%)```Strong characters\n' +
              '```⭐ Rare (25%)```Good finds\n' +
              '```⚪ Common (61.5%)```Standard pulls',
            inline: false,
          },
          {
            name: '🎯 **Game Mechanics**',
            value:
              '• Each pull gives you points based on rarity\n' +
              '• Collect all characters to complete your gallery\n' +
              '• Special animations for rare pulls!\n' +
              '• Compete with friends on the leaderboard\n' +
              '• /gachahelp has been moved to /gacha-help',
            inline: false,
          },
          {
            name: '📄 Terms and Privacy Policy',
            value: '[• Read Terms and Privacy Policy](https://laludeyndra.github.io/DiscordBot/)',
            inline: false,
          }
        )
        .setImage('https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/waifu%20images/yor.jpg?raw=true')
        .setFooter({
          text: 'Gacha Bot v2.0 | Collect them all!',
          iconURL: 'https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/waifu%20images/anime%20icon.jpeg?raw=true',
        });

      await interaction.reply({
        embeds: [helpEmbed],
        ephemeral: true, // Only visible to the user who requested
      });
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
    await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
  }
});

// Login
client.login(process.env.DISCORD_TOKEN);
