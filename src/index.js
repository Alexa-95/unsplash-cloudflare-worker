/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const allowedOrigins = [
	"https://localhost:3000",
	"https://unsplash-cloudflare-page.pages.dev/"
]
const corsHeaders = origin => ({
	'Access-Control-Allow-Headers': "*",
	'Access-Control-Allow-Methods': "POST",
	'Access-Control-Allow-Origin': origin
})

const checkOrigin = request => {
	const origin = request.headers.get("Origin")
	const foundOrigin = allowedOrigins.find(allowedOrigin => allowedOrigin.includes(origin))
	return foundOrigin ? foundOrigin : allowedOrigins[0]
}

const getImages = async request => {
	const CLIENT_ID = "sYCTLK04wMqwqi7XCWhsqu2YphveyN86l7jWnWPZJNU";
	const { query } = await request.json();

	// Create a new Unsplash URL
	const url = new URL("https://api.unsplash.com/search/photos")
	// Set the client ID from a secret set via `wrangler secret`
	url.searchParams.set("client_id", CLIENT_ID)
	// Only return nine results for a nice grid layout
	url.searchParams.set("per_page", 9)
	// Set the query/keyword to the value from request body
	url.searchParams.set("query", query)

	// Make a request to Unsplash's API
	const resp = await fetch(url)

	const data = await resp.json()
	const images = data.results.map(image => ({
		id: image.id,
		image: image.urls.small,
		link: image.links.html,
	}))

	// Check that the request's origin is a valid origin, allowed to access this API
	const allowedOrigin = checkOrigin(event.request)

	return new Response(JSON.stringify(images), {
		headers: {
			'Content-type': 'application-json',
			...corsHeaders(allowedOrigin)
		}
	})
}

export default {
	async fetch(request, env, ctx) {
		if (request.method === "OPTIONS") {
			const allowedOrigin = checkOrigin(event.request)
			return new Response("OK", { headers: corsHeaders(allowedOrigin) })
		}
		if (request.method === "POST") {
			return getImages(request)
		}
	},
};
