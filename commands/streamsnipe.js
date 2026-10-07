// Загружает зависимости и инициализирует переменные
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getDescription, getVersion, cleanIp, displayPlayers } = require('../lib.js');
const config = require('../config.json');
const languages = require('../languages.json');
const { buttonHandler } = require('./search.js');

let results;
process.on('message', (message) => {
    switch (message.type) {
        case 'streamsnipes': {
            results = message.results;
            break;
        }
    }
});


function createEmbed(servers, index, showingOldPlayers) {
    let server = servers[index];
    let description;
    try {
        description = JSON.parse(server.rawDescription);
    } catch (err) {
        description = server.description;
    }
    const embed = new EmbedBuilder()
        .setColor('#02a337')
        .setTitle(`${cleanIp(server.ip)}${server.port == 25565 ? '' : `:${server.port}`}`)
        .setAuthor({ name: 'Сканер MC-серверов', iconURL: 'https://cdn.discordapp.com/app-icons/1037250630475059211/21d5f60c4d2568eb3af4f7aec3dbdde5.png' })
        // .setThumbnail(`https://ping.cornbread2100.com/favicon?ip=${server.ip}&port=${server.port}&errors=false`) // похоже, Discord ждёт несколько секунд, пока он загрузится, прежде чем вообще показать эмбед, что раздражает при прокрутке. Может, я могу отправить их все куда-нибудь, чтобы заставить Discord закешировать их?
        .addFields(
            { name: 'Версия', value: `${server.version.name} (${server.version.protocol})` },
            { name: 'Описание', value: String(getDescription(description)) || '​' },
            { name: 'Игроки', value: displayPlayers(server, server.playerHistory, showingOldPlayers) },
            { name: 'Обнаружен', value: `<t:${server.discovered}:${(new Date().getTime() / 1000) - server.discovered > 86400 ? 'D' : 'R'}>`},
            { name: 'Последний раз виден', value: `<t:${server.lastSeen}:${(new Date().getTime() / 1000) - server.lastSeen > 86400 ? 'D' : 'R'}>` },
            { name: 'Страна', value: `${server.geo.country == null ? 'Неизвестно' : `:flag_${server.geo.country.toLowerCase()}: ${server.geo.country}`}` },
            { name: 'Организация', value: server.org == null ? 'Неизвестно' : server.org },
            { name: 'Аутентификация', value: server.cracked == true ? 'Пиратская' : server.cracked == false ? 'Премиум' : 'Неизвестно' },
            { name: 'Белый список', value: server.whitelisted == true ? 'Включён' : server.whitelisted == false ? 'Отключён' : 'Неизвестно' },
            { name: 'Стримы', value: server.streams.map(stream => `https://www.twitch.tv/${stream.user_name} (${languages.find(a => a.value == stream.language).name})`).join('\n') }
        )
        .setImage(server.streams[0].thumbnail_url.replace('{width}', config.commands.streamsnipe.thumbnailResolution.width).replace('{height}', config.commands.streamsnipe.thumbnailResolution.height))
        .setFooter({ text: `${(index + 1).toLocaleString()}/${servers.length.toLocaleString()}` });

    return embed;
}

function createButtons(index, pages, server, showingOldPlayers, language, user) {
    let buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`streamsnipe-page-${user};${index - 1};${language};false`)
                .setLabel('◀')
                .setStyle(pages ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(!pages),
            new ButtonBuilder()
                .setCustomId(`streamsnipe-page-${user};${index + 1};${language};false`)
                .setLabel('▶')
                .setStyle(pages ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(!pages)
        )
    if (server?.playerHistory?.length > 0) {
        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId(`streamsnipe-page-${user};${index};${language};${!showingOldPlayers}`)
                .setLabel(showingOldPlayers ? 'Игроки онлайн' : 'История игроков')
                .setStyle(ButtonStyle.Secondary)
        )
    }
    let apiButton = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('API')
                .setStyle(ButtonStyle.Link)
                .setURL(`${config.displayApi || config.api}/streamsnipe${language == null ? '' : `?language=${language}`}`)
        )
    return [buttons, apiButton];
}

async function getServer(language, index, interaction, user, showingOldPlayers) {
    if (results == null) {
        await interaction.editReply({ embeds: [new EmbedBuilder().setColor('#02a337').setDescription(`Поиск серверов...`)], components: createButtons(0) });
        while (results == null) await new Promise(res => setTimeout(res, 100));
    }
    if (results.length == 0) return await interaction.editReply({ embeds: [new EmbedBuilder().setColor('#ff0000').setDescription(`Серверы стримеров не найдены.`)]});

    let filteredResults = results;
    if (language != null) filteredResults = filteredResults.filter(a => a.streams.some(b => b.language == language));
    if (filteredResults.length == 0) return await interaction.editReply({ embeds: [new EmbedBuilder().setColor('#ff0000').setDescription('Не найдено серверов, стримящих на этом языке.')]});

    while (index >= filteredResults.length) index -= filteredResults.length;
    while (index < 0) index += filteredResults.length;

    embed = createEmbed(filteredResults, index, showingOldPlayers);
    buttons = createButtons(index, filteredResults.length > 1, filteredResults[index], showingOldPlayers, language, user);
    await interaction.editReply({ embeds: [embed], components: buttons });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('streamsnipe')
        .setDescription('Ищет серверы Twitch-стримеров')
        .addStringOption(option =>
            option
                .setName('language')
                .setDescription('Язык стрима')
                .setAutocomplete(true)),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const filtered = languages.filter(choice => choice.name.toLowerCase().includes(focusedValue.toLowerCase())).splice(0, 25);
        await interaction.respond(filtered.map(choice => ({ name: choice.name, value: choice.value })));
    },
    async buttonHandler(interaction) {
        const [command, id, ...content] = interaction.customId.split('-');
        switch (id) {
            case 'page': {
                let [user, index, language, showingOldPlayers] = content.join('-').split(';');
                index = parseInt(index);
                if (language == 'null') language = null;
                showingOldPlayers = showingOldPlayers == 'true';
                if (interaction.user.id != user) return interaction.reply({ content: 'Это команда другого пользователя, используйте /streamsnipe, чтобы создать свою', ephemeral: true });
                await interaction.deferUpdate();
                getServer(language, index, interaction, user, showingOldPlayers);
                break;
            }
        }
    },
    async execute(interaction, buttonCallbacks) {
        await interaction.deferReply();

        let language = interaction.options.getString('language');
        if (language != null && languages.find(a => a.value == language) == null) {
            let backup = languages.find(a => a.name.toLowerCase() == language.toLowerCase());
            if (backup == null) return await interaction.editReply({ embeds: [new EmbedBuilder().setColor('#ff0000').setDescription(`Неизвестный язык "${language}". Пожалуйста, используйте один из вариантов автодополнения.`)]});
            else language = backup.value;
        }

        await getServer(language, 0, interaction, interaction.user.id, false);
    }
}
