export default {
	mode: {
		CREATE: 'create',
		UPDATE: 'update'
	},
	message: {
		type: {
			OK: 'Готово',
			WARNING: 'Внимание',
			ERROR: 'Ошибка',
		},
		image: {
			OK: 'Готово',
			WARNING: 'Внимание',
			ERROR: 'Ошибка',
		}
	},
	weekdays: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
	groupStatuses: [{
		key: 1,
		value: 'Набирается',
		class: 'indicator indicator--green',
	},
	{
		key: 2,
		value: 'Обучается',
		class: 'indicator indicator--yellow',
	},
	{
		key: 3,
		value: 'Закрыта',
		class: 'indicator indicator--red',
	},
	],
	groupCategories: [{
		key: 1,
		value: 'B'
	}, {
		key: 2,
		value: 'BC'
	}],
	get defaultGroup() {
		return {
			name: null,
			start_at: null,
			timetable: null,
			hours_start_at: null,
			hours_finish_at: null,
			status: this.groupStatuses[0],
			category: this.groupCategories[0],
			price: 25000,
			price_for_students: 23000,
			is_active: true,
		};
	},
	get defaultUser() {
		return {
			name: null,
			surname: null,
			phone: null,
			email: null,
			group_id: null
		};
	},
	userLabels: {
		'surname': 'Фамилия',
		'name': 'Имя',
		'phone': 'Телефон',
		'email': 'Email',
		'group_id': 'Группа',
	},
	groupLabels: {
		name: 'Название',
		timetable: 'Расписание',
		category: 'Категория',
		start_at: 'Начало занятий',
	},
};