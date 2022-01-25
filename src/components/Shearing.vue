<template>
  <div class="shearing">
    <div class="notification">
      <div>
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" @click="undo"
                v-shortkey="{win:['ctrl', 'z'], mac:['meta', 'z']}" @shortkey="undo">
          Annuler
        </button>
        <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" @click="redo"
                v-shortkey="{win:['ctrl', 'y'], mac:['meta', 'y']}" @shortkey="redo">
          Rétablir
        </button>
        <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" @click="clear">
          RAZ
        </button>
      </div>
      <div class="grid grid-cols-6">
        <div class="col-span-4">
          <te-tabs :titles="questions">
            <template v-for="(q, ind) in questions" :slot="'tab-' + (ind+1)">
              <te-tabs :titles="['Scores question', 'Blocs de réponses','Réponses individuelles']" :key="ind">
                <template slot="tab-1">
                  <h3>{{ q }}</h3>
                  <div v-for="row in getScoresByAnswer(ind)" :key="row[0]">
                    <hr>
                    <h3>{{ row[0] }} -- {{ row[0] === 'Disqualifié' ? 0 : row[1].length }} points</h3>
                    <hr>
                    <p v-for="r in row[1]" :key="r.email+r.twitter">
                      {{ r.twitter }}
                    </p>
                    <hr>
                  </div>
                </template>
                <template slot="tab-2">
                  <table class="min-w-full text-center">
                    <thead class="border-b bg-white">
                    <tr>
                      <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-2">
                        Nb réponses
                      </th>
                      <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-2">
                        Réponse enregistrée
                      </th>
                      <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-2">
                        Transformer en
                      </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr class="border-b" :class="{'bg-white': key%2, 'bg-gray-100': (key+1)%2}"
                        v-for="(row, key) in getGroupedRemaps(ind)" :key="key">
                      <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {{ row['count'] }}
                      </td>
                      <td class="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                        {{ row['mapped'] }}
                      </td>
                      <td class="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                        <te-select :options="getDistinctAnswers(ind)" :placeholder="row['mapped']"
                                   value-field="answer" display-field="answer" :ref="'sel-' + ind + '-' + key"
                                   @input="remap(row['mapped'], $event, ind, -1)"
                        />
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </template>
                <template slot="tab-3">
                  <table class="min-w-full text-center">
                    <thead class="border-b bg-white">
                    <tr>
                      <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-2">
                        #
                      </th>
                      <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-2">
                        Email
                      </th>
                      <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-2">
                        Twitter
                      </th>
                      <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-2">
                        Réponse
                      </th>
                      <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-2">
                        Réponse enregistrée
                      </th>
                      <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-2">
                        Choix
                      </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr class="border-b" :class="{'bg-white': key%2, 'bg-gray-100': (key+1)%2}"
                        v-for="(row, key) in mappings[ind]" :key="key">
                      <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{{ row['id'] }}</td>
                      <td class="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                        {{ row['email'] }}
                      </td>
                      <td class="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                        {{ row['twitter'] }}
                      </td>
                      <td class="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                        {{ row['answer'] }}
                      </td>
                      <td class="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                        {{ row['mapped'] }}
                      </td>
                      <td class="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                        <te-select :options="getDistinctAnswers(ind)" :placeholder="row['mapped']"
                                   value-field="answer" display-field="answer" :ref="'ind-sel-' + ind + '-' + key"
                                   @input="remap(row['mapped'], $event , ind, row['id'])"
                        />
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </template>
              </te-tabs>
            </template>
          </te-tabs>
        </div>
        <div class="col-span-2"><h2>Scores cumulés jusqu'à la question&nbsp;:</h2>
          <te-select :options="Array.from(Array(this.questions.length).keys()).map(k => k+1)" v-model="cutoff" />
          <p v-for="(user, rank) in getScoresByUser(cutoff)" :key="rank">
            {{rank+1}} - {{ user.twitter }} : {{user.score}}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import {mapState, mapActions} from 'vuex';
