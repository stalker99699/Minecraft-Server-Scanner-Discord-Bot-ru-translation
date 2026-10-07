// Импорты
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { thousandsSeparators } = require('../lib.js');
const config = require('../config.json');

module.exports = {
    // Настраивает команду
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Отправляет полезную информацию о боте'),
    async execute(interaction, buttonCallbacks, client, totalServers, updateTotalServers, totalBedrock, updateTotalBedrock) {
        if (!config.discord.stats) return await interaction.reply({ content: 'Статистика отключена на этом боте.', ephemeral: true });
        await interaction.reply({ content: 'Получение статистики...', ephemeral: true });

        if (totalServers == null) {
            totalServers = (await (await fetch(`${config.api}/count`)).json()).data;
            updateTotalServers(totalServers);
        }

        if (totalBedrock == null) {
            totalBedrock = (await (await fetch(`${config.api}/bedrockCount`)).json()).data;
            updateTotalServers(totalBedrock);
        }

        const newEmbed = new EmbedBuilder()
            .setColor("#02a337")
            .setTitle('Статистика')
            .setAuthor({ name: 'Сканер MC-серверов', iconURL: 'https://cdn.discordapp.com/app-icons/1037250630475059211/21d5f60c4d2568eb3af4f7aec3dbdde5.png'})
            .addFields(
                { name: 'Автор:', value: '<@720658048611516559> (@cornbread2100)' },
                { name: 'Серверы Java:', value: totalServers.toLocaleString(), inline: true },
                { name: 'Серверы Bedrock:', value: totalBedrock.toLocaleString(), inline: true },
                { name: 'Статистика бота:', value: `В ${(await client.shard.fetchClientValues('guilds.cache.size')).reduce((a, b) => a + b, 0).toLocaleString()} Discord-серверах. Последний перезапуск: <t:${Math.floor((new Date().getTime() - client.uptime) / 1000)}:R>`}
            )
        await interaction.editReply({ content: '', embeds: [newEmbed], ephemeral:true });
    } 
}
