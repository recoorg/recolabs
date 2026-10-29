import { createNetworkApiMiddleware } from "../../server/apiRouter.ts"

const middleware = createNetworkApiMiddleware()

export default async function handler(req, res) {
  return new Promise((resolve) => {
    middleware(req, res, () => {
      res.statusCode = 404
      res.end(JSON.stringify({ error: "Endpoint not found" }))
      resolve()
    }).then(resolve).catch((err) => {
      res.statusCode = 500
      res.end(JSON.stringify({ error: err.message }))
      resolve()
    })
  })
}
