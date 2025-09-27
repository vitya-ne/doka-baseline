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
                --limited: 34 100% 46%;
                --newly: 214 82% 51%;
                --widely: 137 65% 34%;
                --no_data: 0 0% 44%;

                --limited-dark: 34 88% 52%;
                --newly-dark: 217 90% 53%;
                --widely-dark: 138 69% 38%;
                --no_data-dark: 0 0% 44%;

                --doka-baseline-limited-color: light-dark(
                    hsl(var(--limited)),
                    hsl(var(--limited-dark))
                );
                --doka-baseline-newly-color: light-dark(
                    hsl(var(--newly)),
                    hsl(var(--newly-dark))
                );
                --doka-baseline-widely-color: light-dark(
                    hsl(var(--widely)),
                    hsl(var(--widely-dark))
                );
                --doka-baseline-no_data-color: light-dark(
                    hsl(var(--no_data)),
                    hsl(var(--no_data-dark))
                );

                --doka-baseline-bgcolor-limited: light-dark(
                    hsl(var(--limited) / 0.14),
                    hsl(var(--limited-dark) / 0.07)
                );
                --doka-baseline-bgcolor-newly: light-dark(
                    hsl(var(--newly) / 0.14),
                    hsl(var(--newly-dark) / 0.07)
                );
                --doka-baseline-bgcolor-widely: light-dark(
                    hsl(var(--widely) / 0.14),
                    hsl(var(--widely-dark) / 0.07)
                );

                --doka-baseline-color-border: light-dark(
                    hsl(0, 0%, 85%),
                    hsl(0, 0%, 50%)
                );

                --doka-baseline-badge-color: hsl(0, 0%, 100%);
                --doka-baseline-font-size: var(--font-size-m, 14px);
                --doka-baseline-link-color: var(--text-color, inherit);
                --doka-baseline-stroke-color: var(
                    --stroke-color,
                    var(--doka-baseline-color-border)
                );
                --doka-baseline-max-width: 1440px;

                display: block;
                max-width: var(--doka-baseline-max-width);
            }

            .doka-baseline {
                padding: 0 1rem;
                font-size: var(--doka-baseline-font-size);
                font-style: normal;
                border-radius: 8px;

                details:open {
                    padding-bottom: 1px;

                    .browser-version {
                        visibility: visible;
                    }
                }
            }

            .doka-baseline.with-name {
                padding-top: 2px;
            }

            .doka-baseline.limited {
                background: var(--doka-baseline-bgcolor-limited);

                .badge {
                    background: var(--doka-baseline-limited-color);
                }
            }

            .doka-baseline.newly {
                background: var(--doka-baseline-bgcolor-newly);

                .badge {
                    background: var(--doka-baseline-newly-color);
                }
            }

            .doka-baseline.widely {
                background: var(--doka-baseline-bgcolor-widely);

                .badge {
                    background: var(--doka-baseline-widely-color);
                }
            }

            .doka-baseline.no_data {
                .badge {
                    background: var(--doka-baseline-no_data-color);
                }
                border: solid 1px var(--doka-baseline-color-border);
            }

            .name {
                font-weight: normal;
                font-size: 20px;
                margin: 0;
                padding-top: 8px;
            }

            .status-container {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                flex: 1;
                gap: 1rem;
            }

            .status-title {
                display: flex;
                align-items: center;
                white-space: nowrap;
                gap: 0.5rem;
                font-weight: bold;
            }

            .badge {
                padding: 0 0.5rem;
                line-height: 2;
                text-transform: uppercase;
                font-size: 12px;
                border-radius: 4px;
                color: var(--doka-baseline-badge-color);
            }

            .browsers {
                display: flex;
                gap: 16px;
                max-width: 200px;
                font-size: 0;
            }

            .browsers .browser-support {
                white-space: nowrap;
                position: relative;
                line-height: normal;
            }

            .support-widely,
            .support-available {
                color: var(--doka-baseline-widely-color);
            }

            .browsers.newly {
                .support-available {
                    color: var(--doka-baseline-newly-color);
                }
            }

            .support-unavailable {
                color: var(--doka-baseline-limited-color);
            }

            .support-no_data {
                color: var(--doka-baseline-no_data-color);
            }

            .browser-version {
                visibility: hidden;
                position: absolute;
                width: 50%;
                text-align: center;
                font-size: 14px;
                font-weight: normal;
            }

            summary {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                padding: 16px 0;
                cursor: pointer;
                font-size: 16px;
            }

            details {
                p + p {
                    margin-top: 12px;
                    margin-bottom: 16px;
                }

                p.link-list a {
                    margin-right: 1rem;
                }

                a,
                a:active,
                a:visited {
                    text-decoration-color: var(--doka-baseline-stroke-color);
                    color: var(--doka-baseline-link-color);
                    text-underline-offset: 0.125em;
                }
            }
        `;
    }

    static properties = {
        groupId: { type: String },
        showName: { type: String },
    };

    constructor() {
        super();
        this.groupId = '';
        this.showName = 'false';
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

    renderStatusTitle(baselineObj) {
        const { badge, dates, showYear } = baselineObj;
        return html`
            <div class="status-title">
                <span class="badge">${badge}</span>${showYear
                    ? `${dates.year}`
                    : ''}
            </div>
        `;
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
                    ? html`<div class="browser-version">${version}</div>`
                    : ''}
            </span>
        `;
    }

    renderImplementationsInfo(baselineObj) {
        const { implementations, supportStatus } = baselineObj;

        return html`
            <div class="browsers ${supportStatus}">
                ${implementations.map(browser =>
                    this.renderBrowserSupport(browser),
                )}
            </div>
        `;
    }

    renderSpecLinks(description) {
        const { specLinks, specLinkText } = description;

        if (specLinks) {
            return html`
                <p class="link-list">
                    ${specLinks.map(
                        link =>
                            html`<a
                                href=${link}
                                target="_blank"
                                rel="noopener noreferrer"
                                >${specLinkText}
                            </a>`,
                    )}
                </p>
            `;
        }
    }

    renderDescription(baselineObj) {
        const { description } = baselineObj;
        const { text, featureLink, featureLinkText } = description;

        return html`
            <p>${text}</p>
            ${featureLink
                ? html`
                      <p>
                          <a
                              href=${featureLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              >${featureLinkText}</a
                          >
                      </p>
                  `
                : ''}
            ${this.renderSpecLinks(description)}
        `;
    }

    renderName(name) {
        if (this.showName === 'true') {
            return html`<div class="name">${name}</div>`;
        }
        return null;
    }

    renderBaseline(baselineObj) {
        if (baselineObj === null) {
            return null;
        }

        const { name, ariaLabel, supportStatus } = baselineObj;

        //     <span class="open-icon" aria-hidden="true">
        //       <svg xmlns="http://www.w3.org/2000/svg" width="11" height="7" viewBox="0 0 11 7" fill="none">
        //         <path d="M5.5 6.45356L0.25 1.20356L1.19063 0.262939L5.5 4.59419L9.80937 0.284814L10.75 1.22544L5.5 6.45356Z" fill="currentColor"/>
        //       </svg>
        //     </span>

        const mainClass = `doka-baseline ${supportStatus}${this.showName === 'true' ? ' with-name' : ''}`;

        return html`
            <div class=${mainClass}>
                ${this.renderName(name)}
                <details>
                    <summary aria-label="${ariaLabel}">
                        <baseline-icon
                            support="${supportStatus}"
                            aria-hidden="true"
                        ></baseline-icon>
                        <div class="status-container" aria-hidden="true">
                            ${this.renderStatusTitle(baselineObj)}
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
