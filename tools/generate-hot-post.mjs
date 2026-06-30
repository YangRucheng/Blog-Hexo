import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import Parser from "rss-parser";
import * as cheerio from "cheerio";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

const ROOT_DIR = process.cwd();
const POSTS_DIR = path.join(ROOT_DIR, "source", "_posts");
const TIME_ZONE = process.env.TIME_ZONE || "Asia/Shanghai";
const DRY_RUN = process.argv.includes("--dry-run") || process.env.DRY_RUN === "true";
const HOT_TOPIC = process.env.HOT_POST_TOPIC || "AI、开源项目与开发者工具";
const HOT_LANGUAGE = process.env.HOT_POST_LANGUAGE || "中文";
const MAX_ITEMS = Number.parseInt(process.env.HOT_MAX_ITEMS || "14", 10);
const DEFAULT_MODEL = "deepseek-v4-pro";
const DEFAULT_FEEDS = [
  "https://hnrss.org/frontpage",
  "https://github.blog/feed/",
];

const articleSchema = z.object({
  title: z.string().min(8).max(80),
  excerpt: z.string().min(40).max(220),
  categories: z.array(z.string().min(1).max(18)).min(1).max(2),
  tags: z.array(z.string().min(1).max(18)).min(3).max(6),
  usedSourceIds: z.array(z.number().int().positive()).min(3).max(8),
  body: z.string().min(800),
});

const splitEnvList = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeWhitespace = (value) => {
  return String(value || "").replace(/\s+/g, " ").trim();
};

const trimText = (value, maxLength) => {
  const text = normalizeWhitespace(value);
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1)}…`;
};

const stripHtml = (value) => {
  if (!value) {
    return "";
  }

  return normalizeWhitespace(cheerio.load(`<main>${value}</main>`)("main").text());
};

const toNumber = (value) => {
  const text = String(value || "").toLowerCase().replace(/,/g, "");
  const match = text.match(/([\d.]+)\s*k?/);
  if (!match) {
    return 0;
  }

  const number = Number.parseFloat(match[1]);
  return text.includes("k") ? Math.round(number * 1000) : Math.round(number);
};

const fetchText = async (url) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "Blog-Hexo AI hot post generator (+https://github.com/YangRucheng/Blog-Hexo)",
        accept: "text/html,application/rss+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
};

const collectRssItems = async (feedUrls) => {
  const parser = new Parser();
  const settled = await Promise.allSettled(
    feedUrls.map(async (feedUrl) => {
      const xml = await fetchText(feedUrl);
      const feed = await parser.parseString(xml);
      const sourceName = feed.title || new URL(feedUrl).hostname;

      return (feed.items || []).slice(0, 10).map((item, index) => {
        const content = stripHtml(item.contentSnippet || item.content || item.summary || item.description || "");
        const points = toNumber(content.match(/points?:?\s*([\d,]+)/i)?.[1]);

        return {
          source: sourceName,
          title: trimText(item.title, 140),
          url: item.link || item.guid || feedUrl,
          summary: trimText(content, 360),
          publishedAt: item.isoDate || item.pubDate || "",
          score: points || 100 - index,
          kind: "rss",
        };
      });
    }),
  );

  return settled.flatMap((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }

    console.warn(`RSS source skipped: ${feedUrls[index]} (${result.reason.message})`);
    return [];
  });
};

const collectGithubTrending = async () => {
  const languages = splitEnvList(process.env.GITHUB_TRENDING_LANGUAGES, [""]);
  const settled = await Promise.allSettled(
    languages.map(async (language) => {
      const suffix = language ? `/${encodeURIComponent(language)}` : "";
      const url = `https://github.com/trending${suffix}?since=daily`;
      const html = await fetchText(url);
      const $ = cheerio.load(html);

      return $("article.Box-row")
        .slice(0, 10)
        .map((index, article) => {
          const title = normalizeWhitespace($(article).find("h2 a").text()).replace(/\s*\/\s*/g, "/");
          const href = $(article).find("h2 a").attr("href");
          const repoUrl = href ? new URL(href, "https://github.com").toString() : url;
          const description = normalizeWhitespace($(article).find("p").first().text());
          const languageName = normalizeWhitespace($(article).find("[itemprop='programmingLanguage']").text());
          const todayStarsText = normalizeWhitespace($(article).find("span.d-inline-block.float-sm-right").text());
          const totalStarsText = normalizeWhitespace($(article).find("a.Link--muted").first().text());
          const todayStars = toNumber(todayStarsText);
          const totalStars = toNumber(totalStarsText);

          return {
            source: language ? `GitHub Trending / ${language}` : "GitHub Trending",
            title,
            url: repoUrl,
            summary: trimText(
              [description, languageName && `Language: ${languageName}`, todayStarsText].filter(Boolean).join(" | "),
              360,
            ),
            publishedAt: "",
            score: todayStars || totalStars || 100 - index,
            kind: "github_trending",
          };
        })
        .get()
        .filter((item) => item.title);
    }),
  );

  return settled.flatMap((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }

    console.warn(`GitHub Trending skipped: ${languages[index] || "overall"} (${result.reason.message})`);
    return [];
  });
};

