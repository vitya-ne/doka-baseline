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

## License

This project is licensed under the MIT License.
See [LICENSE](./LICENSE) for details.

Some portions of the code are derived from
[baseline-status](https://github.com/web-platform-dx/baseline-status).
Copyright [baseline-status contributors](https://github.com/web-platform-dx/baseline-status/graphs/contributors).
Licensed under the [Apache License 2.0](./LICENSE-APACHE).
See the [NOTICE](./NOTICE) file for attribution.
