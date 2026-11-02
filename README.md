# Matcha corner

A tiny pretend café for matcha lovers. Pick drinks and snacks, help whisk, sip it up and get a fortune. Or send it as a treat: your friend gets a link that opens an order that's all theirs.

No backend: a treat lives inside its link (`/4u/ur2/Bea/Nino` = 1 ube matcha and 2 revel bars, for Bea, from Nino), and the stamp card is saved in the browser.

## Built with

- [PlopUI](https://plopui.com) (`@plop-ui/react`), a hand-drawn React UI kit. Every sticky note, sticker button, ticket and buddy here comes from it.
- React and Vite

## Run it

```sh
npm install
npm run dev
```

`npm run build` makes a production build in `dist/`, and `npm run lint` checks the code.

## Deploy

Works on any static host. `vercel.json` (Vercel) and `public/_redirects` (Netlify) send `/4u/...` treat links to the app.

## Menu

Items live in `src/menu.js`. Each item's one-letter `code` is used in treat links, so never change or reuse one.
