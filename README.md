# \<doka-baseline>

This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

## Local Demo with `web-dev-server`

```bash
npm start
```

To run a local development server that serves the basic demo located in `demo/index.html`

## Usage

```js
// doka-baseline.js:

import { DokaBaseline } from './src/DokaBaseline.js';

window.customElements.define('doka-baseline', DokaBaseline);
```

```html
<script type="module">
    import './doka-baseline.js';
</script>

<doka-baseline groupId="text-wrap"></doka-baseline>
```

## Linting and formatting

To scan the project for linting and formatting errors, run

```bash
npm run lint
```

To automatically fix linting and formatting errors, run

```bash
npm run format
```

## Testing with Web Test Runner

To execute a single test run:

```bash
npm run test
```

To run the tests in interactive watch mode run:

```bash
npm run test:watch
```

## Building

To execute building:

```bash
npm run build
```
