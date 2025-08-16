const express = require('express');
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
let orders = [];
app.get('/orders', (req, res) => res.json(orders));
app.post('/orders', (req, res) => {
  orders.push(req.body);
  res.json({success: true});
});
app.delete('/orders/:id', (req, res) => {
  orders.splice(parseInt(req.params.id), 1);
  res.json({success: true});
});
app.get('/', (req, res) => res.send('API running'));
app.listen(3000, () => console.log('Server running on port 3000'));