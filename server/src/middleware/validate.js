/**
 * Wrapper para usar un schema zod como validador de body.
 * Reemplaza req.body por el objeto parseado (con defaults aplicados).
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: 'Datos inválidos.',
        issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      })
    }
    req.body = result.data
    next()
  }
}
