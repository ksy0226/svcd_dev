'use strict';

exports.http404 = function(req, res){
  res.status(404);
  if (req.xhr) {
    res.send({ error: 'Resource not found.' });
  }
  else {
    res.render('http/404',{cache : true});
  }
};

exports.http500 = function(err, req, res, next){
  res.status(500);

  var data = { cache : true, err: {} };
  if (req.app.get('env') === 'development') {
    data.err = err;
    console.log(err.stack);
    /* 김상엽
    req.app.use(function(req, res, next)
    {
      if (req.headers['x-forwarded-proto'] != 'https')
        res.redirect(['https://', req.headers.host, req.url].join(''));
      else
        next();
    });
    */
  }

  if (req.xhr) {
    res.send({ error: 'Something went wrong.', details: data });
  }
  else {
    res.render('../views/http/500', data);
  }
};
