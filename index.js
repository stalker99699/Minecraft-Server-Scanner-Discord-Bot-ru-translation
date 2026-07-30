const { REST, Routes, ShardingManager } = require('discord.js');
const config = require('./config.json');
const fs = require('node:fs');


// Deploy slash commands
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}
const rest = new REST({ version: '10' }).setToken(config.discord.token);
(async () => {
	try {
		console.log(`[Refreshing]: ${commands.length}`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
            Routes.applicationCommands(config.discord.clientId),
            { body: commands },
        );

		console.log(`[Refreshed]: ${data.length}`);
	} catch (error) {
		// Catches & logs any errors into the console
		console.error(error);
	}
})();


const manager = new ShardingManager('./bot.js', { token: config.discord.token });
let shards = [];
manager.on('shardCreate', shard => {
    console.log(`Launched shard ${shard.id}`);
    shards.push(shard);
});
manager.spawn();

async function updateCount() {
    let result = (await (await fetch(`${config.api}/count`)).json()).data;
    if (typeof result == 'number') for (const shard of shards) shard.send({ type: 'updateCount', count: result });
}

async function updateBedrockCount() {
    let result = (await (await fetch(`${config.api}/bedrockCount`)).json()).data;
    if (typeof result == 'number') for (const shard of shards) shard.send({ type: 'updateBedrockCount', count: result });
}

if (config.discord.stats) {
    updateCount();
    setInterval(updateCount, 60000);
    updateBedrockCount();
    setInterval(updateBedrockCount, 60000);
}


let results = [];
async function fetchStreams() {
    results = (await (await fetch(`${config.api}/streamsnipe`)).json()).data;
    for (const shard of shards) shard.send({ type: 'streamsnipes', results });
}
fetchStreams();
setInterval(fetchStreams, 60000);