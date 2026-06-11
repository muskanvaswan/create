# A statically generated blog example using Next.js, Markdown, and TypeScript

## Admin auth (passkey) environment variables

The `/admin` editor is protected by a single-owner passkey. Locally everything
is stored in the gitignored `_auth/` directory and no configuration is needed.
On hosts with a read-only filesystem (e.g. Vercel) set these environment
variables:

- `AUTH_SECRET` (required) — random string used to sign session and challenge
  cookies. Generate one with `openssl rand -hex 32`.
- `SETUP_PASSWORD` (required in production) — one-time password that gates
  passkey registration so only the owner can claim the editor. Without it,
  registration is disabled in production.
- `PASSKEY_CREDENTIAL` — JSON of the registered passkey. On read-only hosts
  the registration flow displays this value after creating the passkey; paste
  it into the host's environment variables and redeploy.

Setup flow on Vercel: set `AUTH_SECRET` and `SETUP_PASSWORD`, deploy, visit
`/admin`, enter the setup password and create the passkey, then copy the shown
JSON into `PASSKEY_CREDENTIAL` and redeploy.

## Content storage environment variables

The admin editor persists notes, folders, uploads, and TTS audio. Locally it
writes straight to the working tree (`_posts/`, `data/`, `public/`). On
read-only hosts like Vercel, set these so every save becomes a commit to the
GitHub repo instead (which also triggers a redeploy that republishes the
static pages):

- `GITHUB_REPO` — the repo that holds the content, e.g. `muskanvaswan/notes`.
- `GITHUB_TOKEN` — a fine-grained personal access token for that repo with
  the **Contents: Read and write** permission (github.com → Settings →
  Developer settings → Fine-grained tokens).
- `GITHUB_BRANCH` — branch to commit to, defaults to `main`.

Each note save produces a commit for the markdown file and one for the
regenerated audio, so the public site catches up as soon as the triggered
deploy finishes (about a minute). The admin editor itself reads through the
GitHub API, so it always sees the latest content immediately.

This is the existing [blog-starter](https://github.com/vercel/next.js/tree/canary/examples/blog-starter) plus TypeScript.

This example showcases Next.js's [Static Generation](https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates) feature using Markdown files as the data source.

The blog posts are stored in `/_posts` as Markdown files with front matter support. Adding a new Markdown file in there will create a new blog post.

To create the blog posts we use [`remark`](https://github.com/remarkjs/remark) and [`remark-html`](https://github.com/remarkjs/remark-html) to convert the Markdown files into an HTML string, and then send it down as a prop to the page. The metadata of every post is handled by [`gray-matter`](https://github.com/jonschlinkert/gray-matter) and also sent in props to the page.

## Demo

[https://next-blog-starter.vercel.app/](https://next-blog-starter.vercel.app/)

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/next.js/tree/canary/examples/blog-starter&project-name=blog-starter&repository-name=blog-starter)

### Related examples

- [AgilityCMS](/examples/cms-agilitycms)
- [Builder.io](/examples/cms-builder-io)
- [ButterCMS](/examples/cms-buttercms)
- [Contentful](/examples/cms-contentful)
- [Cosmic](/examples/cms-cosmic)
- [DatoCMS](/examples/cms-datocms)
- [DotCMS](/examples/cms-dotcms)
- [Drupal](/examples/cms-drupal)
- [Enterspeed](/examples/cms-enterspeed)
- [Ghost](/examples/cms-ghost)
- [GraphCMS](/examples/cms-graphcms)
- [Kontent.ai](/examples/cms-kontent-ai)
- [MakeSwift](/examples/cms-makeswift)
- [Payload](/examples/cms-payload)
- [Plasmic](/examples/cms-plasmic)
- [Prepr](/examples/cms-prepr)
- [Prismic](/examples/cms-prismic)
- [Sanity](/examples/cms-sanity)
- [Sitecore XM Cloud](/examples/cms-sitecore-xmcloud)
- [Sitefinity](/examples/cms-sitefinity)
- [Storyblok](/examples/cms-storyblok)
- [TakeShape](/examples/cms-takeshape)
- [Tina](/examples/cms-tina)
- [Umbraco](/examples/cms-umbraco)
- [Umbraco heartcore](/examples/cms-umbraco-heartcore)
- [Webiny](/examples/cms-webiny)
- [WordPress](/examples/cms-wordpress)
- [Blog Starter](/examples/blog-starter)

## How to use

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init), [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/), or [pnpm](https://pnpm.io) to bootstrap the example:

```bash
npx create-next-app --example blog-starter blog-starter-app
```

```bash
yarn create next-app --example blog-starter blog-starter-app
```

```bash
pnpm create next-app --example blog-starter blog-starter-app
```

Your blog should be up and running on [http://localhost:3000](http://localhost:3000)! If it doesn't work, post on [GitHub discussions](https://github.com/vercel/next.js/discussions).

Deploy it to the cloud with [Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).

# Notes

`blog-starter` uses [Tailwind CSS](https://tailwindcss.com) [(v3.0)](https://tailwindcss.com/blog/tailwindcss-v3).
