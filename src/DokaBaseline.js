import { html, css, LitElement } from 'lit';
import { Task } from '@lit/task';
// eslint-disable-next-line no-unused-vars
import BaselineIcon from '../libs/baseline-status/baseline-icon';
import { ICONS as BROWSER_ICONS } from '../libs/baseline-status/browser-icons';
import { SUPPORT_ICONS } from '../libs/baseline-status/support-icons';
import { transformToBaselineObject } from './Utils';

export class DokaBaseline extends LitElement {
    static get styles() {
        return css`
            :host {
                --doka-baseline-color-limited: light-dark(#ea8600, #f09418);
                --doka-baseline-color-newly: light-dark(#1a73e8, #1b6ef3);
                --doka-baseline-color-widely: light-dark(#1e8e3e, #1ea446);
                --doka-baseline-color-no_data: light-dark(#707070, #909090);

                --doka-baseline-bgcolor-limited: light-dark(#ea8600, #f09418);
                --doka-baseline-bgcolor-newly: light-dark(#1a73e8, #1b6ef3);
                --doka-baseline-bgcolor-widely: light-dark(#1e8e3e, #1ea446);

                --doka-baseline-color-border: light-dark(#d9d9d9, #808080);

                display: block;
                max-width: 800px;

                // color: var(--doka-baseline-text-color, #000);
            }

            .doka-baseline {
                padding: 8px 24px;
                font-family: inherit;
                font-size: 14px;
                font-style: normal;
                border: solid 1px var(--doka-baseline-color-border);
                border-radius: 8px;
            }

            .doka-baseline.limited {
                // background-color: hsl(var(--doka-baseline-color-limited) / 0.3);

                .badge {
                    background: var(--doka-baseline-color-limited);
                }
            }

            .doka-baseline.newly {
                .badge {
                    background: var(--doka-baseline-color-widely);
                }
            }

            .doka-baseline.widely {
                .badge {
                    background: var(--doka-baseline-color-newly);
                }
            }

            .doka-baseline.no_data {
                .badge {
                    background: var(--doka-baseline-color-no_data);
                }
            }

            // a,
            // a:active,
            // a:visited {
            //     color: var(--baseline-status-color-link);
            // }

            .name {
                font-weight: normal;
                font-size: 20px;
                margin: 0;
            }

            ::slotted(*) {
                color: grey;
                font-style: italic;
                font-size: 80%;
            }

            .status-container {
                gap: 1rem;
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
                flex: 1;
            }

            .status-container div:first-child {
                display: flex;
                align-items: center;
                gap: 0.2rem;
                line-height: normal;
            }

            .badge {
                background: #3367d6;
                color: #fff;
                font-size: 11px;
                padding: 0 4px;
                border-radius: 2px;
                text-transform: uppercase;
                line-height: 20px;
                margin-inline: 0.5rem;
                white-space: nowrap;
            }

            .doka-baseline-browsers {
                font-size: 0;
                max-width: 200px;
                display: flex;
                gap: 16px;
            }

            .doka-baseline-browsers .browser-support {
                white-space: nowrap;
            }

            .support-newly {
                color: var(--doka-baseline-color-newly);
            }

            .support-widely,
            .support-available {
                color: var(--doka-baseline-color-widely);
            }

            .support-unavailable {
                color: var(--doka-baseline-color-limited);
            }

            .support-no_data {
                color: var(--doka-baseline-color-no_data);
            }

            summary {
                display: flex;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                flex-wrap: wrap;
                gap: 16px;
                justify-content: space-between;
                padding: 16px 0;
            }
        `;
    }

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
        return html`<div class="badge">${badge}</span>`;
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
            <div class="doka-baseline-browsers">
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
            <div class="doka-baseline ${supportStatus}">
                <div class="name">${name}</div>
                <details>
                    <summary aria-label="${ariaLabel}">
                        <baseline-icon
                            support="${supportStatus}"
                            aria-hidden="true"
                        ></baseline-icon>
                        <div class="status-container" aria-hidden="true">
                            ${this.renderBadge(badge)}
                            ${this.renderImplementationsInfo(baselineObj)}
                        </div>
                    </summary>
                    ${this.renderDescription(baselineObj)}
                </details>
                <div></div>
            </div>
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