const dedupeItems = (items) => {
  const seen = new Set();

  return items.filter((item) => {
    const key = normalizeWhitespace(item.url || item.title).toLowerCase();
    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const pickBalanced = (items, limit) => {
  const groups = new Map();
  for (const item of items.sort((a, b) => b.score - a.score)) {
    const group = groups.get(item.source) || [];
    group.push(item);
    groups.set(item.source, group);
  }

  const picked = [];
  while (picked.length < limit) {
    let changed = false;
    for (const group of groups.values()) {
      const next = group.shift();
      if (next) {
        picked.push(next);
        changed = true;
      }

      if (picked.length >= limit) {
        break;
      }
    }

    if (!changed) {
      break;
    }
  }

  return picked;
};

const collectHotItems = async () => {
  const feedUrls = splitEnvList(process.env.HOT_FEEDS, DEFAULT_FEEDS);
  const [rssItems, githubItems] = await Promise.all([collectRssItems(feedUrls), collectGithubTrending()]);
  const items = dedupeItems([...githubItems, ...rssItems]).filter((item) => item.title && item.url);

  if (items.length < 3) {
    throw new Error(`Only collected ${items.length} hot items; at least 3 are required.`);
  }

  return pickBalanced(items, Number.isFinite(MAX_ITEMS) ? MAX_ITEMS : 14).map((item, index) => ({
    id: index + 1,
    ...item,
  }));
};

const formatDate = (date) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
};

const yamlString = (value) => {
  return JSON.stringify(String(value || "").replace(/\r?\n/g, " "));
};

const yamlList = (values) => {
  return values.map((value) => `  - ${yamlString(value)}`).join("\n");
};

const slugify = (value, fallback) => {
  const slug = String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return slug || fallback;
};

const escapeMarkdown = (value) => {
  return String(value || "").replace(/([\[\]])/g, "\\$1");
};

const buildReferenceList = (items, usedSourceIds) => {
  const byId = new Map(items.map((item) => [item.id, item]));
  const sourceIds = [...new Set(usedSourceIds.filter((id) => byId.has(id)))];
  const finalIds = sourceIds.length >= 3 ? sourceIds : items.slice(0, 5).map((item) => item.id);

  return finalIds
    .map((id) => {
      const item = byId.get(id);
      return `- [来源 ${id}: ${escapeMarkdown(item.title)}](${item.url}) - ${item.source}`;
    })
    .join("\n");
};

const getMessageText = (message) => {
  const content = typeof message === "string" ? message : message?.content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        return part?.text || "";
      })
      .join("\n");
  }

  return String(content || "");
};

const collectJsonCandidates = (text) => {
  const trimmed = text.trim();
  const candidates = [trimmed];
  const fencedJson = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fencedJson?.[1]) {
    candidates.push(fencedJson[1].trim());
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    candidates.push(trimmed.slice(firstBrace, lastBrace + 1));
  }

  return [...new Set(candidates.filter(Boolean))];
};

