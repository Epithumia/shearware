<template>
  <div id="app">
    <h1 class="title center text-4xl">
      Bienvenue sur la tondeuse à Sheep
    </h1>
    <br>
    <text-reader @load="text = $event"></text-reader>
    <shearing></shearing>
  </div>
</template>

<script>
import TextReader from "@/components/TextReader";
import Shearing from "@/components/Shearing";
export default {
  name: 'App',
  components: {
    TextReader,
    Shearing
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
