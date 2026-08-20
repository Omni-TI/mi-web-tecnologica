#!/usr/bin/env node
/**
 * CLI para crear (o actualizar) un usuario admin.
 *
 * Uso:
 *   npm run admin:create -- --user admin --password 'S3cure!Pass'
 *
 * Detrás de escena:
 *   - Hashea la contraseña con bcrypt (rondas de config).
 *   - Guarda el usuario en Sheets (pestaña `users`) si está configurado,
 *     o en `server/data/users.local.json` (gitignored) si no.
 *   - Devuelve el registro sin el hash.
 *
 * Este script NUNCA imprime la contraseña ni el hash.
 */
import { hashPassword } from '../services/auth.js'
import { upsertUser, usersBackend } from '../services/users.js'

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--user' || a === '-u') out.user = argv[++i]
    else if (a === '--password' || a === '-p') out.password = argv[++i]
    else if (a === '--role' || a === '-r') out.role = argv[++i]
    else if (a === '--help' || a === '-h') out.help = true
  }
  return out
}

function usage() {
  console.log(`
Siete Rayos — create-admin

Uso:
  npm run admin:create -- --user <username> --password <plaintext> [--role admin]

Ejemplo:
  npm run admin:create -- --user admin --password 'Cambia3sto!'

Notas:
  * La contraseña se hashea con bcrypt antes de guardarse — no se persiste en claro.
  * Si Google Sheets no está configurado, se usa server/data/users.local.json (gitignored).
  * Reejecutar con el mismo --user actualiza el registro (rota la contraseña).
`.trim())
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help || !args.user || !args.password) {
    usage()
    process.exit(args.help ? 0 : 1)
  }
  if (args.password.length < 8) {
    console.error('⛔ La contraseña debe tener al menos 8 caracteres.')
    process.exit(2)
  }
  const password_hash = await hashPassword(args.password)
  const user = await upsertUser({
    username: args.user,
    role: args.role || 'admin',
    password_hash,
  })
  console.log(`✅ Usuario '${user.username}' guardado en '${usersBackend()}' (id=${user.id}, role=${user.role}).`)
  console.log('   Ya puedes iniciar sesión desde /admin/login.')
}

main().catch((err) => {
  console.error('Error creando admin:', err.message)
  process.exit(1)
})
