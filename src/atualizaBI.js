const puppeteer = require('puppeteer');

// Função de delay
function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

async function atualiza_grafico() {
    // Lançando o browser
    const browser = await puppeteer.launch({ headless: false });
    const [page] = await browser.pages();
    await page.setViewport({ width: 1280, height: 720 });

    try {
        // Navegar para a URL desejada
        await page.goto('https://app.powerbi.com/groups/me/list?experience=power-bi', { waitUntil: 'networkidle2' });

        // Aguardando até o botão de "Atualizar agora" estar disponível
        await delay(5000)


        // Verificando se o botão foi encontrado
        await page.waitForSelector('input[id="email"]')
        await page.type('input[id="email"]', 'importacao@levnegocios.com.br')
        await page.keyboard.press('Enter')
        await page.waitForSelector('input[name="passwd"]')
        await page.type('input[name="passwd"]', 'koP319m@')
        await page.keyboard.press('Enter')
        await delay(2000)
        await page.keyboard.press('Enter')


        // Clicando no botão de atualização

        await page.waitForSelector('button[class="new-button ng-star-inserted"]')
        await delay(3000)
    
        const mouseOverElementSelector = '#artifactContentView > div.cdk-virtual-scroll-content-wrapper > div:nth-child(4) > div:nth-child(4) > div > span';
        const clickElementSelector = '#artifactContentView > div.cdk-virtual-scroll-content-wrapper > div:nth-child(4) > div:nth-child(4) > div > span > button:nth-child(2)';

        // Obtenha o elemento do mouse-over e mova o mouse para ele
        const mouseOverElement = await page.$(mouseOverElementSelector);
        const boundingBox = await mouseOverElement.boundingBox();
        await page.mouse.move(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);

        // Aguarde o mouse-over para que o elemento de clique apareça
        await delay(1000); // Ajuste o tempo conforme necessário

        // Clique no elemento que aparece após o mouse-over
        await page.click(clickElementSelector);

        return 'OK';

    } catch (error) {
        console.log("Erro ao atualizar gráfico:", error);
        return 'Erro ao atualizar gráfico: ' + error.message;
    }
}

// Exportando a função para uso em outro lugar se necessário
module.exports = { atualiza_grafico };
