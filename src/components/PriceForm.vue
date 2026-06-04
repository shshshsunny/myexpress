<template>
  <form @submit.prevent="onSubmit">
    <div>
      <label for="record_date">日期</label>
      <input id="record_date" v-model="record_date" type="date" required />
    </div>
    <div>
      <label for="item_name">品項名稱</label>
      <input id="item_name" v-model="item_name" type="text" required />
    </div>
    <div>
      <label for="item_price">商品價格</label>
      <input id="item_price" v-model.number="item_price" type="number" required />
    </div>
    <div>
      <button type="button" @click="submit('get')">GET 新增</button>
      <button type="button" @click="submit('post')">POST 新增</button>
    </div>
    <p>{{ message }}</p>
  </form>
</template>

<script>
export default {
  name: 'PriceForm',
  data() {
    return { record_date: '', item_name: '', item_price: null, message: '' }
  },
  methods: {
    onSubmit() {
      this.submit('post')
    },
    async submit(method) {
      this.message = ''
      if (!this.record_date || !this.item_name || this.item_price === null) {
        this.message = '請填寫所有欄位'
        return
      }
      try {
        if (method === 'get') {
          const qs = `?date=${encodeURIComponent(this.record_date)}&name=${encodeURIComponent(this.item_name)}&price=${encodeURIComponent(this.item_price)}`
          const res = await fetch('http://localhost:3000/api/insert' + qs, { method: 'GET' })
          this.message = await res.text()
        } else {
          const res = await fetch('http://localhost:3000/api/insert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: this.record_date, name: this.item_name, price: Number(this.item_price) })
          })
          this.message = await res.text()
        }
        this.$emit('submitted')
      } catch (e) {
        this.message = '新增失敗：' + e.message
      }
    }
  }
}
</script>

<style scoped>
label { display:inline-block; width:90px }
div { margin-bottom:8px }
</style>
