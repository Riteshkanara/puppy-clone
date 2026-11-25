# Deployment

Host: Vercel. Live URL: TODO

## Settings
| Setting | Value |
|---|---|
| Framework | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |

## SPA routing
`vercel.json` rewrites every path to `/index.html`, so refreshing `/puppies` or `/puppies/<slug>` does not 404. React Router then renders the route.

## Redeploy
Push to `main`. Vercel builds and deploys. To roll back, open the Vercel dashboard, choose an earlier deployment and promote it.

## Verify after deploy
Home, a puppy page, refresh on a non-home route, a bad URL, `/how-it-works#imported`, and a phone.