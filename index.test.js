import { unstable_dev } from 'wrangler';
import createFetchMock from 'vitest-fetch-mock';
import { describe, expect, it, beforeAll, afterAll, vi } from 'vitest';

import stkngeskGithubCalendar from './index';

const fetchMocker = createFetchMock(vi);

describe('Worker', () => {
	let worker;
	let html = "";
	let url = "";
	let data = {};

	beforeAll(async () => {
		fetchMocker.enableMocks();
		worker = await unstable_dev('index.js', { experimental: { disableExperimentalWarning: true } });
		html = `
        <div>
			<h2 class="f4 text-normal mb-2">578 contributions in 2020</h2>
			<div class="graph-canvas"><div>Github content calendar.....</div></div>
        </div>
    `;
		url = 'https://github.com/users/christianesk/contributions?from=2023-01-01&to=2023-12-31';

		data = {
			textContributions: "578 contributions in 2020",
			calendar: "<div>Github content calendar.....</div>"
		};


	});

	afterAll(async () => {
		await worker.stop();
		fetchMocker.disableMocks();
	});

	it('should return 200 and response object', async () => {
		await fetch.mockResponse(html);
		const resp = await worker.fetch('/christianesk/2022');
		if (resp) {
			const json = await resp.json();
			expect(json.textContributions).toContain("5");
			expect(resp.status).toBe(200);
		}
	});

	it('should get github calendar ', async () => {
		fetch.mockResponse(html);
		let actual = await stkngeskGithubCalendar.githubCalendar("christianesk", "2023")
		expect(actual).toEqual(data);
		expect(fetch.requests()[0].url).toEqual(url);
	});

	it('should get github calendar with data empty', async () => {
		fetch.mockResponse(html);
		let actual = await stkngeskGithubCalendar.githubCalendar("", "")
		data.calendar = "";
		data.textContributions = "";
		expect(actual).toEqual(data);
	});

	it('should return 404 for undefined routes', async () => {
		const resp = await worker.fetch('/foobar');
		if (resp) {
			expect(resp.status).toBe(404);
		}
	});
});
