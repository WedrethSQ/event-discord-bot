const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('template-create')
		.setDescription('Create a template for events'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};
