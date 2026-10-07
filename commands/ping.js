const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getDescription, getVersion } = require('../lib.js');

function createEmbed(server, ip, port) {
  const newEmbed = new EmbedBuilder()
    .setColor("#02a337")
    .setTitle(`${ip}${port == 25565 ? '' : `:${port}`}`)
    .setAuthor({ name: 'Сканер MC-серверов', iconURL: 'https://cdn.discordapp.com/app-icons/1037250630475059211/21d5f60c4d2568eb3af4f7aec3dbdde5.png' })
    .setThumbnail(`https://ping.cornbread2100.com/favicon?ip=${ip}&port=${port}&errors=false`)
    .addFields(
      { name: 'Версия', value: `${getVersion(server.version)} (${server.version.protocol})` },
      { name: 'Описание', value: getDescription(server.description) }
    )
    .setTimestamp();
  
  var playersString = `${server.players.online}/${server.players.max}`;
  if (server.players.sample != null && server.players.sample.length > 0) {
    playersString += '\n```\n';
    var oldString;
    for (var i = 0; i < server.players.sample.length; i++) {
      oldString = playersString;
      playersString += `\n${server.players.sample[i].name}\n${server.players.sample[i].id}`;
      if (i + 1 < server.players.sample.length) playersString += '\n';
      if (playersString.length > 1024) {
        playersString = oldString;
        break;
      }
    }
    playersString += '```';
  }
  newEmbed.addFields({ name: 'Игроки', value: playersString })

  return newEmbed;
}

module.exports = {
  // Параметры команды
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Получает информацию с указанного сервера Minecraft')
    .addStringOption(option =>
      option.setName('ip')
	    .setDescription('IP-адрес сервера для пинга')
      .setRequired(true))
    .addIntegerOption(option =>
      option.setName('port')
	    .setDescription('Порт сервера для пинга')),
    async execute(interaction) {
      const ip = interaction.options.getInteger('port') == null ? interaction.options.getString('ip').split(':')[0] : interaction.options.getString('ip');
      const port = interaction.options.getInteger('port') == null ? interaction.options.getString('ip').split(':')[1] || 25565 : interaction.options.getInteger('port');
      await interaction.reply(`Пингую \`${ip}${port == 25565 ? '' : `:${port}`}\`, подождите...`);

      const text = await (await fetch(`https://ping.cornbread2100.com/ping?ip=${ip}&port=${port}`)).text();
      if (text == 'Error: timeout') {
        var errorEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .addFields({ name: 'Тайм-аут', value: 'Если вы знаете, что этот сервер онлайн, напишите @cornbread2100 в официальном сервере поддержки (https://discord.gg/3u2fNRAMAN)' })
        interaction.editReply({ content: '', embeds: [errorEmbed] })
      } else if (text.startsWith('Error: ')) {
        var errorEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .addFields({ name: 'Ошибка', value: text.substring(7) })
        interaction.editReply({ content: '', embeds: [errorEmbed] })
      } else {
        response = JSON.parse(text);
        var newEmbed = createEmbed(response, ip, port);
        await interaction.editReply({ content: '', embeds: [newEmbed] });
      }
    }
}
