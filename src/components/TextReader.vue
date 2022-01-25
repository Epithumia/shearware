<template>
  <label class="text-reader hover:bg-green-50">
    Charger le fichier CSV du field
    <input type="file" accept="text/csv" @change="loadTextFromFile" ref="fileSelect"
           v-shortkey="{win:['ctrl', 'o'], mac:['meta', 'o']}" @shortkey="buttonClicked">
  </label>
</template>

<script>
import store from '../store';
import * as type from '../store/mutationTypes/types';

export default {
  methods: {
    loadTextFromFile(ev) {
      const file = ev.target.files[0];
      const reader = new FileReader();

      reader.onload = e => {
        this.$emit("load", e.target.result);
        let parsed = this.$papa.parse(e.target.result, {header:true, skipEmptyLines: true})
        store.dispatch(type.LOAD, parsed);
      }
      reader.readAsText(file);
    },
    buttonClicked() {
      let ref = `fileSelect`
      console.log('ref: ', ref)
      let element = this.$refs[ref]
      console.log('element', element)
      element.click()
    }
  }
};
</script>

<style>
.text-reader {
  position: relative;
  overflow: hidden;
  display: inline-block;

  /* Fancy button looking */
  border: 2px solid black;
  border-radius: 5px;
  padding: 8px 12px;
  cursor: pointer;
}
.text-reader input {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  opacity: 0;
}

</style>
