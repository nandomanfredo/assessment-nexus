// ============================================================
// Auth.gs — Autenticação e gestão de usuários
// Assessment Nexus · Nexus Consultoria
// ============================================================

const SHEET_NAME_USUARIOS = 'Usuarios';
const SHEET_NAME_SESSOES  = 'Sessoes';
const SESSION_TTL_HORAS   = 24;

// Colunas da aba Usuarios (0-based)
const COL_USR = {
  ID:        0,
  USERNAME:  1,
  NOME:      2,
  PASS_HASH: 3,
  SALT:      4,
  ROLE:      5,   // admin | consultor | visualizador
  ATIVO:     6,
  CRIADO_EM: 7,
};

// Colunas da aba Sessoes (0-based)
const COL_SESS = {
  TOKEN:     0,
  USER_ID:   1,
  USERNAME:  2,
  ROLE:      3,
  CRIADO_EM: 4,
  EXPIRA_EM: 5,
};

const HEADERS_USUARIOS = ['ID', 'Username', 'Nome', 'PasswordHash', 'Salt', 'Role', 'Ativo', 'CriadoEm'];
const HEADERS_SESSOES  = ['Token', 'UserId', 'Username', 'Role', 'CriadoEm', 'ExpiraEm'];

// ── Autenticação ──────────────────────────────────────────────

function loginUsuario(username, senha) {
  if (!username || !senha) return { ok: false, erro: 'Credenciais inválidas.' };

  const sheet  = _getSheetUsuarios();
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row[COL_USR.ID]) continue;
    if (row[COL_USR.USERNAME] === username && row[COL_USR.ATIVO] === true) {
      const salt     = String(row[COL_USR.SALT]);
      const hashEsp  = String(row[COL_USR.PASS_HASH]);
      const hashCalc = _hashSenha(senha, salt);
      if (hashCalc === hashEsp) {
        const token = _criarSessao(
          String(row[COL_USR.ID]),
          String(row[COL_USR.USERNAME]),
          String(row[COL_USR.ROLE])
        );
        return {
          ok:      true,
          token:   token,
          usuario: {
            id:       String(row[COL_USR.ID]),
            username: String(row[COL_USR.USERNAME]),
            nome:     String(row[COL_USR.NOME]),
            role:     String(row[COL_USR.ROLE]),
          },
        };
      }
    }
  }
  return { ok: false, erro: 'Usuário ou senha incorretos.' };
}

function logoutUsuario(token) {
  if (!token) return { ok: false };
  const sheet  = _getSheetSessoes();
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][COL_SESS.TOKEN] === token) {
      sheet.deleteRow(i + 1);
      return { ok: true };
    }
  }
  return { ok: false };
}

function validarSessao(token) {
  if (!token) return { ok: false, erro: 'Sessão inválida.' };
  const sheet  = _getSheetSessoes();
  const values = sheet.getDataRange().getValues();
  const agora  = new Date();

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row[COL_SESS.TOKEN]) continue;
    if (String(row[COL_SESS.TOKEN]) === String(token)) {
      const expira = new Date(row[COL_SESS.EXPIRA_EM]);
      if (agora > expira) {
        sheet.deleteRow(i + 1);
        return { ok: false, erro: 'Sessão expirada. Faça login novamente.' };
      }
      return {
        ok:      true,
        usuario: {
          id:       String(row[COL_SESS.USER_ID]),
          username: String(row[COL_SESS.USERNAME]),
          role:     String(row[COL_SESS.ROLE]),
        },
      };
    }
  }
  return { ok: false, erro: 'Sessão inválida. Faça login novamente.' };
}

// ── Gestão de usuários (admin only) ──────────────────────────

function listarUsuarios(token) {
  const sessao = validarSessao(token);
  if (!sessao.ok)                        return { ok: false, erro: sessao.erro };
  if (sessao.usuario.role !== 'admin')   return { ok: false, erro: 'Acesso negado.' };

  const sheet  = _getSheetUsuarios();
  const values = sheet.getDataRange().getValues();
  const lista  = values.slice(1)
    .filter(r => r[COL_USR.ID])
    .map(row => ({
      id:       String(row[COL_USR.ID]),
      username: String(row[COL_USR.USERNAME]),
      nome:     String(row[COL_USR.NOME]),
      role:     String(row[COL_USR.ROLE]),
      ativo:    row[COL_USR.ATIVO] === true,
      criadoEm: String(row[COL_USR.CRIADO_EM]),
    }));
  return { ok: true, usuarios: lista };
}

