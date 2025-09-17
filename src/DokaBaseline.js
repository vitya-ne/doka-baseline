import { html, css, LitElement } from 'lit';
import { Task } from '@lit/task';
// eslint-disable-next-line no-unused-vars
import BaselineIcon from '../libs/baseline-status/baseline-icon.js';
import { ICONS, SUPPORT_ICONS } from '../libs/baseline-status/browser-icons.js';
// import { statusTypes, implemimplementationTypesentationStatusTypes } from './Types';
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

    renderSupport(implementationId, support = 'unavailable') {
        const supportKey =
            support === 'newly' || support === 'widely' ? 'available' : support;

        return html`
            <span>
                ${ICONS[implementationId]}
                <browser-support-icon class="support-${support}">
                    ${SUPPORT_ICONS[supportKey]}
                </browser-support-icon>
            </span>
        `;
    }

    renderImplementationsInfo(baselineObj) {
        const { supportStatus, implementations } = baselineObj;
        const { chrome, edge, firefox, safari } = implementations;

        return html`
            <div class="browsers">
                ${this.renderSupport(
                    'chrome',
                    supportStatus === 'limited'
                        ? chrome?.status
                        : supportStatus,
                )}
                ${this.renderSupport(
                    'edge',
                    supportStatus === 'limited' ? edge?.status : supportStatus,
                )}
                ${this.renderSupport(
                    'firefox',
                    supportStatus === 'limited'
                        ? firefox?.status
                        : supportStatus,
                )}
                ${this.renderSupport(
                    'safari',
                    supportStatus === 'limited'
                        ? safari?.status
                        : supportStatus,
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

        console.log(':', baselineObj);
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
            error: () => null, // this.renderTemplate(missingFeature),
        });
    }
}
