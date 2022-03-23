<template>
	<v-menu v-model="showGameMenu">
		<!-- Activator -->
		<template #activator="{ on, attrs }">
			<v-btn
				id="game-menu-activator"
				v-bind="attrs"
				class="ma-2"
				icon
				v-on="on"
			>
				<v-icon
					large
					color="neutral lighten-1"
				>
					mdi-cog
				</v-icon>
			</v-btn>
		</template>
		<!-- Menu -->
		<v-list id="game-menu">
			<v-list-item>
				<rules-dialog>
					<template #activator>
						Rules
					</template>
				</rules-dialog>
			</v-list-item>
			<!-- Concede Dialog (Initiate + Confirm) -->
			<v-list-item
				data-cy="concede-initiate"
				@click.stop="openConcedeDialog"
			>
				Concede
			</v-list-item>
		</v-list>
		<v-dialog v-model="showConcedeDialog">
			<v-card id="concede-menu">
				<v-card-title>Concede?</v-card-title>
				<v-card-text>
					The game will end and your opponent will win.
				</v-card-text>
				<v-card-actions class="d-flex justify-end">
					<v-btn
						text
						color="primary"
						data-cy="concede-cancel"
						:disabled="conceding"
						@click="showConcedeDialog = false"
					>
						Cancel
					</v-btn>
					<v-btn
						color="error"
						depressed
						outlined
						data-cy="concede-confirm"
						:loading="conceding"
						@click="concede"
					>
						Concede
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</v-menu>
</template>

<script>
import RulesDialog from '../RulesDialog.vue';
export default {
	name: 'GameMenu',
  	components: { RulesDialog },
	data() {
		return {
			showGameMenu: false,
			showConcedeDialog: false,
			conceding: false,
		};
	},
	methods: {
		openConcedeDialog() {
			this.showConcedeDialog = true;
			this.showGameMenu = false;
		},
		async concede() {
			this.conceding = true;
			await this.$store.dispatch('requestConcede');
			this.showConcedeDialog = false;
		},
	}
}
</script>