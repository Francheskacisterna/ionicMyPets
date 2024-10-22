const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Middleware para asegurarse de que los IDs sean numéricos
router.db._.id = function () {
  const maxId = router.db.get('productos').maxBy('id').value().id || 0;
  return maxId + 1;  // Generar el siguiente ID numérico
};

server.use(middlewares);
server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running');
});
