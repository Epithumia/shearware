import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate";
import {default as undoRedo, scaffoldStore} from 'undo-redo-vuex';
import {LOAD, MAP, REMAP} from "@/store/mutationTypes/types";

Vue.use(Vuex)

const state = {
    data: [],
    fields: [],
    questions: [],
    errors: [],
    mappings: []
};

const actions = {
    loadCSV(context, payload) {
        context.commit(LOAD, payload)
    },
    map(context, payload) {
        context.commit(MAP, payload)
    },
    remap(context, payload) {
        context.commit(REMAP, payload)
    }
};

const mutations = {
    map(state, payload) {
        if (payload.row > -1) {
            state.mappings[payload.question][payload.row].mapped = payload.after
        } else {
            for (let line of state.mappings[payload.question]) {
                if (line.answer === payload.before) {line.mapped = payload.after}
            }
        }
        return state.mappings
    },
    remap(state, payload) {
        if (payload.row > -1) {
            state.mappings[payload.question][payload.row].mapped = payload.after
        } else {
            for (let line of state.mappings[payload.question]) {
                if (line.mapped === payload.before) {line.mapped = payload.after}
            }
        }
        return state.mappings
    },
    loadCSV(state, payload){
        if (payload.errors.length > 0) {
            state.data = [];
            state.fields = [];
            state.questions = [];
            state.mappings = [];
            return state.errors = payload['errors'];
        }
        Array.prototype.findRex = function(regex) {
            const arr = this;
            const matches = arr.filter( function(e) { return regex.test(e); } );
            return matches.map(function(e) { return arr.indexOf(e); } );
        };
        Array.prototype.findQuestions = function(regex) {
            const arr = this;
            const matches = arr.filter( function(e) { return !regex.test(e); } );
            return matches.map(function(e) { return e; } );
        };
        let fields = payload.meta.fields;
        if (!fields.includes('Timestamp')) {
            state.data = [];
            state.fields = [];
            state.questions = [];
            state.mappings = [];
            return state.errors = ['Fichier CSV non valide : colonne timestamp manquante'];
        }
        if (!fields.includes('Email Address')) {
            state.data = [];
            state.fields = [];
            state.questions = [];
            state.mappings = []
            return state.errors = ['Fichier CSV non valide : colonne email manquante'];
        }
        const regex = new RegExp("JeuSheep");
        let r = fields.findRex(regex);
        if (!r.length) {
            state.data = [];
            state.fields = [];
            state.questions = [];
            state.mappings = [];
            return state.errors = ['Fichier CSV non valide : colonne twitter manquante'];
        }

        r = new RegExp("(Timestamp)|(Email Address)|.*JeuSheep.*")
        const questions = fields.findQuestions(r);
        if (r.length===0) {
            state.data = [];
            state.fields = [];
            state.questions = [];
            state.mappings = [];
            return state.errors = ['Fichier CSV non valide : il  n\'y a pas de question'];
        }
        state.errors = [];
        state.fields = fields;
        state.questions = questions;
        let mappings = [];
        let data = payload.data
        let i;
        const twitter = new RegExp("JeuSheep");
        r = fields.findRex(twitter);
        for (let q of questions) {
            i = 0
            let map_q = []
            for (let row of data) {
                let entry = {id: i, twitter: row[fields[r]], email: row['Email Address'], answer: row[q], mapped: row[q]}
                i++
                map_q.push(entry)
            }
            mappings.push(map_q)
        }
        state.mappings = mappings
        return state.data = payload.data;
    },
    emptyState(state) {
        state.data = [];
        state.fields = [];
        state.questions = [];
        state.mappings = [];
        state.errors = [];
    }
};

export default new Vuex.Store(
    scaffoldStore({
        state,
        actions,
        mutations,
        plugins: [
            undoRedo(),
            createPersistedState()
        ]
    })
);
