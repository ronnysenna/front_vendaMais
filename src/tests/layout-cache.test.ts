// Este arquivo implementa testes automatizados para verificar se o layout está atualizado
// e se os mecanismos anti-cache estão funcionando corretamente

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { chromium, Browser, Page } from "playwright-chromium";

describe("Testes de layout e cache", () => {
  let browser: Browser;
  let page: Page;

  // Configuração antes de todos os testes
  beforeAll(async () => {
    browser = await chromium.launch();
  });

  // Limpeza após todos os testes
  afterAll(async () => {
    await browser.close();
  });

  // Antes de cada teste, cria uma nova página
  beforeEach(async () => {
    page = await browser.newPage();
  });

  // Após cada teste, fecha a página
  afterEach(async () => {
    await page.close();
  });

  it("deve carregar a página inicial com o build ID correto", async () => {
    await page.goto("http://localhost:3000");

    // Verifica se a meta tag do build ID está presente
    const buildIdMeta = await page.$('meta[name="build-id"]');
    expect(buildIdMeta).toBeTruthy();

    // Verifica o valor do build ID
    const buildId = await buildIdMeta?.getAttribute("content");
    expect(buildId).toBeTruthy();
    expect(buildId?.startsWith("build-")).toBe(true);
  });

  it("deve ter cabeçalhos anti-cache nas respostas", async () => {
    const response = await page.goto("http://localhost:3000");

    // Verifica os cabeçalhos anti-cache
    const headers = response?.headers();
    expect(headers).toBeTruthy();

    if (headers) {
      expect(headers["cache-control"]).toContain("no-store");
      expect(headers["pragma"]).toBe("no-cache");
      expect(headers["expires"]).toBe("0");
    }
  });

  it("endpoint /api/version deve retornar o build ID atual", async () => {
    const response = await page.goto("http://localhost:3000/api/version");
    const body = await response?.text();

    expect(body).toBeTruthy();

    if (body) {
      const data = JSON.parse(body);
      expect(data.buildId).toBeTruthy();
      expect(data.buildId.startsWith("build-")).toBe(true);
    }
  });
});
