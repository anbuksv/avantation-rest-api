const jsonServer = require('json-server');
const path = require('path');
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();
const jwt = require('jsonwebtoken');
const demoUser = 'demo@avantation.in';
const demoPassword = 'EC84D5D857ABE';
const HMAC = 'FA81BAD14777A';

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.post('/api/v2/login', LoginHandler);

server.use((req, res, next) => {
  if (req.path == '/api/v1/login') {
    return LoginHandler(req, res, next);
  } else if (req.path == '/api/v2/login' || isAuthorized(req)) {
    next();
  } else {
    res.status(401).send({message: 'Invalid Authorization.'});
  }
});

server.use(
  jsonServer.rewriter({
    '/api/v1/*': '/$1',
  }),
);

server.use(router);
server.listen(3000, () => {
  console.log('Demo Server is running');
});

function LoginHandler(req, res, next) {
  if (Object.keys(req.body).length != 2) {
    res.status(406).send({message: 'Addional properties dose not allowed.'});
    return;
  }

  if (!req.body.email || !req.body.password) {
    res.status(404).send({message: 'Email or password missing in request.'});
    return;
  }

  if (req.body.email !== demoUser || req.body.password !== demoPassword) {
    res.status(400).send({message: 'Invalid user name or password!'});
    return;
  }

  let token = jwt.sign({email: demoUser}, HMAC);
  res.send({
    message: 'Welcome to demo of todo application.',
    token: token,
  });
}

function isAuthorized(req) {
  try {
    let token = req.get('authorization').split(' ')[1];
    return jwt.verify(token, HMAC, function(err, docoded) {
      if (err) return false;
      return true;
    });
  } catch (err) {
    console.log(err);
    return false;
  }
}