import store from "@/store";
import * as type from "@/store/mutationTypes/types";
import teTabs from "@/components/teTabs";
import teSelect from "@/components/teSelect";
//https://www.npmjs.com/package/undo-redo-vuex

export default {
  components: {teTabs, teSelect},
  data: () => ({
    headers: [{label: 'Réponses', field: 'answer'}, {label: '=>', field: 'button'}, {
      label: 'Renommage',
      field: 'rename'
    }],
    headers_ind: [{label: 'Réponses', field: 'answer'}, {label: '=>', field: 'email'}, {
      label: 'Renommage',
      field: 'id'
    }],
    cutoff: null
  }),
  computed: {
    ...mapState({
      data: 'data',
      fields: 'fields',
      questions: 'questions',
      mappings: 'mappings',
      errors: 'errors',
      canUndo: 'canUndo',
      canRedo: 'canRedo'
    })
  },
  mounted() {
    this.cutoff = this.questions.length
  },
  methods: {
    ...mapActions([
      'undo',
      'redo'
    ]),
    clear: function () {
      this.$store.dispatch("clear");
    },
    getGroupedRemaps: function (idx) {
      try {
        let grouped = this.mappings[idx].reduce((p, c) => {
          if (c) {
            let ans = c.mapped
            if (!(Object.keys(p).includes(ans))) {
              p[ans] = 0
            }
            p[ans] += 1
            return p
          }
        }, {})
        const sortable = Object.entries(grouped)
            .sort(([, a], [, b]) => b - a)
            .reduce((r, [k, v]) => ({...r, [k]: v}), {});
        let sorted = []
        for (let row of Object.entries(sortable)) {
          sorted.push({'mapped': row[0], 'count': row[1]})
        }
        return sorted
      } catch (e) {
        return []
      }
    },
    getDistinctAnswers: function (idx) {
      let grouped = this.mappings[idx].reduce((p, c) => {
        if (c) {
          let ans = c.answer
          if (!(Object.keys(p).includes(ans))) {
            p[ans] = 0
          }
          p[ans] += 1
          return p
        }
      }, {})
      const sortable = Object.entries(grouped)
          .sort(([, a], [, b]) => b - a)
          .reduce((r, [k, v]) => ({...r, [k]: v}), {});
      let sorted = []
      for (let row of Object.entries(sortable)) {
        sorted.push({'answer': row[0]})
      }
      sorted.push({'answer': 'Disqualifié'})
      return sorted
    },
    getResults: function (idx) {
      const index = idx + 3;
      let filtered = [];
      const fields = this.fields;
      for (let i in this.data) {
        let row = this.data[i];
        let ans = [row[fields[0]], row[fields[1]], row[fields[2]], row[fields[index]]];
        if (ans[0] !== undefined) {
          filtered.push(ans);
        }
      }
      return filtered
    },
    remap: function (before, after, question, row) {
      let payload = {before: before, after: after, question: question, row: row}
      if (after !== '' && after !== before) store.dispatch(type.REMAP, payload);
    },
    getScoresByAnswer: function (idx) {
      const validated = this.getGroupedRemaps(idx)
      let scores = []
      for (let row of validated) {
        const ans = row['mapped']
        let names = []
        for (let k of this.mappings[idx]) {
          if (k.mapped === ans) names.push({twitter: k['twitter'], email: k['email']})
        }
        let t = [ans, names]
        scores.push(t)
      }
      return scores
    },
    getScoresByUser: function (nb) {
      let scores = new Map()
      for (let q in this.questions.slice(0,nb)) {
        const score_q = this.getScoresByAnswer(q)
        for (let ans of score_q) {
          for (let user of ans[1]) {
            if (!scores.has(user.twitter + user.email)) {
              scores.set(user.twitter + user.email,
                  {email: user.email, twitter: user.twitter, score: 0})
            }
            let s = scores.get(user.twitter + user.email)
            s.score += (ans[0] === 'Disqualifié') ? 0 : ans[1].length
            scores.set(user.twitter + user.email, s)
          }
        }
      }
      let score_array = [...scores.values()]
      score_array.sort((a, b) => b.score - a.score);
      return score_array
    }
  }
}
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>
