<template>
  <div class="app">
    <HeaderComponent />
    <main>
      <PriceForm @submitted="loadPrices" />
      <PriceTable :items="items" />
    </main>
    <FooterComponent />
  </div>
</template>

<script>
import HeaderComponent from './components/HeaderComponent.vue'
import PriceForm from './components/PriceForm.vue'
import PriceTable from './components/PriceTable.vue'
import FooterComponent from './components/FooterComponent.vue'

export default {
  name: 'App',
  components: { HeaderComponent, PriceForm, PriceTable, FooterComponent },
  data() {
    return { items: [] }
  },
  methods: {
    async loadPrices() {
      try {
        const res = await fetch('http://localhost:3000/api/prices')
        if (!res.ok) throw new Error(res.status)
        this.items = await res.json()
      } catch (e) {
        console.error(e)
      }
    }
  },
  mounted() {
    this.loadPrices()
  }
}
</script>

<style>
.app { font-family: system-ui, sans-serif; padding: 16px; }
</style>
