/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
/**
 * @param {Request} request
 */
const corsHeaders = {
	'Access-Control-Allow-Headers': "*",
	'Access-Control-Allow-Methods': "POST",
	'Access-Control-Allow-Origin': "*"
}

const getImages = async request => {
	const CLIENT_ID = "sYCTLK04wMqwqi7XCWhsqu2YphveyN86l7jWnWPZJNU";
	const { query } = await request.json();
	const resp = await fetch(`https://api.unsplash.com/search/photos?query${query}`, {
		headers: {
			Authorization: `Client-ID ${CLIENT_ID}`
		}
	})
	const data = await resp.json()
	const images = data.results.map(image => ({
		id: image.id,
		image: image.urls.small,
		link: image.links.html,
	}))
	return new Response(JSON.stringify(images), {
		headers: {
			'Content-type': 'application-json',
			...corsHeaders
		}
	})
}

export default {
	async fetch(request, env, ctx) {
		if (request.method === "OPTIONS") {
			return new Response("OK", { headers: corsHeaders })
		}
		if (request.method === "POST") {
			return getImages(request)
		}
	},
};
