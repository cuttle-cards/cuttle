import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
	theme: {
		options: { customProperties: true },
		themes: {
			light: {
				primary: '#6202EE',
				secondary: '#FD6222',
				accent: '#219653',
				neutral: {
					lighten5: '#FAFBFC',
					lighten4: '#FAFAFA',
					lighten3: '#F2F4F5',
					lighten2: '#E6E9EB',
					lighten1: '#CDD1D4',
					base: '#A3ADB5',
					darken1: '#7D8C97',
					darken2: '#607280',
					darken3: '#3D505E',
					darken4: '#2A3740',
				  },
			}
		}
	}
});
