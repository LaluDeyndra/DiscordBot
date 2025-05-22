require('dotenv').config(); // Tambahkan ini di paling atas
const { Client, GatewayIntentBits, EmbedBuilder, Events } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Data waifu dan husbando
const waifus = [
  { name: 'Rem ', image: 'https://i.imgur.com/waifu1.jpg' },
  { name: 'Zero Two ', image: 'https://i.imgur.com/waifu2.jpg' },
  { name: 'Asuna ', image: 'https://i.imgur.com/waifu3.jpg' },
  { name: 'Nezuko ', image: 'https://i.imgur.com/waifu4.jpg' },
  { name: 'Hinata ', image: 'https://i.imgur.com/waifu5.jpg' },
  { name: 'Yor Forger ', image: 'https://i.imgur.com/waifu6.jpg' },
];

const husbandos = [
  { name: 'Levi ', image: 'https://i.imgur.com/husbando1.jpg' },
  { name: 'Sasuke ', image: 'https://i.imgur.com/husbando2.jpg' },
  { name: 'Gojo ', image: 'https://i.imgur.com/husbando3.jpg' },
  { name: 'Rimuru ', image: 'https://i.imgur.com/husbando4.jpg' },
];

client.once(Events.ClientReady, () => {
  console.log(`🤖 Bot aktif sebagai ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'gacha') {
    const tipe = interaction.options.getString('tipe');
    const pool = tipe === 'husbando' ? husbandos : waifus;
    const result = pool[Math.floor(Math.random() * pool.length)];

    const embed = new EmbedBuilder()
      .setColor(tipe === 'husbando' ? '#1E90FF' : '#FF69B4')
      .setTitle(`🎉 Kamu dapat: ${result.name}`)
      .setImage(result.image)
      .setFooter({ text: 'Waifu Gacha Bot © 2025' });

    await interaction.reply({ embeds: [embed] });
  } else if (commandName === 'gachahelp') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('📖 Bantuan Waifu Gacha Bot')
      .setDescription('Daftar perintah yang tersedia:')
      .addFields({ name: '/gacha', value: '🎲 Gacha acak waifu atau husbando (pilih salah satu)' }, { name: '/gachahelp', value: '📚 Menampilkan pesan bantuan ini' })
      .setFooter({ text: 'Waifu Gacha Bot © 2025' });

    await interaction.reply({ embeds: [helpEmbed] });
  }
});

// 🔒 Gunakan token dari file .env
client.login(process.env.DISCORD_TOKEN);
