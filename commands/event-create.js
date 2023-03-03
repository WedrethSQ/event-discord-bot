const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, time } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('event-create')
		.setDescription('Create an event')
		.addStringOption(option=>
			option.setName('title')
				.setDescription('Title of the event')
				.setRequired(true))
		.addStringOption(option=>
			option.setName('time')
				.setDescription('Time of the event (DD-MM-YYYY HH:MM format)')
				.setRequired(true))
		,
	async execute(interaction) {
		const dps_limit= 6
		const support_limit= 2
		const ephemeral= false

		//Time
		if(!interaction.options.getString('time').match(/([12][0-9]|3[01]|0?[1-9])-(0?[1-9]|1[012])-\d{4} ([01][0-9]|2[0123]):([0-5][0-9])/g)){
			await interaction.reply({content: 'Date not matching the format', ephemeral: true})
			return
		}
		let timestamp = interaction.options.getString('time').split(' ')
		timestamp[0]= timestamp[0].split('-')
		timestamp[1]= timestamp[1].split(':')
		const date = new Date(timestamp[0][2], parseInt(timestamp[0][1])-1, timestamp[0][0], timestamp[1][0], timestamp[1][1])

		//Embed
		const eventEmbed = new EmbedBuilder()
			.setTitle(interaction.options.getString('title'))
			.setDescription(`🕐 ${time(date)}\n ${time(date, 'R')}`)
			.setColor(0x0099FF)
			.addFields(
				{ name: '⚔️ Dps', value: '\u200B', inline: true},
				{ name: '💉 Support', value: '\u200B', inline: true},
				{ name: '❓ Maybe', value: '\u200B', inline: false},
			)
			.setTimestamp()

		//Buttons
		const buttons = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
						.setCustomId('dps')
						.setLabel('dps')
						.setEmoji('⚔️')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('support')
						.setLabel('support')
						.setEmoji('💉')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('maybe')
						.setLabel('maybe')
						.setEmoji('❓')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('cancel')
						.setLabel('cancel')
						.setEmoji('⛔')
						.setStyle(ButtonStyle.Secondary),
			);

		//Send Embed	
		let embed = await interaction.reply({ embeds: [eventEmbed], components: [buttons], fetchReply: true, ephemeral: ephemeral})
		

		//Collect interactions
		const collector = embed.createMessageComponentCollector({ componentType: ComponentType.Button});

		collector.on('collect', async i => {
			const receivedEmbed = embed.embeds[0];
			const editedEmbed = EmbedBuilder.from(receivedEmbed)

			console.log(`${i.user.tag} clicked on the ${i.customId} button.`);

			//remove already existing role of user
			editedEmbed.data.fields.forEach(e => {
				e.value = e.value.replace(`<@!${i.user.id}>`, '')
			})

			//add new role of user
			switch (i.customId) {
				case 'dps':
					if(editedEmbed.data.fields[0].value.split('\n').filter(e=>e!=='' && e!=='\u200B').length>=dps_limit){
						i.reply({content: 'Limit already reached', ephemeral: true})
						break;
					}
					editedEmbed.data.fields[0].value+=editedEmbed.data.fields[0].value==='\u200B'? `<@!${i.user.id}>`:`\n <@!${i.user.id}>`
					i.reply({content: 'Subscribed to the event', ephemeral: true})
					break;
				case 'support':
					if(editedEmbed.data.fields[1].value.split('\n').filter(e=>e!=='' && e!=='\u200B').length>=support_limit){
						i.reply({content: 'Limit already reached', ephemeral: true})
						break;
					}
					editedEmbed.data.fields[1].value+=editedEmbed.data.fields[1].value==='\u200B'? `<@!${i.user.id}>`:`\n <@!${i.user.id}>`
					i.reply({content: 'Subscribed to the event', ephemeral: true})
					break;
				case 'maybe':
					editedEmbed.data.fields[2].value+=editedEmbed.data.fields[2].value==='\u200B'? `<@!${i.user.id}>`:`\n <@!${i.user.id}>`
					i.reply({content: 'Subscribed to the event', ephemeral: true})
					break;
				case 'cancel':
					i.reply({content: 'Unsubscribed to the event', ephemeral: true})
					break;
				default:
					break;
			}
			embed = await interaction.editReply({ embeds: [editedEmbed] });
		})
	},
};
