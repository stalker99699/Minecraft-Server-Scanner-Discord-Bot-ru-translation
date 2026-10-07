// Импорты
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getDescription, thousandsSeparators, cleanIp, displayPlayers } = require('../lib.js')
const config = require('../config.json')
const buttonTimeout = 60;

function timeSinceDate(date1) {
  if (date1 == null) {
    date1 = new Date();
  }
  var date2 = new Date();
  var date1Total = date1.getSeconds() + date1.getMinutes() * 60 + date1.getHours() * 3600 + date1.getDay() * 86400;
  var date2Total = date2.getSeconds() + date2.getMinutes() * 60 + date2.getHours() * 3600 + date2.getDay() * 86400;

  return date2Total - date1Total;
}

function createEmbed(server, currentEmbed, totalResults) {
  let description;
  try {
    description = JSON.parse(server.rawDescription);
  } catch (err) {
    description = server.description;
  }
  const newEmbed = new EmbedBuilder()
    .setColor("#02a337")
    .setTitle(`Сервер ${thousandsSeparators(currentEmbed + 1)}/${thousandsSeparators(totalResults)}`)
    .setAuthor({ name: 'Сканер MC-серверов', iconURL: 'https://cdn.discordapp.com/app-icons/1037250630475059211/21d5f60c4d2568eb3af4f7aec3dbdde5.png' })
    .addFields(
      { name: 'IP', value: cleanIp(parseInt(server.ip)) },
      { name: 'Порт', value: String(server.port) },
      { name: 'Версия', value: `${server.version.name} (${server.version.protocol})` },
      { name: 'Описание', value: getDescription(description) },
      { name: 'Игроки', value: displayPlayers(server) },
      { name: 'Обнаружен', value: `<t:${server.discovered}:${(new Date().getTime() / 1000) - server.discovered > 86400 ? 'D' : 'R'}>`},
      { name: 'Последний раз виден', value: `<t:${server.lastSeen}:${(new Date().getTime() / 1000) - server.lastSeen > 86400 ? 'D' : 'R'}>` }
    )
    .setTimestamp();

  if (server.geo?.country == null) newEmbed.addFields({ name: 'Страна: ', value: 'Неизвестно' })
  else newEmbed.addFields({ name: 'Страна: ', value: `:flag_${server.geo.country.toLowerCase()}: ${server.geo.country}` })
  
  if (server.org == null) newEmbed.addFields({ name: 'Организация: ', value: 'Неизвестно' });
  else newEmbed.addFields({ name: 'Организация: ', value: server.org });

  newEmbed.addFields({ name: 'Аутентификация', value: server.cracked == true ? 'Пиратская' : server.cracked == false ? 'Премиум' : 'Неизвестно' });
  newEmbed.addFields({ name: 'Белый список', value: server.whitelisted == true ? 'Включён' : server.whitelisted == false ? 'Отключён' : 'Неизвестно' });
  return newEmbed;
}

module.exports = {
  // Определяет команду 'random'
  data: new SlashCommandBuilder()
    .setName('random')
	  .setDescription('Получает случайный онлайн-сервер Java Edition'),
  async execute(interaction, buttonCallbacks, client, totalServers, setTotalServers, totalBedrock, updateTotalBedrock, recentServers) {
    if (interaction.isChatInputCommand()) await interaction.deferReply();
    else await interaction.deferUpdate();
    const user = interaction.user;
    var lastButtonPress = new Date();
    const randomizeID = `randomize${interaction.user.id}`;
    const oldPlayersID = `oldPlayers${interaction.user.id}`;
    // Сообщение о статусе
    const interactionReplyMessage = await interaction.editReply({ content: 'Получаю сервер, подождите...', embeds: [], components: [] });
    
    // Получает случайный сервер из базы данных
    if (recentServers == null) recentServers = (await (await fetch(`${config.api}/count?seenAfter=${Math.round(new Date().getTime() / 1000) - 3600}`)).json()).data;
    var index = Math.floor((Math.random() * recentServers));
    const server = (await (await fetch(`${config.api}/servers?limit=1&skip=${index}&seenAfter=${Math.round(new Date().getTime() / 1000) - 3600}`)).json()).data[0];
    let playerList;
    
    if (server == null) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Не найдено недавних серверов')
        .setAuthor({ name: 'Сканер MC-серверов', iconURL: 'https://cdn.discordapp.com/app-icons/1037250630475059211/21d5f60c4d2568eb3af4f7aec3dbdde5.png' })
        .setDescription('Это баг, пожалуйста, напишите @cornbread2100 в официальном сервере поддержки (https://discord.gg/3u2fNRAMAN)')
      await interaction.editReply({ content: '', embeds: [embed] });
      return;
    }

    const hasOldPlayers = server.players.hasPlayerSample;
    var showingOldPlayers = true;

    var buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(randomizeID)
          .setLabel('↻')
          .setStyle(ButtonStyle.Primary)
      )
    if (hasOldPlayers) {
      buttons.addComponents(
        new ButtonBuilder()
          .setCustomId(oldPlayersID)
          .setLabel('Показать игроков')
          .setStyle(ButtonStyle.Primary)
      )
    }
    
    var embed = createEmbed(server, index, recentServers);
    await interaction.editReply({ content: '', embeds: [embed], components: [buttons] });

    buttonCallbacks[randomizeID] = async interaction => module.exports.execute(interaction, buttonCallbacks, client, totalServers, setTotalServers, recentServers);

    buttonCallbacks[oldPlayersID] = async interaction => {
      if (interaction.user.id != user.id) return interaction.reply({ content: 'Это команда другого пользователя, используйте /random, чтобы создать свою', ephemeral: true });
      embed.data.fields[4].value =  `${server.players.online}/${server.players.max}\nЗагрузка игроков...`;
      buttons.components[0].data.disabled = true;
      buttons.components[1].data.disabled = true;
      await interaction.update({ content: '', embeds: [embed], components: [buttons] });
      if (playerList == null) playerList = (await (await fetch(`${config.api}/servers?includePlayers=true&ip=${server.ip}&port=${server.port}`)).json()).data.playerHistory;
      lastButtonPress = new Date();
      showingOldPlayers = !showingOldPlayers;
      buttons.components[1].data.label = showingOldPlayers ? 'Игроки онлайн' : 'История игроков';
      embed.data.fields[4].value = displayPlayers(server, playerList, showingOldPlayers);
      buttons.components[0].data.disabled = false;
      buttons.components[1].data.disabled = false;
      await interaction.editReply({ content: '', embeds: [embed], components: [buttons] });
    };
    
    
    // Отключает кнопки после нескольких секунд неактивности (задано в переменной buttonTimeout)
    async function buttonTimeoutCheck() {
      if (timeSinceDate(lastButtonPress) >= buttonTimeout) {
        var buttons = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(randomizeID)
              .setLabel('↻')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true)
            )
        if (hasOldPlayers) {
          buttons.addComponents(
            new ButtonBuilder()
              .setCustomId(oldPlayersID)
              .setLabel(showingOldPlayers ? 'Игроки онлайн' : 'История игроков')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true)
            )
        }
        await interactionReplyMessage.edit({ components: [buttons] });
      } else setTimeout(function() { buttonTimeoutCheck() }, 500);
    }
    buttonTimeoutCheck();
  }
}
