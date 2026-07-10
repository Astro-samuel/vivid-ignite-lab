# Arduino compile server

Tiny HTTP wrapper around `arduino-cli compile`. Takes `.ino` source, returns Intel HEX.
Used by the `compile-sketch` Supabase edge function so the site can flash real code to a
physical board (browser can't run avr-gcc itself).

## API

`POST /compile`
```json
{ "code": "void setup(){...} void loop(){...}", "fqbn": "arduino:avr:uno" }
```
→ `{ "ok": true, "hex": "...", "fqbn": "arduino:avr:uno", "log": "..." }`
or `422 { "ok": false, "error": "Compilation failed", "log": "...compiler output..." }`

`fqbn` optional, defaults to `arduino:avr:uno`. Allowed boards: uno, nano, mega, leonardo
(edit `ALLOWED_FQBNS` in `server.js` to add more — remember to `arduino-cli core install`
the matching core in the Dockerfile).

Set `COMPILE_SERVER_TOKEN` and send it as `Authorization: Bearer <token>` — without it the
endpoint is open to anyone who has the URL, which on a public host means free compute for
strangers.

## Deploy (Fly.io)

```
cd compile-server
fly launch --no-deploy   # creates fly.toml, pick a region/app name
fly secrets set COMPILE_SERVER_TOKEN=$(openssl rand -hex 32)
fly deploy
```

## Deploy (Render)

New "Web Service" → build from this directory (Dockerfile detected automatically) →
set env var `COMPILE_SERVER_TOKEN` to a random secret → deploy. Note the public URL.

## Wire it to the site

In the Supabase project, set function secrets (same token you generated above):

```
supabase secrets set COMPILE_SERVER_URL=https://<your-deployed-host>
supabase secrets set COMPILE_SERVER_TOKEN=<same token as above>
```

Then deploy the edge function: `supabase functions deploy compile-sketch`.
