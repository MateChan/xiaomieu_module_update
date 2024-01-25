import { parseFeed } from "https://deno.land/x/rss@1.0.0/mod.ts";
import {
  RichEmbed,
  Webhook,
} from "https://deno.land/x/discord_webhook@1.0.0/mod.ts";

const FEED_URL = Deno.env.get("FEED_URL") ?? "";
const DISCORD_WEBHOOK_URL = Deno.env.get("DISCORD_WEBHOOK_URL") ?? "";

async function checkFeed() {
  const res = await fetch(FEED_URL);
  const xml = await res.text();
  const { entries } = await parseFeed(xml);
  const { id, title: { value } } = entries[0];
  const kv = await Deno.openKv();
  const latestId = await kv.get<string>(["latestId"]);
  if (id !== latestId.value) {
    await kv.set(["latestId"], id);
    const client = new Webhook(DISCORD_WEBHOOK_URL);
    client.post(
      new RichEmbed(
        value.split("/").at(-1),
        "XiaomiEUModuleが更新されました",
        id,
        undefined,
        0xff6900,
      ),
    );
    console.log(id);
  } else {
    console.log("no update");
  }
}

Deno.cron("check", { minute: { every: 10 } }, checkFeed);