const parseArticleResponse = (text) => {
  let lastError;

  for (const candidate of collectJsonCandidates(text)) {
    try {
      const parsed = JSON.parse(candidate);
      return articleSchema.parse(parsed);
    } catch (error) {
      lastError = error;
    }
  }

  const preview = text.slice(0, 600).replace(/\s+/g, " ");
  throw new Error(`AI response is not valid article JSON: ${lastError?.message || "unknown error"}\nPreview: ${preview}`);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getErrorStatus = (error) => {
  return error?.status || error?.response?.status || error?.cause?.status;
};

const isRetryableAiError = (error) => {
  const status = getErrorStatus(error);
  const code = error?.code || error?.cause?.code;

  return (
    status === 408 ||
    status === 409 ||
    status === 425 ||
    status === 429 ||
    status === 524 ||
    (Number.isInteger(status) && status >= 500) ||
    ["ECONNRESET", "ETIMEDOUT", "EAI_AGAIN", "ENOTFOUND", "ECONNREFUSED", "UND_ERR_CONNECT_TIMEOUT"].includes(code)
  );
};

const formatRetryError = (error) => {
  const status = getErrorStatus(error);
  const code = error?.code || error?.type || error?.cause?.code;
  const message = error?.message || "unknown error";

  return [status && `status ${status}`, code, message].filter(Boolean).join(" | ");
};

const retryForever = async (label, operation, shouldRetry) => {
  let attempt = 0;

  while (true) {
    try {
      return await operation();
    } catch (error) {
      if (!shouldRetry(error)) {
        throw error;
      }

      attempt += 1;
      const baseDelay = Math.min(300000, 15000 * 2 ** Math.min(attempt - 1, 5));
      const jitter = Math.floor(Math.random() * 5000);
      const delay = baseDelay + jitter;

      console.warn(
        `${label} failed on attempt ${attempt}: ${formatRetryError(error)}. Retrying in ${Math.round(delay / 1000)}s...`,
      );
      await sleep(delay);
    }
  }
};

const generateArticle = async (items) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required unless --dry-run is used.");
  }

  const temperature = process.env.AI_TEMPERATURE
    ? Number.parseFloat(process.env.AI_TEMPERATURE)
    : undefined;
  const modelOptions = {
    apiKey: process.env.OPENAI_API_KEY,
    configuration: process.env.OPENAI_BASE_URL
      ? {
          baseURL: process.env.OPENAI_BASE_URL,
        }
      : undefined,
    model: process.env.AI_MODEL || DEFAULT_MODEL,
  };

  if (Number.isFinite(temperature)) {
    modelOptions.temperature = temperature;
  }

  const model = new ChatOpenAI(modelOptions);

  const now = formatDate(new Date());
  const sourceContext = JSON.stringify(
    items.map((item) => ({
      id: item.id,
      source: item.source,
      title: item.title,
      url: item.url,
      summary: item.summary,
      publishedAt: item.publishedAt,
      score: item.score,
    })),
    null,
    2,
  );

  const messages = [
    [
      "system",
      [
        "你是一个中文技术博客作者，擅长把当天的开发者热点整理成有观点的博客。",
        "只允许使用用户提供的来源材料，不要编造事实、数据、链接或引用。",
        "输出必须是适合 Hexo 的 Markdown 正文片段，不要包含 YAML front matter，不要包含参考来源列表。",
        "你必须只返回一个合法 JSON 对象，不要使用 Markdown 代码块，不要在 JSON 前后添加解释。",
      ].join("\n"),
    ],
    [
      "human",
      [
        `当前时间：${now}（${TIME_ZONE}）`,
        `博客主题偏好：${HOT_TOPIC}`,
        `写作语言：${HOT_LANGUAGE}`,
        "",
        "请从下面的网络热点候选中选择一个清晰角度，写一篇 1000-1800 字的博客。",
        "要求：",
        "1. 标题自然，不要标题党。",
        "2. 开头先给出可读的判断，而不是简单罗列新闻。",
        "3. 正文可以综合多个来源，但要在相关段落用「来源 1」「来源 2」这类文字标明依据。",
        "4. 适合个人博客发布，语气克制、清楚、有一点观点。",
        "5. 如果信息不足，要明确写成趋势观察，不要下结论过度。",
        "6. body 字段只放 Markdown 正文，不要写参考来源列表。",
        "",
        "返回 JSON 字段：",
        "- title: string",
        "- excerpt: string",
        "- categories: string[]，1-2 个",
        "- tags: string[]，3-6 个",
        "- usedSourceIds: number[]，3-8 个，必须来自热点候选 id",
        "- body: string，Markdown 正文",
        "",
        "热点候选 JSON：",
        sourceContext,
      ].join("\n"),
    ],
  ];
  const response = await retryForever("AI request", () => model.invoke(messages), isRetryableAiError);

  return parseArticleResponse(getMessageText(response));
};

const writeArticle = async (article, items) => {
  const now = new Date();
  const date = formatDate(now);
  const day = date.slice(0, 10);
  const fallbackSlug = `ai-hot-topic-${day.replaceAll("-", "")}`;
  const filename = `${day}-${slugify(article.title, fallbackSlug)}.md`;
  const outputPath = path.join(POSTS_DIR, filename);
  const referenceList = buildReferenceList(items, article.usedSourceIds);
  const body = [
    "---",
    `title: ${yamlString(article.title)}`,
    `date: ${date}`,
    `updated: ${date}`,
    "categories:",
    yamlList(article.categories),
    "tags:",
    yamlList(article.tags),
    "ai_generated: true",
    `source_count: ${items.length}`,
    "---",
    "",
    article.excerpt.trim(),
    "",
    "<!-- more -->",
    "",
    article.body.trim(),
    "",
    "## 参考来源",
    "",
    referenceList,
    "",
  ].join("\n");

  await mkdir(POSTS_DIR, { recursive: true });
  await writeFile(outputPath, body, "utf8");
  return outputPath;
};

const main = async () => {
  const items = await collectHotItems();

  console.log(`Collected ${items.length} hot items:`);
  for (const item of items) {
    console.log(`- [${item.id}] ${item.title} (${item.source})`);
  }

  if (DRY_RUN) {
    console.log("\nDry run enabled; skipped AI generation and file writing.");
    return;
  }

  const article = await generateArticle(items);
  const outputPath = await writeArticle(article, items);
  console.log(`Generated post: ${path.relative(ROOT_DIR, outputPath)}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
