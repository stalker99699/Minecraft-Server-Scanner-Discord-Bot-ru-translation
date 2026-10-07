const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Отправляет полезную информацию о боте'),
  async execute(interaction) {
		let embeds = [
			new EmbedBuilder()
				.setColor("#02a337")
				.setTitle('/stats')
				.setDescription('Отображает статистику о боте'),
			new EmbedBuilder()
				.setColor("#02a337")
				.setTitle('/random')
				.setDescription('Получает случайный онлайн-сервер Java Edition'),
			new EmbedBuilder()
				.setColor("#02a337")
				.setTitle('/ping')
				.setDescription('Получает информацию с указанного сервера Minecraft Java')
				.addFields(
					{ name: 'ip', value: 'IP-адрес сервера', inline: true },
					{ name: 'port', value: 'Порт сервера (по умолчанию 25565)', inline: true }
				),
			new EmbedBuilder()
				.setColor("#02a337")
				.setTitle('/bedrockping')
				.setDescription('Получает информацию с указанного сервера Minecraft Bedrock')
				.addFields(
					{ name: 'ip', value: 'IP-адрес сервера', inline: true },
					{ name: 'port', value: 'Порт сервера (по умолчанию 19132)', inline: true }
				),
			new EmbedBuilder()
				.setColor("#02a337")
				.setTitle('/search')
				.setDescription('Ищет в базе данных сервер Java Edition с определёнными свойствами')
				.addFields(
					{ name: 'minimal (true/false)', value: 'Показывает только ip и порт в предпросмотре (рекомендуется для мобильных пользователей)', inline: true },
					{ name: 'sort (autocomplete)', value: 'Сортирует результаты (может вызвать проблемы с пагинацией)', inline: true },
					{ name: 'page (integer)', value: 'Переходит к странице результатов', inline: true },
					{ name: 'playercount (range)', value: 'Диапазон количества игроков на сервере (например, 4, >10, <=5, 11-20)', inline: true },
					{ name: 'playercap (integer)', value: 'Максимальная вместимость сервера по игрокам', inline: true },
					{ name: 'isfull (true/false)', value: 'Полон ли сервер', inline: true },
					{ name: 'player (player name)', value: 'Имя игрока, который сейчас играет на сервере', inline: true },
					{ name: 'uuid (player uuid)', value: 'UUID игрока, который сейчас играет на сервере', inline: true },
					{ name: 'playerhistory (player name)', value: 'Имя игрока, который был на сервере в прошлом', inline: true },
					{ name: 'uuidhistory (player uuid)', value: 'UUID игрока, который был на сервере в прошлом', inline: true },
					{ name: 'version (text)', value: 'Версия сервера', inline: true },
					{ name: 'hasimage (true/false)', value: 'Есть ли у сервера свой favicon', inline: true },
					{ name: 'description (text)', value: 'Описание сервера', inline: true },
					{ name: 'hasplayerlist (boolean)', value: 'Включён ли на сервере список игроков', inline: true },
					{ name: 'seenafter (unix timestamp)', value: `Самое старое время, когда сервер был в последний раз виден. Это не значит, что сервер офлайн, возможно, пинг был потерян из-за потери пакетов. Рекомендуется: ${Math.round(new Date().getTime() / 1000) - 3600} (1 час назад)\n` + '​', inline: true },
					{ name: 'iprange (ip subnet)', value: 'IP-подсеть, в которой должен находиться IP сервера', inline: true },
					{ name: 'port (integer)', value: 'Порт, на котором размещён сервер', inline: true },
					{ name: 'country (text)', value: 'Страна, в которой размещён сервер (используйте варианты автодополнения)', inline: true },
					{ name: 'org (text)', value: 'Организация, которой принадлежит IP', inline: true },
					{ name: 'cracked (true/false)', value: 'Является ли сервер пиратским (офлайн-режим)', inline: true },
					{ name: 'whitelist (true/false)', value: 'Есть ли на сервере белый список', inline: true },
					{ name: 'vanilla (true/false)', value: 'Является ли сервер ванильным', inline: true },
				),
			new EmbedBuilder()
				.setColor("#02a337")
				.setTitle('/bedrocksearch')
				.setDescription('Ищет в базе данных сервер Bedrock Edition с определёнными свойствами')
				.addFields(
					{ name: 'minimal (true/false)', value: 'Показывает только ip и порт в предпросмотре (рекомендуется для мобильных пользователей)', inline: true },
					{ name: 'sort (autocomplete)', value: 'Сортирует результаты (может вызвать проблемы с пагинацией)', inline: true },
					{ name: 'page (integer)', value: 'Переходит к странице результатов', inline: true },
					{ name: 'playercount (range)', value: 'Диапазон количества игроков на сервере (например, 4, >10, <=5, 11-20)', inline: true },
					{ name: 'playercap (integer)', value: 'Максимальная вместимость сервера по игрокам', inline: true },
					{ name: 'isfull (true/false)', value: 'Полон ли сервер', inline: true },
					{ name: 'version (text)', value: 'Версия сервера', inline: true },
					{ name: 'description (text)', value: 'Описание сервера', inline: true },
					{ name: 'seenafter (unix timestamp)', value: `Самое старое время, когда сервер был в последний раз виден. Это не значит, что сервер офлайн, возможно, пинг был потерян из-за потери пакетов. Рекомендуется: ${Math.round(new Date().getTime() / 1000) - 3600} (1 час назад)\n` + '​', inline: true },
					{ name: 'iprange (ip subnet)', value: 'IP-подсеть, в которой должен находиться IP сервера', inline: true },
					{ name: 'port (integer)', value: 'Порт, на котором размещён сервер', inline: true },
					{ name: 'gamemode (text)', value: 'Режим игры по умолчанию на сервере', inline: true },
					{ name: 'country (text)', value: 'Страна, в которой размещён сервер (используйте варианты автодополнения)', inline: true },
					{ name: 'org (text)', value: '1, которой принадлежит IP', inline: true },
				),
			]
    interaction.reply({ embeds, ephemeral: true });
	}
}
