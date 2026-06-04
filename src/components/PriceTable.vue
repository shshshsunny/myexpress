<template>
  <table>
    <thead>
      <tr><th>日期</th><th>品項</th><th>價格</th></tr>
    </thead>
    <tbody>
      <tr v-for="(row, idx) in items" :key="idx">
        <td>{{ row.record_date }}</td>
        <td>{{ row.item_name }}</td>
        <td>{{ row.item_price }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default { name: 'PriceTable', props: { items: { type: Array, default: () => [] } } }
</script>

<style scoped>
table { width:100%; border-collapse:collapse; margin-top:16px }
th, td { border:1px solid #ddd; padding:8px; text-align:left }
th { background:#f4f4f4 }
</style>
