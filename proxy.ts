// think of proxy as a wall in front of your server. proxy intercepts the request.
// ex: user authentication if user is authenticated the proxy server will forward the requst to the next js sever etc 
// if not it will redirect user to login or register route. 

// it wont interact with next js server if the condition is not met. this would be cheaper in long run

// it is a superlightweight layer which is fast then normal server


import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);

    // THIS IS NOT SECURE!
    // This is the recommended approach to optimistically redirect users
    // We recommend handling auth checks in each page/route
	if (!sessionCookie) {
		return NextResponse.redirect(new URL("/auth/login", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/blog", "/create"], // Specify the routes the middleware applies to
};

//this is the first check. Second check should be the server side check. Do it in the both ends to ensure safe routing.