function criarUsuario(token, dados) {
  const sessao = validarSessao(token);
  if (!sessao.ok)                        return { ok: false, erro: sessao.erro };
  if (sessao.usuario.role !== 'admin')   return { ok: false, erro: 'Acesso negado.' };
  if (!dados || !dados.username || !dados.senha || !dados.nome) {
    return { ok: false, erro: 'Campos obrigatórios: username, senha, nome.' };
  }

  const sheet  = _getSheetUsuarios();
  const values = sheet.getDataRange().getValues();
  const existe = values.slice(1).some(r => r[COL_USR.USERNAME] === dados.username);
  if (existe) return { ok: false, erro: 'Username já está em uso.' };

  const id    = Utilities.getUuid();
  const salt  = _gerarSalt();
  const hash  = _hashSenha(dados.senha, salt);
  const agora = new Date().toISOString();

  const row = new Array(HEADERS_USUARIOS.length).fill('');
  row[COL_USR.ID]        = id;
  row[COL_USR.USERNAME]  = String(dados.username).toLowerCase().trim();
  row[COL_USR.NOME]      = dados.nome;
  row[COL_USR.PASS_HASH] = hash;
  row[COL_USR.SALT]      = salt;
  row[COL_USR.ROLE]      = dados.role || 'consultor';
  row[COL_USR.ATIVO]     = true;
  row[COL_USR.CRIADO_EM] = agora;

  sheet.appendRow(row);
  return { ok: true, id: id };
}

function atualizarUsuario(token, dados) {
  const sessao = validarSessao(token);
  if (!sessao.ok)                        return { ok: false, erro: sessao.erro };
  if (sessao.usuario.role !== 'admin')   return { ok: false, erro: 'Acesso negado.' };
  if (!dados || !dados.id)               return { ok: false, erro: 'ID do usuário obrigatório.' };

  const sheet  = _getSheetUsuarios();
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][COL_USR.ID]) === String(dados.id)) {
      if (dados.nome  !== undefined) sheet.getRange(i + 1, COL_USR.NOME  + 1).setValue(dados.nome);
      if (dados.role  !== undefined) sheet.getRange(i + 1, COL_USR.ROLE  + 1).setValue(dados.role);
      if (dados.ativo !== undefined) sheet.getRange(i + 1, COL_USR.ATIVO + 1).setValue(Boolean(dados.ativo));
      if (dados.senha && dados.senha.length > 0) {
        const salt = _gerarSalt();
        const hash = _hashSenha(dados.senha, salt);
        sheet.getRange(i + 1, COL_USR.PASS_HASH + 1).setValue(hash);
        sheet.getRange(i + 1, COL_USR.SALT      + 1).setValue(salt);
      }
      return { ok: true };
    }
  }
  return { ok: false, erro: 'Usuário não encontrado.' };
}

function deletarUsuario(token, id) {
  const sessao = validarSessao(token);
  if (!sessao.ok)                        return { ok: false, erro: sessao.erro };
  if (sessao.usuario.role !== 'admin')   return { ok: false, erro: 'Acesso negado.' };
  if (sessao.usuario.id   === id)        return { ok: false, erro: 'Você não pode excluir seu próprio usuário.' };

  const sheet  = _getSheetUsuarios();
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][COL_USR.ID]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { ok: true };
    }
  }
  return { ok: false, erro: 'Usuário não encontrado.' };
}

// ── Setup inicial ─────────────────────────────────────────────
//
// Execute esta função UMA VEZ pelo editor do Google Apps Script para criar o admin.
//
// Antes de executar:
//   1. Vá em Configurações do projeto > Propriedades do script
//   2. Adicione:  ADMIN_INITIAL_USER  = fernando.oliveira
//   3. Adicione:  ADMIN_INITIAL_PASS  = [a senha desejada]
//   4. Execute setupAdminInicial()
//   5. Após a mensagem de sucesso, REMOVA as duas propriedades

