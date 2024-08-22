/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {

		const allowedOrigins = [
			"https://unsplash-cloudflare-page.pages.dev",
			"https://localhost:3000"
		]
		const corsHeaders = origin => ({
			'Access-Control-Allow-Headers': "*",
			"Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
			"Access-Control-Max-Age": "86400",
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
			const allowedOrigin = checkOrigin(request)

			return new Response(JSON.stringify(images), {
				headers: {
					'Content-type': 'application/json',
					...corsHeaders(allowedOrigin)
				}
			})
		}




		if (request.method === "OPTIONS") {
			const allowedOrigin = checkOrigin(request);
			return new Response("OK", { headers: corsHeaders(allowedOrigin) })
		}
		if (request.method === "POST") {
			return getImages(request)
		}
		// Redirect any other requests to a different URL, such as
		// your deployed React application
		return new Response.redirect("https://unsplash-cloudflare-page.pages.dev/")
	},
};
