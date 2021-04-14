import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const store = {
  state: {
    currentMenu: "1",
  },
  mutations: {
    ['CURRENT_MENU'](state, params) {
      state.currentMenu = params;
    }
  },
  actions: {
    setCurrentMenu({ commit }, result) {
      commit('CURRENT_MENU', result);
    }
  },
  getters: {
    currentMenu: state => {
      return state.currentMenu;
    }
  }
}

export default new Vuex.Store(store);
