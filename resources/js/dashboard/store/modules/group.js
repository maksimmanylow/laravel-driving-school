import API from '../../api/group';
import C from './constants';
import { isObject } from 'util';

// initial state
const state = {
	all: [],
	modalShow: false,
	modalMode: null,
	errors: [],
	constants: C,
	model: {
		value: C.defaultGroup,
		status: C.groupStatuses[0],
		category: C.groupCategories[0],
		required: C.defaultGroup.keys,
		validationErrors: [],
	},
	message: {
		text: 'Default text',
		type: C.message.type.OK,
		show: false,
		image: null,
	},
	search: {
		query: '',
		debounceTimeout: 500,
	},
	paginator: {
		from: 0,
		to: 0,
		total: 0,
		current_page: 0,
		last_page: 0,
	},
	groupLabels: C.groupLabels,
	groupStatuses: C.groupStatuses,
};

// getters
const getters = {
	modalModeLabel: (state, getters, rootState) => {
		switch (state.modalMode) {
		case C.mode.CREATE:
			return 'Добавить';
		case C.mode.UPDATE:
			return 'Редактировать';
		}
	}
};



function getDate(dateTimeString) {
	let res = null
	if (dateTimeString !== null && typeof dateTimeString === 'object'){
		dateTimeString = dateTimeString.date
	}
	if (dateTimeString)
		res = new Date(dateTimeString);
	return res;
  }

// actions
const actions = {
	async getPage({
		commit,
		dispatch,
		state
	}, page) {
		try {
			const {
				data,
				status
			} = await API.getPage({
				page,
				q: state.search.query,
			});
			if (status == 200) {
				commit('setAll', data.data.map((model) => ({
					...model,
					start_at: getDate(model.start_at),
					exam_date: getDate(model.exam_date),
					hours_start_at: model.hours_start_at.slice(0,5),
					hours_finish_at: model.hours_finish_at.slice(0,5),
					timetable: JSON.parse(model.timetable),
					status: C.groupStatuses.find(item => item.key == model.status),
					category: C.groupCategories.find(item => item.key == model.category),
				})));
				commit('setPaginator', data.meta);
			}
		} catch (error) {
			mutations.addErrors(error);
		}
	},
	async getAll({
		commit
	}) {
		try {
			const {
				data,
				status
			} = await API.getAll();
			if (status == 200)
				commit('setAll', data.data);
		} catch (error) {
			mutations.addErrors(error);
		}
	},
	async get({
		commit
	}, id) {
		try {
			const {
				data,
				status
			} = await API.get(id);
			if (status == 200) {
				model = data.data;
				model.timetable = JSON.parse(model.timetable)
				commit('setModel', model);
			}
		} catch (error) {
			mutations.addErrors(error);
		}
	},
	save({state, getters, commit, dispatch}) {
		switch (state.modalMode) {
			case C.mode.CREATE:
				dispatch('create');
				break;
			case C.mode.UPDATE:
				dispatch('update');
				break;
		}
		commit('closeModal');
	},
	async create({commit, dispatch, state}) {
		try {
			let group = state.model.value;
			const {
				data,
				status
			} = await API.create(group.map((model) => ({
				...model,
				category: model.category.key,
				status: model.status.key,
			})));
			if (status == 201) {
				dispatch('showMessageOK', 'Группа добавлена!');
				dispatch('getPage');
			} else {
				dispatch('showMessageError');
			}
		} catch (error) {
			dispatch('showMessageError');
			commit('addErrors', error);
		}
	},
	async update({commit, dispatch, state}) {
		try {
			let group = state.model.value;
			const {
				data,
				status
			} = await API.update(group.map((model) => ({
				...model,
				category: model.category.key,
				status: model.status.key,
			})));
			if (status == 200) {
				dispatch('showMessageOK', 'Группа обновлена!');
				commit('setAll', state.all.map(model => {
					if (model.id === data.data.id) {
						return data.data;
					} else {
						return model;
					}
				}));
			}
		} catch (error) {
			dispatch('showMessageError', 'Код ошибки: ' + status);
			commit('addErrors', error);
		}
	},
	async delete({commit, dispatch, state}) {
		try {
			if (!state.model.value.id) {
				throw new Error('Please, provide model id');
			}
			const {
				data,
				status
			} = await API.delete(state.model.value.id);
			if (status == 204) {
				commit('setAll', state.all.filter(model => model.id != state.model.value.id));
				dispatch('showMessageOK', 'Группа удалена!');
			}
		} catch (error) {
			dispatch('showMessageError', 'Код ошибки: ' + status);
			commit('addErrors', error);
		}
		commit('closeModal');
	},
	showMessageOK({commit}, message) {
		commit('showMessageOK', message);
		setTimeout(() => commit('closeMessage'), 1500);
	},
	showMessageError({commit}, message) {
		commit('showMessageError', message);
		setTimeout(() => commit('closeMessage'), 1500);
	},
	async search({
		commit,
		dispatch,
		state
	}) {
		try {
			const query = state.search.query.trim();

			const {
				data,
				status
			} = await API.getPage({
				page: 1,
				q: query,
			});

			if (status == 200) {
				commit('setAll', data.data);
				commit('setPaginator', data.meta);
			}
		} catch (error) {
			dispatch('showMessageError', error);
			commit('addErrors', error);
		}
		commit('closeModal');
	},
	async goToNextPage({
		commit,
		dispatch,
		state
	}) {
		try {
			const nextPageNumber = state.paginator.current_page + 1;
			if (nextPageNumber > state.paginator.last_page) {
				throw new Error('Paginator: out of range');
			}
			const {
				data,
				status
			} = await API.getPage({
				page: nextPageNumber,
				q: state.search.query,
			});
			if (status == 200) {
				commit('setAll', data.data);
				commit('setPaginator', data.meta);
			}
		} catch (error) {
			dispatch('showMessageError');
			commit('addErrors', error);
		}
	},
	async goToPrevPage({
		commit,
		dispatch,
		state
	}) {
		try {
			const prevPageNumber = state.paginator.current_page - 1;
			if (prevPageNumber < 1) {
				throw new Error('Paginator: out of range');
			}
			const {
				data,
				status
			} = await API.getPage({
				page: prevPageNumber,
				q: state.search.query,
			});
			if (status == 200) {
				commit('setAll', data.data);
				commit('setPaginator', data.meta);
			}
		} catch (error) {
			dispatch('showMessageError');
			commit('addErrors', error);
		}
	},
};

