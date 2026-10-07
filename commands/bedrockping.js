const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getDescription, getVersion } = require('../lib.js');

module.exports = {
  // Параметры команды
  data: new SlashCommandBuilder()
    .setName('bedrockping')
    .setDescription('Получает информацию с указанного сервера Minecraft Bedrock')
    .addStringOption(option =>
      option.setName('ip')
	    .setDescription('IP-адрес 1 для пинга')
      .setRequired(true))
    .addIntegerOption(option =>
      option.setName('port')
	    .setDescription('Порт сервера для пинга')),
    async execute(interaction) {
      const ip = interaction.options.getString('ip');
      const port = interaction.options.getInteger('port') || 19132;
      await interaction.reply(`Пингую \`${ip}${port == 19132 ? '' : `:${port}`}\`, подождите...`);

      try {
        const text = await (await fetch(`https://ping.cornbread2100.com/bedrockping?ip=${ip}&port=${port}`)).text();
        if (text == 'timeout') {
          var errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .addFields({ name: 'Ошибка', value: 'Тайм-аут (сервер офлайн?)' })
          interaction.editReply({ content: '', embeds: [errorEmbed] })
        } else {
          response = text.split(';');
          var newEmbed = new EmbedBuilder()
            .setColor('#02a337')
            .setTitle(`${ip}${port == 19132 ? '' : `:${port}`}`)
            .setAuthor({ name: 'Сканер MC-серверов', iconURL: 'https://cdn.discordapp.com/app-icons/1037250630475059211/21d5f60c4d2568eb3af4f7aec3dbdde5.png'})
            .addFields(
              { name: 'Версия', value: `${getVersion(response[3])} (${response[2]})` },
              { name: 'Описание', value: `${getDescription(response[1])}\n\n${getDescription(response[7])}` },
              { name: 'Игроки', value: `${response[4]}/${response[5]}` },
              { name: 'Режим игры', value: `${response[8]} (${response[9]})` },
              { name: 'Образовательная версия', value: response[0] == 'MCEE' ? 'Да' : 'Нет' }
            )
            .setTimestamp()
          await interaction.editReply({ content: '', embeds: [newEmbed] });
        }
      } catch (error) {
        console.log(error);
        var errorEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .addFields({ name: 'Ошибка', value: error.toString() })
        interaction.editReply({ content: '', embeds: [errorEmbed] })
      }
    }
}
