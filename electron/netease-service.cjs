const http = require('http');
const fs = require('fs');
const path = require('path');

const defaultHeaders = {
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Credentials': 'true'
};

const corsHeaders = (req) => ({
  ...defaultHeaders,
  'Access-Control-Allow-Origin': req.headers.origin || 'http://127.0.0.1'
});

const responseHeaders = (res) => ({
  ...(res._wenyanCorsHeaders || defaultHeaders),
  'Content-Type': 'application/json; charset=utf-8'
});

const sendJSON = (res, payload, statusCode = 200) => {
  res.writeHead(statusCode, responseHeaders(res));
  res.end(JSON.stringify(payload));
};


const readCookieFromResponse = (response) => {
  const candidates = [
    response && response.cookie,
    response && response.body && response.body.cookie,
    response && response.body && response.body.data && response.body.data.cookie,
    response && response.body && response.body.data && response.body.data.cookies
  ];
  for (const cookies of candidates) {
    if (Array.isArray(cookies)) {
      const cookie = cookies.filter(Boolean).join('; ');
      if (cookie) return cookie;
    }
    if (typeof cookies === 'string' && cookies.trim()) return cookies.trim();
  }
  return '';
};

const normalizeLoginInfo = (profile = {}, account = {}, extra = {}) => {
  const userId = profile.userId || profile.user_id || profile.id || account.userId || account.id || extra.userId || '';
  if (!(userId || userId === 0)) return { loggedIn: false };
  return {
    loggedIn: true,
    userId,
    account,
    profile,
    nickname: profile.nickname || profile.userName || account.userName || '',
    avatar: profile.avatarUrl || profile.avatar || ''
  };
};

const mapSong = (song) => ({
  id: Number(song.id),
  title: song.name || song.title || '',
  artist: Array.isArray(song.ar)
    ? song.ar.map(artist => artist.name).filter(Boolean).join('/')
    : (Array.isArray(song.artists) ? song.artists.map(artist => artist.name).filter(Boolean).join('/') : ''),
  album: song.al && song.al.name || song.album && song.album.name || '',
  cover: song.al && song.al.picUrl || song.album && song.album.picUrl || ''
});