// mutations
const mutations = {
	setAll(state, groups) {
		state.all = groups;
	},
	setModel(state, value) {
		state.model.value = value;
	},
	setName(state, value) {
		state.model.value.name = value;
	},
	setStatus(state, value) {
		state.model.status = value;
		state.model.value.status = value.key;
	},
	setPrice(state, value) {
		state.model.value.price = value;
	},
	setDescription(state, value){
		state.model.value.description = value;
	},
	setPriceForStudents(state, value) {
		state.model.value.price_for_students = value;
	},
	setCategory(state, value) {
		state.model.category = value;
		state.model.value.category = value.key;
	},
	setStartAt(state, value) {
		state.model.value.start_at = value;
	},
	setExamDate(state, value) {
		state.model.value.exam_date = value;
	},
	setTimetable(state, value) {
		state.model.value.timetable = value;
	},
	setHoursStartAt(state, value) {
		state.model.value.hours_start_at = value;
	},
	setHoursFinishAt(state, value) {
		state.model.value.hours_finish_at = value;
	},
	addErrors(state, e) {
		state.errors.push(e);
	},
	showUpdateModal(state, id) {
		state.model.value = { ...state.all.find(model => model.id == id)};
		state.modalMode = C.mode.UPDATE;
		state.modalShow = true;
	},
	showCreateModal(state) {
		state.model.value = C.defaultGroup;
		state.modalMode = C.mode.CREATE;
		state.modalShow = true;
	},
	setModelValue(state, id) {
		state.model.value = { ...state.all.find(model => model.id == id)
		};
	},
	showModal(state, show) {
		state.modalShow = show;
	},
	closeModal(state) {
		state.modalShow = false;
		state.model.validationErrors = [];
	},
	showMessageOK(state, message) {
		state.message = {
			text: message,
			type: C.message.type.OK,
			show: true,
		};
	},
	showMessageError(state, message) {
		state.message = {
			text: message,
			type: C.message.type.ERROR,
			show: true,
		};
	},
	closeMessage(state) {
		state.message = {
			text: '',
			type: null,
			show: false,
		};
	},
	setPaginator(state, paginator) {
		state.paginator.from = paginator.from;
		state.paginator.to = paginator.to;
		state.paginator.total = paginator.total;
		state.paginator.current_page = paginator.current_page;
		state.paginator.last_page = paginator.last_page;
	},
	setSearchQuery(state, query) {
		state.search.query = query;
	},
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};
