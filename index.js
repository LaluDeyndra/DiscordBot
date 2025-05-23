require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, Events, SlashCommandBuilder, REST, Routes } = require('discord.js');

// Inisialisasi client
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Daftar waifu dan husbando dengan rarity
const waifus = [
  { name: 'Rem', image: 'https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/waifu%20images/rem.jpg?raw=true', rarity: 'Common' },
  { name: 'Zero Two', image: 'https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/waifu%20images/zero%20two.jpeg?raw=true', rarity: 'Legendary' },
  { name: 'Asuna', image: 'https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/waifu%20images/asuna.jpeg?raw=true', rarity: 'Rare' },
  { name: 'Nezuko', image: 'https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/waifu%20images/nezuko.jpg?raw=true', rarity: 'Common' },
  { name: 'Hinata', image: 'https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/waifu%20images/hinata.jpg?raw=true', rarity: 'Epic' },
  { name: 'Yor Forger', image: 'https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/waifu%20images/yor%20forger.jpg?raw=true', rarity: 'Legendary' },
];

const husbandos = [
  { name: 'Levi', image: 'https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/husbandoi%20images/levi.jpg?raw=true', rarity: 'Rare' },
  { name: 'Sasuke', image: 'https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/husbandoi%20images/sasuka.jpg?raw=true', rarity: 'Epic' },
  { name: 'Gojo', image: 'https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/husbandoi%20images/gojo.jpg?raw=true', rarity: 'Legendary' },
  { name: 'Rimuru', image: 'https://github.com/LaluDeyndra/DiscordBot/blob/main/assets/images/husbandoi%20images/rimuru.jpg?raw=true', rarity: 'Common' },
];

// Rarity rate
const rarityChances = {
  Legendary: 5,
  Epic: 15,
  Rare: 30,
  Common: 50,
};

// Fungsi memilih karakter berdasarkan rarity
function getRandomCharacter(pool) {
  const items = [];

  for (const rarity in rarityChances) {
    const chars = pool.filter((c) => c.rarity === rarity);
    for (const char of chars) {
      items.push({
        ...char,
        weight: rarityChances[rarity],
      });
    }
  }

  const totalWeight = items.reduce((sum, c) => sum + c.weight, 0);
  const rand = Math.random() * totalWeight;

  let cumulative = 0;
  for (const item of items) {
    cumulative += item.weight;
    if (rand < cumulative) {
      return item;
    }
  }
}

// Register slash command (sekali deploy cukup)
const commands = [
  new SlashCommandBuilder()
    .setName('gacha')
    .setDescription('Gacha waifu atau husbando')
    .addStringOption((option) => option.setName('tipe').setDescription('Pilih waifu atau husbando').setRequired(true).addChoices({ name: 'Waifu 💗', value: 'waifu' }, { name: 'Husbando 🔥', value: 'husbando' })),
  new SlashCommandBuilder().setName('gachahelp').setDescription('Tampilkan bantuan tentang bot'),
].map((command) => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Deploy command ke Discord
(async () => {
  try {
    console.log('🔁 Sedang register perintah...');
    await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: commands });
    console.log('✅ Perintah berhasil diregistrasi.');
  } catch (error) {
    console.error('❌ Error register command:', error);
  }
})();

// Event ketika bot siap
client.once(Events.ClientReady, () => {
  console.log(`🤖 Bot aktif sebagai ${client.user.tag}`);
});

// Handle command
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'gacha') {
    const tipe = interaction.options.getString('tipe');
    const pool = tipe === 'husbando' ? husbandos : waifus;
    const result = getRandomCharacter(pool);

    // Warna berdasarkan rarity
    const rarityColors = {
      Common: '#A0A0A0',
      Rare: '#3B82F6',
      Epic: '#9333EA',
      Legendary: '#F59E0B',
    };

    const embed = new EmbedBuilder()
      .setColor(rarityColors[result.rarity] || '#FFFFFF')
      .setTitle(`🎉 ${interaction.user.username} dapat: ${result.name}`)
      .addFields({ name: '🌟 Rarity', value: result.rarity, inline: true })
      .setImage(result.image)
      .setFooter({ text: 'Waifu Gacha Bot © 2025' });

    await interaction.reply({ embeds: [embed] });
  } else if (commandName === 'gachahelp') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#00BFFF')
      .setTitle('📖 Bantuan Waifu Gacha Bot')
      .setDescription('Gunakan `/gacha` untuk memutar gacha waifu atau husbando!\n\nRarity tersedia:\n- 😑 Common\n- 😐 Rare\n- 🙂 Epic\n- 😁 Legendary')
      .addFields({ name: '/gacha', value: '🎲 Gacha acak waifu atau husbando (pilih salah satu)' }, { name: '/gachahelp', value: '📚 Menampilkan pesan bantuan ini' })
      .setFooter({ text: 'Waifu Gacha Bot © 2025' });

    await interaction.reply({ embeds: [helpEmbed] });
  }
});

// Login bot
client.login(process.env.DISCORD_TOKEN);
