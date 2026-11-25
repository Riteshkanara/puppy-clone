# Deployment

The project is a Vite-built single-page application and is configured for static hosting on Vercel.

## Build locally

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Run quality checks:

```bash
npm run lint
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The production output is generated in `dist/`.

## Vercel configuration

The repository includes `vercel.json` with a rewrite that sends application paths to `/index.html`.

This is required because React Router resolves routes in the browser. Without the rewrite, a direct request or refresh on a nested route may return a hosting 404 instead of loading the React application.

## Deployment steps

1. Push the reviewed project branch to the intended Git remote.
2. Import or select the repository in Vercel.
3. Use the Vite defaults: install with `npm install`, build with `npm run build`, output directory `dist`.
4. Deploy.
5. Open the deployed URL and test both the home page and direct nested routes.
6. Check browser console and network requests for missing assets or runtime errors.

## Post-deployment checklist

- Home route loads.
- `/puppies` works when opened directly and refreshed.
- A valid puppy detail route loads.
- An unknown route shows the not-found page.
- Images, fonts and icons load.
- Navigation and browser history work.
- Responsive layouts and reduced-motion behaviour remain usable.

## Deployment reference

The earlier project notes identify this deployment URL:

https://puppy-clone-zeta.vercel.app/

Treat this as the previously recorded deployment address. Confirm that it still points to the intended latest build before sharing it as the final submission URL.

## Important limitations

There is no backend deployment in this project. Do not configure or describe database, authentication, payment or server API deployment unless those systems are added separately.
