require('dotenv').config(); // Import dotenv

const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

const commands = [
  new SlashCommandBuilder()
    .setName('gacha')
    .setDescription('Gacha waifu atau husbando')
    .addStringOption((option) => option.setName('tipe').setDescription('Pilih waifu atau husbando').setRequired(true).addChoices({ name: 'Waifu 💗', value: 'waifu' }, { name: 'Husbando 🔥', value: 'husbando' })),
  new SlashCommandBuilder().setName('gachahelp').setDescription('Tampilkan bantuan tentang bot'),
].map((command) => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('🚀 Deploying slash commands...');
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log('✅ Commands deployed!');
  } catch (error) {
    console.error(error);
  }
})();
