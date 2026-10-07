const config = require("./config.json");
const fs = require('node:fs');
const path = require('node:path');
const { Client, Partials, Collection, Events, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');
const buttonCallbacks = {};

// Ловит все ошибки
process.on('uncaughtException', console.error);

// Инициализирует Discord.js (вместе с командами)
const client = new Client({ partials: [Partials.Channel], intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages] });
client.commands = new Collection();

// Читает файлы в директории commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Перебирает каждый файл команды, подключает его и добавляет в коллекцию 'client.commands'
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
    console.log("[Загружено]: " + file);
}

let totalServers;
function updateTotalServers(newTotalServers) {
    if (typeof newTotalServers == 'number' && newTotalServers != totalServers) {
        totalServers = newTotalServers;
        if (totalServers != null && totalBedrock != null) client.user.setPresence({ activities: [{ name: `${(totalServers + totalBedrock).toLocaleString()} MC Серверов`, type: ActivityType.Watching }]});
    }
}

let totalBedrock;
function updateTotalBedrock(newTotalBedrock) {
    if (typeof newTotalBedrock == 'number' && newTotalBedrock != totalBedrock) {
        totalBedrock = newTotalBedrock;
        if (totalServers != null && totalBedrock != null) client.user.setPresence({ activities: [{ name: `${(totalServers + totalBedrock).toLocaleString()} MC Серверов`, type: ActivityType.Watching }]});
    }
}

// Когда клиент готов, выводит сообщение в консоль
client.once(Events.ClientReady, async () => {
    // Выводит, на скольких серверах авторизован бот
    console.log(`[Бот]: ${client.user.tag}`)
    console.log("[Серверы]: " + (await client.shard.fetchClientValues('guilds.cache.size')).reduce((a, b) => a + b, 0));
});

process.on('message', (message) => {
    switch (message.type) {
        case 'updateCount': {
            updateTotalServers(message.count);
            break;
        }
        case 'updateBedrockCount': {
            updateTotalBedrock(message.count);
            break;
        }
    }
});

// Когда получена команда чата, пытается выполнить её
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, buttonCallbacks, client, totalServers, updateTotalServers, totalBedrock, updateTotalBedrock);
        } catch (error) {
            console.log('[Ошибка]:');
            console.log(error);
            var errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .addFields({ name: 'Ошибка', value: error.toString() })
            if (interaction.replied || interaction.deferred) await interaction.editReply({ content: '', embeds: [errorEmbed] });
            else await interaction.reply({ content: '', embeds: [errorEmbed] });
        }
    } else if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.autocomplete(interaction);
        } catch (error) {}
    } else if (interaction.isButton()) {
        if (buttonCallbacks[interaction.customId]) buttonCallbacks[interaction.customId](interaction);
        else {
            const command = client.commands.get(interaction.customId.split('-')[0]);
            if (command?.buttonHandler) command.buttonHandler(interaction);
        }
    }
});

// Авторизует бота в Discord API
client.login(config.discord.token);