function setupAdminInicial() {
  const props    = PropertiesService.getScriptProperties();
  const username = props.getProperty('ADMIN_INITIAL_USER');
  const senha    = props.getProperty('ADMIN_INITIAL_PASS');

  if (!username || !senha) {
    throw new Error(
      'Configure ADMIN_INITIAL_USER e ADMIN_INITIAL_PASS nas propriedades do script antes de executar.'
    );
  }

  const sheet = _getSheetUsuarios();
  if (sheet.getLastRow() > 1) {
    throw new Error('Usuários já existem. Use a interface admin para adicionar mais usuários.');
  }

  const id    = Utilities.getUuid();
  const salt  = _gerarSalt();
  const hash  = _hashSenha(senha, salt);
  const agora = new Date().toISOString();

  const row = new Array(HEADERS_USUARIOS.length).fill('');
  row[COL_USR.ID]        = id;
  row[COL_USR.USERNAME]  = String(username).toLowerCase().trim();
  row[COL_USR.NOME]      = 'Fernando Oliveira';
  row[COL_USR.PASS_HASH] = hash;
  row[COL_USR.SALT]      = salt;
  row[COL_USR.ROLE]      = 'admin';
  row[COL_USR.ATIVO]     = true;
  row[COL_USR.CRIADO_EM] = agora;

  sheet.appendRow(row);

  Logger.log('✓ Admin criado: ' + username);
  Logger.log('⚠ IMPORTANTE: Remova ADMIN_INITIAL_USER e ADMIN_INITIAL_PASS das propriedades do script agora!');
  return 'Admin criado com sucesso. Remova as propriedades do script.';
}

// ── Helpers internos ──────────────────────────────────────────

function _hashSenha(senha, salt) {
  const raw  = salt + senha;
  const hash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    raw,
    Utilities.Charset.UTF_8
  );
  return hash.map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
}

function _gerarSalt() {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    Utilities.getUuid() + Date.now(),
    Utilities.Charset.UTF_8
  );
  return bytes.map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('').substring(0, 32);
}

function _criarSessao(userId, username, role) {
  const token  = Utilities.getUuid();
  const agora  = new Date();
  const expira = new Date(agora.getTime() + SESSION_TTL_HORAS * 60 * 60 * 1000);
  const sheet  = _getSheetSessoes();

  const row = new Array(HEADERS_SESSOES.length).fill('');
  row[COL_SESS.TOKEN]     = token;
  row[COL_SESS.USER_ID]   = userId;
  row[COL_SESS.USERNAME]  = username;
  row[COL_SESS.ROLE]      = role;
  row[COL_SESS.CRIADO_EM] = agora.toISOString();
  row[COL_SESS.EXPIRA_EM] = expira.toISOString();

  sheet.appendRow(row);
  _limparSessoesExpiradas(sheet);
  return token;
}

function _limparSessoesExpiradas(sheet) {
  try {
    const agora  = new Date();
    const values = sheet.getDataRange().getValues();
    for (let i = values.length - 1; i >= 1; i--) {
      if (!values[i][COL_SESS.EXPIRA_EM]) continue;
      const expira = new Date(values[i][COL_SESS.EXPIRA_EM]);
      if (agora > expira) sheet.deleteRow(i + 1);
    }
  } catch (_) {}
}

function _getSheetUsuarios() {
  const ss    = _getSpreadsheet();
  let   sheet = ss.getSheetByName(SHEET_NAME_USUARIOS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME_USUARIOS);
    sheet.appendRow(HEADERS_USUARIOS);
    sheet.getRange(1, 1, 1, HEADERS_USUARIOS.length)
      .setFontWeight('bold').setBackground('#2d3748').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    // Oculta colunas sensíveis (hash e salt)
    sheet.hideColumns(COL_USR.PASS_HASH + 1, 2);
  }
  return sheet;
}

function _getSheetSessoes() {
  const ss    = _getSpreadsheet();
  let   sheet = ss.getSheetByName(SHEET_NAME_SESSOES);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME_SESSOES);
    sheet.appendRow(HEADERS_SESSOES);
    sheet.getRange(1, 1, 1, HEADERS_SESSOES.length)
      .setFontWeight('bold').setBackground('#2d3748').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}
