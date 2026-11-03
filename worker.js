/*
Instagram Analyzer v3 - backend Cloudflare Worker

Variabili segrete da impostare nel Worker:
  IG_CLIENT_ID
  IG_CLIENT_SECRET
  FRONTEND_URL

Imposta anche FRONTEND_URL, ad esempio:
  https://w9y6p98rnp-a11y.github.io/INSTAGRAM-ANALYZER/

Il client secret NON deve mai finire nel repository GitHub.
*/

const API = "https://graph.instagram.com";

function json(data, status=200){
  return new Response(JSON.stringify(data), {
    status,
    headers: {"content-type":"application/json; charset=utf-8",
              "access-control-allow-origin":"*"}
  });
}

export default {
  async fetch(request, env){
    const url = new URL(request.url);

    if(url.pathname === "/auth/instagram"){
      const redirectUri = `${url.origin}/auth/callback`;
      const scope = "instagram_business_basic";
      const auth = new URL("https://www.instagram.com/oauth/authorize");
      auth.searchParams.set("client_id", env.IG_CLIENT_ID);
      auth.searchParams.set("redirect_uri", redirectUri);
      auth.searchParams.set("response_type", "code");
      auth.searchParams.set("scope", scope);
      auth.searchParams.set("enable_fb_login", "0");
      return Response.redirect(auth.toString(), 302);
    }

    if(url.pathname === "/auth/callback"){
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error_description") || url.searchParams.get("error");
      if(error) return Response.redirect(`${env.FRONTEND_URL}?error=${encodeURIComponent(error)}`, 302);
      if(!code) return Response.redirect(`${env.FRONTEND_URL}?error=Codice OAuth mancante`, 302);

      const redirectUri = `${url.origin}/auth/callback`;

      const form = new URLSearchParams();
      form.set("client_id", env.IG_CLIENT_ID);
      form.set("client_secret", env.IG_CLIENT_SECRET);
      form.set("grant_type", "authorization_code");
      form.set("redirect_uri", redirectUri);
      form.set("code", code);

      const tokenResp = await fetch("https://api.instagram.com/oauth/access_token", {
        method:"POST",
        headers:{"content-type":"application/x-www-form-urlencoded"},
        body:form
      });
      const token = await tokenResp.json();
      if(!tokenResp.ok || !token.access_token){
        return Response.redirect(`${env.FRONTEND_URL}?error=${encodeURIComponent(token.error_message || "Token OAuth non ottenuto")}`,302);
      }

      // Scambio per token a lunga durata.
      const longUrl = new URL(`${API}/access_token`);
      longUrl.searchParams.set("grant_type","ig_exchange_token");
      longUrl.searchParams.set("client_secret",env.IG_CLIENT_SECRET);
      longUrl.searchParams.set("access_token",token.access_token);

      const longResp = await fetch(longUrl);
      const longToken = await longResp.json();
      const accessToken = longToken.access_token || token.access_token;

      const meUrl = new URL(`${API}/me`);
      meUrl.searchParams.set("fields","id,username,account_type,media_count");
      meUrl.searchParams.set("access_token",accessToken);
      const meResp = await fetch(meUrl);
      const me = await meResp.json();

      if(!meResp.ok){
        return Response.redirect(`${env.FRONTEND_URL}?error=${encodeURIComponent(me.error?.message || "Impossibile leggere il profilo")}`,302);
      }

      // Nota: non vengono restituiti follower/following se l'API corrente non li espone
      // per il tipo di account/endpoint usato. Non inventiamo numeri.
      const out = new URL(env.FRONTEND_URL);
      out.searchParams.set("connected","1");
      out.searchParams.set("username",me.username || "");
      out.searchParams.set("media",me.media_count ?? "");
      out.searchParams.set("followers","");
      out.searchParams.set("following","");
      return Response.redirect(out.toString(),302);
    }

    if(url.pathname === "/health") return json({ok:true, service:"instagram-analyzer"});

    return new Response("Instagram Analyzer backend online", {status:200});
  }
};
