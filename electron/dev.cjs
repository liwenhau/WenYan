const { spawn } = require('child_process');
const net = require('net');
const path = require('path');

const root = path.join(__dirname, '..');
const port = 5173;
const host = '127.0.0.1';
const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const electronBin = process.platform === 'win32'
  ? path.join(root, 'node_modules', '.bin', 'electron.cmd')
  : path.join(root, 'node_modules', '.bin', 'electron');

const waitForPort = () => new Promise((resolve, reject) => {
  const started = Date.now();
  const check = () => {
    const socket = net.createConnection({ host, port }, () => {
      socket.end();
      resolve();
    });
    socket.on('error', () => {
      if (Date.now() - started > 20000) {
        reject(new Error('Vite dev server did not start in time.'));
        return;
      }
      setTimeout(check, 250);
    });
  };
  check();
});

const vite = spawn(process.execPath, [viteBin, '--host', host, '--port', String(port)], {
  cwd: root,
  stdio: 'inherit',
  shell: false
});

const stop = () => {
  if (!vite.killed) vite.kill();
};

process.on('SIGINT', () => {
  stop();
  process.exit(0);
});
process.on('SIGTERM', () => {
  stop();
  process.exit(0);
});

waitForPort()
  .then(() => {
    const electron = spawn(electronBin, ['electron/main.cjs'], {
      cwd: root,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: {
        ...process.env,
        VITE_DEV_SERVER_URL: `http://${host}:${port}`
      }
    });

    electron.on('exit', code => {
      stop();
      process.exit(code || 0);
    });
  })
  .catch(error => {
    console.error(error.message);
    stop();
    process.exit(1);
  });