const createNeteaseService = ({ userDataPath }) => {
  const api = require('NeteaseCloudMusicApi');
  const {
    cloudsearch,
    song_url,
    song_url_v1,
    login_qr_key,
    login_qr_create,
    login_qr_check,
    login_status,
    logout
  } = api;

  const cookieFile = path.join(userDataPath, 'netease.cookie');
  let userCookie = '';

  const loadCookie = () => {
    try {
      userCookie = fs.readFileSync(cookieFile, 'utf8').trim();
    } catch {
      userCookie = '';
    }
  };

  const saveCookie = (cookie) => {
    userCookie = cookie || '';
    try {
      fs.mkdirSync(path.dirname(cookieFile), { recursive: true });
      fs.writeFileSync(cookieFile, userCookie, 'utf8');
    } catch {
      // Cookie persistence is nice to have; playback/search can continue without it.
    }
  };

  const handleCloudSearch = async (url, res) => {
    const keywords = url.searchParams.get('keywords') || url.searchParams.get('keyword') || '';
    const limit = Number(url.searchParams.get('limit') || 8);
    const type = Number(url.searchParams.get('type') || 1);
    if (!keywords.trim()) {
      sendJSON(res, { result: { songs: [] }, songs: [] });
      return;
    }
    const result = await cloudsearch({
      keywords,
      type,
      limit,
      offset: Number(url.searchParams.get('offset') || 0),
      cookie: userCookie,
      timestamp: Date.now()
    });
    const songs = ((result.body && result.body.result && result.body.result.songs) || [])
      .map(mapSong)
      .filter(song => song.id && song.title);
    sendJSON(res, {
      result: { songs },
      songs,
      raw: result.body
    });
  };

  const handleSongUrl = async (url, res) => {
    const id = url.searchParams.get('id');
    if (!id) {
      sendJSON(res, { error: 'Missing song id', data: [] }, 400);
      return;
    }
    const level = url.searchParams.get('level') || url.searchParams.get('quality') || 'standard';
    const request = song_url_v1 || song_url;
    const payload = song_url_v1
      ? { id, level, cookie: userCookie, timestamp: Date.now() }
      : { id, br: 320000, cookie: userCookie, timestamp: Date.now() };
    const result = await request(payload);
    const data = result.body && result.body.data || [];
    sendJSON(res, {
      data,
      url: data[0] && data[0].url || '',
      raw: result.body
    });
  };

  const handleQrKey = async (_url, res) => {
    const result = await login_qr_key({ timestamp: Date.now() });
    const key = result.body && result.body.data && result.body.data.unikey;
    sendJSON(res, { key, data: { unikey: key }, raw: result.body });
  };

  const handleQrCreate = async (url, res) => {
    const key = url.searchParams.get('key');
    const result = await login_qr_create({ key, qrimg: true, timestamp: Date.now() });
    const data = result.body && result.body.data || {};
    sendJSON(res, {
      img: data.qrimg,
      url: data.qrurl,
      data: {
        qrimg: data.qrimg,
        qrurl: data.qrurl
      },
      raw: result.body
    });
  };

  const handleQrCheck = async (url, res) => {
    const key = url.searchParams.get('key');
    let result = await login_qr_check({ key, noCookie: true, timestamp: Date.now() });
    let body = result.body || {};
    let code = Number(body.code || result.code);
    let message = body.message || result.message || '';
    let cookie = readCookieFromResponse(result);
    if (code === 803 && !cookie) {
      try {
        const retry = await login_qr_check({ key, timestamp: Date.now() });
        const retryCookie = readCookieFromResponse(retry);
        if (retryCookie) {
          result = retry;
          body = retry.body || body;
          code = Number(body.code || retry.code || code);
          message = body.message || retry.message || message;
          cookie = retryCookie;
        }
      } catch (error) {
        console.warn('[WenYan] QR cookie retry failed:', error.message);
      }
    }
    if (code === 803) {
      if (cookie) saveCookie(cookie);
      let info = { loggedIn: false };
      try {
        const status = await login_status({ cookie: userCookie, timestamp: Date.now() });
        const statusBody = status.body || {};
        const data = statusBody.data || statusBody;
        info = normalizeLoginInfo(data.profile || statusBody.profile, data.account || statusBody.account, data);
      } catch (error) {
        console.warn('[WenYan] login status after QR failed:', error.message);
      }
      if (!info.loggedIn) {
        info = normalizeLoginInfo(
          body.profile || (body.data && body.data.profile),
          body.account || (body.data && body.data.account),
          body.data || body
        );
      }
      if (!info.loggedIn && cookie) {
        info = {
          loggedIn: true,
          pendingProfile: true,
          nickname: body.nickname || (body.profile && body.profile.nickname) || '',
          avatar: body.avatarUrl || (body.profile && body.profile.avatarUrl) || ''
        };
      }
      sendJSON(res, { code, message, ...info, hasCookie: Boolean(cookie) });
      return;
    }
    sendJSON(res, { ...body, code, message, hasCookie: Boolean(cookie) });
  };

  const handleStatus = async (_url, res) => {
    if (!userCookie) {
      sendJSON(res, { loggedIn: false });
      return;
    }
    const result = await login_status({ cookie: userCookie, timestamp: Date.now() });
    const body = result.body || {};
    const data = body.data || body;
    const info = normalizeLoginInfo(data.profile || body.profile, data.account || body.account, data);
    sendJSON(res, {
      ...info,
      hasCookie: Boolean(userCookie),
      raw: body
    });
  };

  const handleLogout = async (_url, res) => {
    try {
      if (userCookie) await logout({ cookie: userCookie });
    } finally {
      saveCookie('');
    }
    sendJSON(res, { ok: true });
  };

  const server = http.createServer(async (req, res) => {
    res._wenyanCorsHeaders = corsHeaders(req);
    if (req.method === 'OPTIONS') {
      res.writeHead(204, res._wenyanCorsHeaders);
      res.end();
      return;
    }

    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      if (url.pathname === '/api/cloudsearch' || url.pathname === '/cloudsearch') {
        await handleCloudSearch(url, res);
        return;
      }
      if (url.pathname === '/api/song/url' || url.pathname === '/api/song/url/v1' || url.pathname === '/song/url/v1') {
        await handleSongUrl(url, res);
        return;
      }
      if (url.pathname === '/api/login/qr/key' || url.pathname === '/login/qr/key') {
        await handleQrKey(url, res);
        return;
      }
      if (url.pathname === '/api/login/qr/create' || url.pathname === '/login/qr/create') {
        await handleQrCreate(url, res);
        return;
      }
      if (url.pathname === '/api/login/qr/check' || url.pathname === '/login/qr/check') {
        await handleQrCheck(url, res);
        return;
      }
      if (url.pathname === '/api/login/status' || url.pathname === '/login/status') {
        await handleStatus(url, res);
        return;
      }
      if (url.pathname === '/api/logout' || url.pathname === '/logout') {
        await handleLogout(url, res);
        return;
      }
      sendJSON(res, { error: 'Not found' }, 404);
    } catch (error) {
      sendJSON(res, { error: error.message || String(error) }, 500);
    }
  });

  loadCookie();

  return {
    start: () => new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', () => {
        server.off('error', reject);
        const address = server.address();
        resolve(`http://127.0.0.1:${address.port}/api`);
      });
    }),
    close: () => new Promise(resolve => server.close(resolve))
  };
};

module.exports = {
  createNeteaseService
};
