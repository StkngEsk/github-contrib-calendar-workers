import { Router } from 'itty-router';
import {load} from 'cheerio';

// Create a new router
const router = Router();


router.get('/:user/:year',  async ({ params }) => {
	// Decode text like "Hello%20world" into "Hello world"
	let user = decodeURIComponent(params.user);
	let year = decodeURIComponent(params.year);

	let { textContributions, calendar }=  await githubCalendar(user,year)

	const returnData = JSON.stringify({ textContributions, calendar }, null, 2);

	return new Response(returnData, {
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		},
	});
});


const githubCalendar = async (user = "", year = "") => {

	let calendar = "";
	let textContributions = "";
	let url = "";

	if (user !== ""  && year !== "") {
		url = `https://github.com/users/${user}/contributions?from=${year}-01-01&to=${year}-12-31`;

		const response = await fetch(url);

		const data = await response.text();

		const $ = load(data);
		$('div .graph-canvas').each(function () {
			calendar = $(this).html();
		});

		$('h2.f4').each(function () {
			textContributions = $(this).text();
		});
	}

	return { textContributions, calendar };
};

const fetchInternal = async (url) => {
	const response = await fetch(url);
	const data = await response.text();
	return data;
};

/*
This is the last route we define, it will match anything that hasn't hit a route we've defined
above, therefore it's useful as a 404 (and avoids us hitting worker exceptions, so make sure to include it!).

Visit any page that doesn't exist (e.g. /foobar) to see it in action.
*/
router.all('*', () => new Response('404, not found!', { status: 404 }));

export default {
	fetch: router.handle,
	githubCalendar
};
