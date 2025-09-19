import { html, css, LitElement } from 'lit';
import { Task } from '@lit/task';
// eslint-disable-next-line no-unused-vars
import BaselineIcon from '../libs/baseline-status/baseline-icon';
import { ICONS as BROWSER_ICONS } from '../libs/baseline-status/browser-icons';
import { SUPPORT_ICONS } from '../libs/baseline-status/support-icons';
import { transformToBaselineObject } from './Utils';

export class DokaBaseline extends LitElement {
    static styles = css`
        :host {
            display: block;
            padding: 25px;
            color: var(--doka-baseline-text-color, #000);
        }
    `;

    static properties = {
        groupId: { type: String },
    };

    constructor() {
        super();
        this.groupId = '';
    }

    fetchData = new Task(this, {
        task: async ([id], { signal }) => {
            const url = `https://api.webstatus.dev/v1/features/${id}`;
            const response = await fetch(url, { signal, cache: 'force-cache' });

            if (!response.ok) {
                throw new Error(response.status);
            }

            return response.json();
        },
        args: () => [this.groupId],
    });

    renderBadge(badge) {
        return html`<span class="baseline-badge">${badge}</span>`;
    }

    renderBrowserSupport(browser) {
        const { id, data } = browser;
        const { status = 'unavailable', version } = data;
        return html`
            <span class="browser-support">
                ${BROWSER_ICONS[id]}
                <browser-support-icon class="support-${status}">
                    ${SUPPORT_ICONS[status]}
                </browser-support-icon>
                ${version
                    ? html`<span class="browser-version">${version}</span>`
                    : ''}
            </span>
        `;
    }

    renderImplementationsInfo(baselineObj) {
        const { implementations } = baselineObj;

        return html`
            <div class="browsers">
                ${implementations.map(browser =>
                    this.renderBrowserSupport(browser),
                )}
            </div>
        `;
    }

    renderDescription(baselineObj) {
        const { supportStatus, description, id } = baselineObj;

        return html`
            <p>${description}</p>
            <p>
                ${supportStatus === 'no_data'
                    ? ''
                    : html`<a
                          href="https://web-platform-dx.github.io/web-features-explorer/features/${id}/"
                          target="_top"
                          >Learn more</a
                      >`}
            </p>
        `;
    }

    renderBaseline(baselineObj) {
        if (baselineObj === null) {
            return null;
        }

        const { name, badge, ariaLabel, supportStatus } = baselineObj;
        //     // >
        //       <div class="baseline-status-title" aria-hidden="true">
        //         <div>${preTitle} ${title} ${year} ${badge}</div>

        //       </div>
        //     </div>

        //     <span class="open-icon" aria-hidden="true">
        //       <svg xmlns="http://www.w3.org/2000/svg" width="11" height="7" viewBox="0 0 11 7" fill="none">
        //         <path d="M5.5 6.45356L0.25 1.20356L1.19063 0.262939L5.5 4.59419L9.80937 0.284814L10.75 1.22544L5.5 6.45356Z" fill="currentColor"/>
        //       </svg>
        //     </span>
        console.log('renderBaseline:', {
            name,
            badge,
            ariaLabel,
            supportStatus,
        });

        return html`
            <div class="name">${name}</div>
            <details>
                <summary aria-label="${ariaLabel}">
                    <baseline-icon
                        support="${supportStatus}"
                        aria-hidden="true"
                    ></baseline-icon>
                    <div class="status" aria-hidden="true">
                        ${this.renderBadge(badge)}
                        ${this.renderImplementationsInfo(baselineObj)}
                    </div>
                </summary>
                ${this.renderDescription(baselineObj)}
            </details>
            <div></div>
        `;
    }

    render() {
        if (!this.groupId) {
            return null;
        }
        return this.fetchData.render({
            pending: () => null, // this.renderTemplate(missingFeature, true)
            complete: responseData => {
                const baselineObj = transformToBaselineObject(responseData);

                return this.renderBaseline(baselineObj);
            },
            error: () => {
                const emptyBaselineObj = transformToBaselineObject();
                return this.renderBaseline(emptyBaselineObj);
            },
        });
    }
}
