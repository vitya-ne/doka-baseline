import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import '../doka-baseline.js';

describe('DokaBaseline', () => {

    it('passes the a11y audit', async () => {
        const el = await fixture(html`<doka-baseline></doka-baseline>`);

        await expect(el).shadowDom.to.be.accessible();
    });
});
