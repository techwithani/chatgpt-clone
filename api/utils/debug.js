const { Logtail } = require("@logtail/node");
var logtail;
try {
  logtail = new Logtail(process.env.LOGTAIL_TOKEN);
} catch {
  logtail = {
    log: () => {},
    info: () => {},
    error: () => {},
    flush: () => {}
  }
}

const levels = {
  NONE: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

let level = levels.HIGH;

module.exports = {
  levels,
  setLevel: (l) => (level = l),
  log: {
    parameters: (parameters) => {
      if (levels.HIGH > level) return;
      console.group();
      parameters.forEach((p) => console.log(`${p.name}:`, p.value));
      parameters.forEach((p) => logtail.log(`${p.name}:`, p.value));
      console.groupEnd();
      logtail.flush();
    },
    functionName: (name) => {
      if (levels.MEDIUM > level) return;
      console.log(`\nEXECUTING: ${name}\n`);
      logtail.log(`\nEXECUTING: ${name}\n`);
      logtail.flush();
    },
    flow: (flow) => {
      if (levels.LOW > level) return;
      console.log(`\n\n\nBEGIN FLOW: ${flow}\n\n\n`);
      logtail.log(`\n\n\nBEGIN FLOW: ${flow}\n\n\n`);
      logtail.flush();
    },
    variable: ({ name, value }) => {
      if (levels.HIGH > level) return;
      console.group();
      console.group();
      console.log(`VARIABLE ${name}:`, value);
      logtail.log(`VARIABLE ${name}:`, value);
      console.groupEnd();
      console.groupEnd();

      logtail.flush();
    },
    request: () => (req, res, next) => {
      if (levels.HIGH > level) return next();
      console.log('Hit URL', req.url, 'with following:');
      logtail.log('Hit URL', req.url, 'with following:');
      console.group();
      console.log('Query:', req.query);
      console.log('Body:', req.body);
      logtail.log('Query:', req.query);
      logtail.log('Body:', req.body);
      console.groupEnd();
      logtail.flush();
      return next();
    },
  },
};
